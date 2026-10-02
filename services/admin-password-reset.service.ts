
import 'server-only';

import { randomBytes } from 'crypto';

import { connectDB } from '@/lib/mongodb';

import { Admin } from '@/models/Admin';

import { hashPassword } from '@/lib/password';

import { RESET_TOKEN_EXPIRES_IN_MS } from '@/lib/constants';

import { hashConfirmationToken } from '@/lib/token';

import { sendPasswordResetEmail } from '@/lib/mail';

/* =========================================================
 * Token helpers
 * ========================================================= */

/**
 * Generates a cryptographically secure raw reset token.
 *
 * Only the hash of this token is stored in MongoDB.
 * The raw token is sent to the admin through email.
 */
function generatePasswordResetToken(): {
    rawToken: string;
    tokenHash: string;
} {
    const rawToken = randomBytes(32).toString('hex');

    const tokenHash =
        hashConfirmationToken(rawToken);

    return {
        rawToken,
        tokenHash,
    };
}

/* =========================================================
 * Password Reset Email
 * ========================================================= */

/**
 * Sends the admin password-reset email.
 *
 * The actual email template and Resend integration live
 * inside `sendPasswordResetEmail()`.
 */
async function sendAdminPasswordResetEmail({
    email,
    resetUrl,
}: {
    email: string;
    resetUrl: string;
}): Promise<void> {
    await sendPasswordResetEmail({
        email,
        resetUrl,
    });
}

/* =========================================================
 * Create Password Reset Request
 * ========================================================= */

/**
 * Creates a password-reset request for an admin account.
 *
 * Security:
 * - Email is normalized before lookup.
 * - Response is identical whether the account exists or not.
 * - Raw token is never stored in the database.
 * - Only the token hash is stored.
 * - Reset token automatically expires.
 * - If email sending fails, the reset token is removed.
 */
export async function createPasswordResetRequest(
    email: string,
): Promise<{
    message: string;
}> {
    const normalizedEmail =
        email.trim().toLowerCase();

    await connectDB();

    const admin = await Admin.findOne({
        email: normalizedEmail,
    });

    /**
     * Keep the response identical whether the email
     * exists or not. This prevents admin account
     * enumeration.
     */
    const message =
        'If an account exists for this email, a password reset link has been sent.';

    if (!admin) {
        return {
            message,
        };
    }

    /**
     * Generate a cryptographically secure token.
     *
     * Only the hash is stored in MongoDB.
     */
    const {
        rawToken,
        tokenHash,
    } = generatePasswordResetToken();

    const expiresAt = new Date(
        Date.now() +
            RESET_TOKEN_EXPIRES_IN_MS,
    );

    admin.resetPasswordTokenHash =
        tokenHash;

    admin.resetPasswordTokenExpiresAt =
        expiresAt;

    await admin.save();

    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
        /**
         * Remove the token if the application URL
         * is not configured.
         */
        admin.resetPasswordTokenHash = null;

        admin.resetPasswordTokenExpiresAt =
            null;

        await admin.save();

        throw new Error(
            'NEXT_PUBLIC_SITE_URL is not configured.',
        );
    }

    const resetUrl = new URL(
        '/admin/reset-password',
        baseUrl,
    );

    resetUrl.searchParams.set(
        'token',
        rawToken,
    );

    try {
        await sendAdminPasswordResetEmail({
            email: admin.email,
            resetUrl: resetUrl.toString(),
        });
    } catch (error) {
        /**
         * Do not leave a valid reset token behind
         * when the email could not be delivered.
         */
        admin.resetPasswordTokenHash = null;

        admin.resetPasswordTokenExpiresAt =
            null;

        await admin.save();

        throw error;
    }

    return {
        message,
    };
}

/* =========================================================
 * Reset Admin Password
 * ========================================================= */

/**
 * Resets an admin password using a valid reset token.
 *
 * The token must:
 * - match the stored hash
 * - not be expired
 *
 * After a successful reset:
 * - password is replaced
 * - failed login state is cleared
 * - reset token is destroyed
 * - tokenVersion is incremented to invalidate
 *   existing sessions
 */
export async function resetAdminPassword({
    token,
    password,
}: {
    token: string;
    password: string;
}): Promise<{
    message: string;
}> {
    const normalizedToken =
        token.trim();

    if (!normalizedToken) {
        throw new Error(
            'Invalid or expired reset link.',
        );
    }

    const tokenHash =
        hashConfirmationToken(
            normalizedToken,
        );

    await connectDB();

    const newPasswordHash =
        await hashPassword(password);

    const updatedAdmin =
        await Admin.findOneAndUpdate(
            {
                resetPasswordTokenHash:
                    tokenHash,

                resetPasswordTokenExpiresAt: {
                    $gt: new Date(),
                },
            },
            {
                $set: {
                    passwordHash:
                        newPasswordHash,

                    failedLoginAttempts: 0,

                    lockUntil: null,

                    resetPasswordTokenHash:
                        null,

                    resetPasswordTokenExpiresAt:
                        null,
                },

                /**
                 * Invalidate all existing sessions
                 * after a password reset.
                 */
                $inc: {
                    tokenVersion: 1,
                },
            },
            {
                new: true,
            },
        );

    if (!updatedAdmin) {
        throw new Error(
            'Invalid or expired reset link.',
        );
    }

    return {
        message:
            'Password reset successfully. You can now sign in.',
    };
}

