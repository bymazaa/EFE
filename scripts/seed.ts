/**
 * Super Admin Seed
 *
 * pnpm seed
 *
 * Reads the following values from .env.local:
 *   SEED_ADMIN_NAME
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 *
 * Safe to run multiple times:
 * - Existing super admin is not duplicated.
 * - Existing admin password is never overwritten.
 * - Existing admin account is never automatically promoted.
 */

import { config } from 'dotenv';

// Load env before importing anything
// that may read process.env.
config({
    path: '.env',
});

async function main() {
    // Dynamic imports so dotenv loads first.
    const mongoose =
        (await import('mongoose')).default;

    const { connectDB } =
        await import('@/lib/mongodb');

    const { Admin } =
        await import('@/models/Admin');

    const { hashPassword } =
        await import('@/lib/password');

    const { emailSchema } =
        await import('@/lib/validation/common.schema');

    const { passwordSchema } =
        await import('@/lib/validation/auth.schema');

    /* ============================================================
       1. Read environment variables
    ============================================================ */

    const rawName =
        process.env.SEED_ADMIN_NAME?.trim();

    const rawEmail =
        process.env.SEED_ADMIN_EMAIL?.trim();

    const rawPassword =
        process.env.SEED_ADMIN_PASSWORD;

    if (!rawEmail || !rawPassword) {
        throw new Error(
            'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local.',
        );
    }

    const adminName =
        rawName || 'Super Admin';

    /* ============================================================
       2. Validate environment variables
    ============================================================ */

    const emailResult =
        emailSchema.safeParse(rawEmail);

    const passwordResult =
        passwordSchema.safeParse(rawPassword);

    if (!emailResult.success) {
        throw new Error(
            `SEED_ADMIN_EMAIL: ${emailResult.error.issues[0].message}`,
        );
    }

    if (!passwordResult.success) {
        throw new Error(
            `SEED_ADMIN_PASSWORD: ${passwordResult.error.issues[0].message}`,
        );
    }

    const email =
        emailResult.data;

    const password =
        passwordResult.data;

    /* ============================================================
       3. Connect database
    ============================================================ */

    await connectDB();

    console.log(
        'Connected to MongoDB',
    );

    /* ============================================================
       4. Check existing admin
    ============================================================ */

    const existingAdmin =
        await Admin.findOne({
            email,
        });

    if (existingAdmin) {
        if (existingAdmin.isSuperAdmin) {
            console.log(
                `Super admin already exists: ${email}`,
            );
        } else {
            throw new Error(
                `An admin already exists with ${email}, but it is not a super admin. ` +
                    `Seed will not automatically promote an existing account.`,
            );
        }

        await mongoose.disconnect();

        console.log('Done');

        return;
    }

    /* ============================================================
       5. Create Super Admin
    ============================================================ */

    const passwordHash =
        await hashPassword(
            password,
        );

    await Admin.create({
        name: adminName,
        email,
        passwordHash,

        // This is the initial protected account.
        isSuperAdmin: true,

        // Super admin starts active.
        status: 'active',

        tokenVersion: 0,
        failedLoginAttempts: 0,
        lockUntil: null,

        resetPasswordTokenHash: null,
        resetPasswordTokenExpiresAt: null,
    });

    console.log(
        `Super admin created: ${email}`,
    );

    /* ============================================================
       6. Disconnect
    ============================================================ */

    await mongoose.disconnect();

    console.log('Done');
}

main().catch((error) => {
    console.error(
        'Seed failed:',
        error instanceof Error
            ? error.message
            : error,
    );

    process.exit(1);
});