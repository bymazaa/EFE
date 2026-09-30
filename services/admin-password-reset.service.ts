import 'server-only';

import {
    createHash,
    randomBytes,
} from 'crypto';

import { connectDB } from '@/lib/mongodb';

import { Admin } from '@/models/Admin';

import { hashPassword } from '@/lib/password';
import { RESET_TOKEN_EXPIRES_IN_MS } from '@/lib/constants';


/* =========================================================
   Token helpers
========================================================= */

function hashResetToken(token: string) {
    return createHash('sha256')
        .update(token)
        .digest('hex');
}

/* =========================================================
   Password Reset Email
========================================================= */

async function sendPasswordResetEmail({
    email,
    resetUrl,
}: {
    email: string;
    resetUrl: string;
}) {
 
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.MAIL_FROM;

    if (!apiKey || !fromEmail) {
        throw new Error(
            'Password reset email configuration is missing.',
        );
    }

    const response = await fetch(
        'https://api.resend.com/emails',
        {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                from: fromEmail,
                to: email,
                subject: 'Reset your admin password',

                html: `
                    <div
                        style="
                            max-width: 560px;
                            margin: 0 auto;
                            padding: 24px;
                            font-family: Arial, sans-serif;
                            color: #2f211a;
                        "
                    >
                        <h2
                            style="
                                margin: 0 0 16px;
                                font-size: 24px;
                                line-height: 1.3;
                            "
                        >
                            Reset your password
                        </h2>

                        <p
                            style="
                                margin: 0 0 12px;
                                line-height: 1.6;
                                color: #5f5148;
                            "
                        >
                            We received a request to reset the password
                            for your admin account.
                        </p>

                        <p
                            style="
                                margin: 0 0 24px;
                                line-height: 1.6;
                                color: #5f5148;
                            "
                        >
                            This reset link will expire in
                            <strong>15 minutes</strong>.
                        </p>

                        <!-- Reset button -->

                        <div style="margin: 28px 0;">
                            <a
                                href="${resetUrl}"
                                style="
                                    display: inline-block;
                                    padding: 12px 20px;
                                    border-radius: 8px;
                                    background-color: #d97706;
                                    color: #ffffff;
                                    text-decoration: none;
                                    font-size: 14px;
                                    font-weight: 600;
                                    line-height: 1;
                                "
                            >
                                Reset password
                            </a>
                        </div>

                        <!-- Fallback link -->

                        <p
                            style="
                                margin: 0 0 8px;
                                font-size: 13px;
                                font-weight: 600;
                                color: #5f5148;
                            "
                        >
                            Button not working?
                        </p>

                        <p
                            style="
                                margin: 0;
                                font-size: 13px;
                                line-height: 1.6;
                                color: #8b7c72;
                            "
                        >
                            Copy and paste this link into your browser:
                        </p>

                        <p
                            style="
                                margin: 8px 0 24px;
                                padding: 10px 12px;
                                border-radius: 6px;
                                background-color: #fff7ed;
                                border: 1px solid #fed7aa;
                                word-break: break-all;
                            "
                        >
                            <a
                                href="${resetUrl}"
                                style="
                                    color: #c2410c;
                                    text-decoration: underline;
                                    font-size: 12px;
                                    line-height: 1.6;
                                "
                            >
                                ${resetUrl}
                            </a>
                        </p>

                        <p
                            style="
                                margin: 0;
                                line-height: 1.6;
                                font-size: 13px;
                                color: #8b7c72;
                            "
                        >
                            If you did not request a password reset,
                            you can safely ignore this email.
                        </p>
                    </div>
                `,
            }),
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to send password reset email.',
        );
    }
}

/* =========================================================
   Create Password Reset Request
========================================================= */

export async function createPasswordResetRequest(
    email: string,
) {
    const normalizedEmail = email
        .trim()
        .toLowerCase();

    await connectDB();

    const admin = await Admin.findOne({
        email: normalizedEmail,
    });

    /*
     * Keep the response identical whether the email exists
     * or not. This prevents admin account enumeration.
     */
    const message =
        'If an account exists for this email, a password reset link has been sent.';

    if (!admin) {
        return {
            message,
        };
    }

    /*
     * Generate raw token.
     * Only the hash will be stored in MongoDB.
     */
    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = hashResetToken(
        rawToken,
    );


    const expiresAt = new Date(
        Date.now() + RESET_TOKEN_EXPIRES_IN_MS,
    );

    admin.resetPasswordTokenHash = tokenHash;

    admin.resetPasswordTokenExpiresAt =
        expiresAt;

    await admin.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
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

    await sendPasswordResetEmail({
        email: admin.email,
        resetUrl: resetUrl.toString(),
    });

    return {
        message,
    };
}

/* =========================================================
   Reset Admin Password
========================================================= */

export async function resetAdminPassword({
    token,
    password,
}: {
    token: string;
    password: string;
}) {
    const normalizedToken = token.trim();
    const tokenHash = hashResetToken(normalizedToken);

    await connectDB();

    const newPasswordHash = await hashPassword(password);

    const updatedAdmin = await Admin.findOneAndUpdate(
        {
            resetPasswordTokenHash: tokenHash,
            resetPasswordTokenExpiresAt: {
                $gt: new Date(),
            },
        },
        {
            $set: {
                passwordHash: newPasswordHash,
                failedLoginAttempts: 0,
                lockUntil: null,
                resetPasswordTokenHash: null,
                resetPasswordTokenExpiresAt: null,
            },
            $inc: {
                tokenVersion: 1,
            },
        },
        {
            new: true,
        },
    );

    if (!updatedAdmin) {
        throw new Error('Invalid or expired reset link.');
    }

    return {
        message:
            'Password reset successfully. You can now sign in.',
    };
}