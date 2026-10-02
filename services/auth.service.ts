import { connectDB } from '@/lib/mongodb';

import { Admin } from '@/models/Admin';

import {
    hashPassword,
    verifyPassword,
} from '@/lib/password';

import {
    createSession,
    destroySession,
} from '@/lib/auth';

import {
    loginSchema,
    updateProfileSchema,
    changePasswordSchema,
} from '@/lib/validation/auth.schema';

import {
    type ActionResult,
    fail,
    ok,
    validationFail,
    handleError,
} from '@/lib/action-result';
import { sendPasswordChangedEmail } from '@/lib/mail';

const MAX_FAILED_ATTEMPTS = 5;

const LOCK_DURATION_MS =
    15 * 60 * 1000; // 15 minutes

/* ------------------------------------------------------------------
   Login / logout
------------------------------------------------------------------- */

/**
 * /admin/login
 *
 * Validates credentials, checks brute-force lock,
 * verifies account status, and creates a session.
 */
export async function login(
    data: unknown,
): Promise<ActionResult> {
    const parsed =
        loginSchema.safeParse(data);

    if (!parsed.success) {
        return validationFail(
            parsed.error,
        );
    }

    const {
        email,
        password,
    } = parsed.data;

    const invalidCredentials = () =>
        fail(
            'Invalid email or password.',
        );

    try {
        await connectDB();

        const admin =
            await Admin.findOne({
                email,
            }).select(
                '+passwordHash name email tokenVersion failedLoginAttempts lockUntil status isSuperAdmin',
            );

        if (!admin) {
            return invalidCredentials();
        }

        /* ----------------------------------------------------------
           Account status protection
        ----------------------------------------------------------- */

        if (admin.status === 'blocked') {
            return fail(
                'Your account has been blocked. Please contact the administrator.',
            );
        }

        /*
         * Only active accounts are allowed to continue.
         */
        if (admin.status !== 'active') {
            return invalidCredentials();
        }

        /* ----------------------------------------------------------
           Temporary login lock
        ----------------------------------------------------------- */

        if (
            admin.lockUntil &&
            admin.lockUntil.getTime() >
                Date.now()
        ) {
            return fail(
                'Too many failed attempts. Please try again in a few minutes.',
            );
        }

        /*
         * Clear an expired lock before continuing.
         */
        if (
            admin.lockUntil &&
            admin.lockUntil.getTime() <=
                Date.now()
        ) {
            admin.lockUntil = null;
            admin.failedLoginAttempts = 0;

            await admin.save();
        }

        /* ----------------------------------------------------------
           Password verification
        ----------------------------------------------------------- */

        const validPassword =
            await verifyPassword(
                password,
                admin.passwordHash,
            );

        if (!validPassword) {
            const attempts =
                admin.failedLoginAttempts + 1;

            const locked =
                attempts >=
                MAX_FAILED_ATTEMPTS;

            if (locked) {
                admin.failedLoginAttempts = 0;

                admin.lockUntil =
                    new Date(
                        Date.now() +
                            LOCK_DURATION_MS,
                    );
            } else {
                admin.failedLoginAttempts =
                    attempts;

                admin.lockUntil = null;
            }

            await admin.save();

            return locked
                ? fail(
                      'Too many failed attempts. Please try again in a few minutes.',
                  )
                : invalidCredentials();
        }

        /* ----------------------------------------------------------
           Successful login
        ----------------------------------------------------------- */

        admin.failedLoginAttempts = 0;
        admin.lockUntil = null;

        await admin.save();

        await createSession({
            id: admin._id.toString(),
            tokenVersion:
                admin.tokenVersion,
        });

        return ok(
            'Logged in successfully.',
        );
    } catch (error) {
        return handleError(error);
    }
}

/**
 * /admin/logout
 */
export async function logout(): Promise<ActionResult> {
    try {
        await destroySession();

        return ok(
            'Logged out successfully.',
        );
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------
   Account management
------------------------------------------------------------------- */

/**
 * /admin/account
 *
 * Update the current admin name.
 *
 * Important:
 * The caller should pass the authenticated
 * admin's email from the server-side action.
 */
export async function updateProfile(
    adminEmail: string,
    data: unknown,
): Promise<ActionResult> {
    const parsed =
        updateProfileSchema.safeParse(
            data,
        );

    if (!parsed.success) {
        return validationFail(
            parsed.error,
        );
    }

    try {
        await connectDB();

        const admin =
            await Admin.findOne({
                email: adminEmail,
            }).select(
                'name email status isSuperAdmin',
            );

        if (!admin) {
            return fail(
                'Account not found.',
            );
        }

        /* ----------------------------------------------------------
           Account protection
        ----------------------------------------------------------- */

        if (
            admin.status !== 'active'
        ) {
            return fail(
                'This account is not active.',
            );
        }

        const newName =
            parsed.data.name.trim();

        const currentName =
            admin.name.trim();

        if (newName === currentName) {
            return fail(
                'No changes were made.',
            );
        }

        await Admin.updateOne(
            {
                _id: admin._id,
                status: 'active',
            },
            {
                $set: {
                    name: newName,
                },
            },
            {
                runValidators: true,
            },
        );

        return ok(
            'Profile updated successfully.',
        );
    } catch (error) {
        return handleError(error);
    }
}

/**
 * /admin/account
 *
 * Change password.
 *
 * Requires the current password.
 * Changing password increments tokenVersion,
 * invalidating old sessions.
 */
export async function changePassword(
    adminEmail: string,
    data: unknown,
): Promise<ActionResult> {
    const parsed =
        changePasswordSchema.safeParse(data);

    if (!parsed.success) {
        return validationFail(
            parsed.error,
        );
    }

    try {
        await connectDB();

        const admin =
            await Admin.findOne({
                email: adminEmail,
            }).select(
                '+passwordHash tokenVersion failedLoginAttempts lockUntil status isSuperAdmin',
            );

        if (!admin) {
            return fail(
                'Account not found.',
            );
        }

        /* ----------------------------------------------------------
         * Account protection
         * ---------------------------------------------------------- */
        if (admin.status !== 'active') {
            return fail(
                'This account is not active.',
            );
        }

        /* ----------------------------------------------------------
         * Current password
         * ---------------------------------------------------------- */
        const validCurrent =
            await verifyPassword(
                parsed.data.currentPassword,
                admin.passwordHash,
            );

        if (!validCurrent) {
            return fail(
                'Current password is incorrect.',
                {
                    currentPassword: [
                        'Current password is incorrect.',
                    ],
                },
            );
        }

        /* ----------------------------------------------------------
         * Password update
         * ---------------------------------------------------------- */
        admin.passwordHash =
            await hashPassword(
                parsed.data.newPassword,
            );

        /*
         * Invalidates all old JWT/session tokens.
         */
        admin.tokenVersion += 1;

        /*
         * Reset brute-force state.
         */
        admin.failedLoginAttempts = 0;
        admin.lockUntil = null;

        /*
         * Clear any existing password-reset
         * state if present.
         */
        admin.resetPasswordTokenHash = null;
        admin.resetPasswordTokenExpiresAt = null;

        await admin.save();

        /* ----------------------------------------------------------
         * Password changed email
         * ---------------------------------------------------------- */
        try {
            await sendPasswordChangedEmail({
                email: admin.email,
                name: admin.name,
            });
        } catch (error) {
            /*
             * Email failure should not undo a successful
             * password change.
             */
            console.error(
                'Failed to send password changed email:',
                error,
            );
        }

        /*
         * Destroy current session too.
         * User must log in again.
         */
        await destroySession();

        return ok(
            'Password changed successfully. Please log in again.',
        );
    } catch (error) {
        return handleError(error);
    }
}