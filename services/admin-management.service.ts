import {
    Types,
    type HydratedDocument,
} from 'mongoose';

import { connectDB } from '@/lib/mongodb';

import { hashPassword } from '@/lib/password';

import {
    Admin,
    type AdminDB,
    type AdminStatus,
} from '@/models/Admin';
import { sendAdminCreatedEmail } from '@/lib/mail';

type AdminDocument = HydratedDocument<AdminDB>;

type AdminWithTimestamps = AdminDB & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

export type AdminDTO = {
    id: string;
    name: string;
    email: string;
    status: AdminStatus;
    isSuperAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type AdminListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdminStatus;
};

export type CreateAdminInput = {
    name: string;
    email: string;
    password: string;
};

/* ============================================================
   Helpers
============================================================ */

function assertObjectId(
    id: string,
    field = 'Admin ID',
) {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error(
            `Invalid ${field}.`,
        );
    }
}

function toDTO(
    admin: AdminDocument | AdminWithTimestamps,
): AdminDTO {
    const data =
        'toObject' in admin
            ? admin.toObject()
            : admin;

    const normalized =
        data as AdminWithTimestamps;

    return {
        id: normalized._id.toString(),
        name: normalized.name,
        email: normalized.email,
        status: normalized.status,
        isSuperAdmin:
            normalized.isSuperAdmin,
        createdAt: normalized.createdAt,
        updatedAt: normalized.updatedAt,
    };
}

async function getAdminDocument(
    adminId: string,
) {
    assertObjectId(adminId);

    const admin =
        await Admin.findById(adminId);

    if (!admin) {
        throw new Error(
            'Admin user not found.',
        );
    }

    return admin;
}

/**
 * Only an active super admin can
 * manage administrator accounts.
 */
async function assertSuperAdmin(
    actorAdminId: string,
) {
    const actor =
        await getAdminDocument(
            actorAdminId,
        );

    if (
        !actor.isSuperAdmin ||
        actor.status !== 'active'
    ) {
        throw new Error(
            'Only an active super admin can manage users.',
        );
    }

    return actor;
}

/**
 * Super admin accounts are protected
 * from management mutations.
 */
function assertTargetIsNotSuperAdmin(
    target: AdminDocument,
) {
    if (target.isSuperAdmin) {
        throw new Error(
            'The super admin account is protected and cannot be modified or deleted.',
        );
    }
}

/**
 * Prevent an actor from mutating
 * their own account through user management.
 */
function assertNotSelf(
    actor: AdminDocument,
    target: AdminDocument,
    action: string,
) {
    if (
        actor._id.toString() ===
        target._id.toString()
    ) {
        throw new Error(
            `You cannot ${action} your own account.`,
        );
    }
}

/* ============================================================
   Get Single Admin
============================================================ */

/**
 * Get a single admin without exposing
 * password/reset-token fields.
 */
export async function getAdminById(
    adminId: string,
): Promise<AdminDTO> {
    await connectDB();

    const admin =
        await getAdminDocument(adminId);

    return toDTO(admin);
}

/* ============================================================
   Get Admin List
============================================================ */

/**
 * Get paginated admin users.
 *
 * Supports:
 * - pagination
 * - search by name/email
 * - status filtering
 *
 * Super admins are included so the UI
 * can display protected accounts.
 */
export async function getAdmins(
    query: AdminListQuery = {},
) {
    await connectDB();

    const page = Math.max(
        1,
        Math.floor(query.page ?? 1),
    );

    const limit = Math.min(
        100,
        Math.max(
            1,
            Math.floor(query.limit ?? 20),
        ),
    );

    const search =
        query.search?.trim() ?? '';

    const filter: Record<
        string,
        unknown
    > = {};

    if (search) {
        const escapedSearch =
            search.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            );

        const regex = new RegExp(
            escapedSearch,
            'i',
        );

        filter.$or = [
            {
                name: regex,
            },
            {
                email: regex,
            },
        ];
    }

    if (query.status) {
        filter.status = query.status;
    }

    const skip =
        (page - 1) * limit;

    const [admins, total] =
        await Promise.all([
            Admin.find(filter)
                .sort({
                    isSuperAdmin: -1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            Admin.countDocuments(filter),
        ]);

    return {
        data: admins.map((admin) =>
            toDTO(
                admin as AdminWithTimestamps,
            ),
        ),

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit,
            ),
        },
    };
}

/* ============================================================
   Create Admin
============================================================ */

/**
 * Create a normal admin user.
 *
 * Important:
 * - isSuperAdmin is never accepted from input.
 * - Every newly created admin is normal admin.
 * - New admins start as active.
 */




export async function createAdmin(
    actorAdminId: string,
    input: CreateAdminInput,
): Promise<AdminDTO> {
    await connectDB();

    await assertSuperAdmin(actorAdminId);

    const name = input.name.trim();

    const email =
        input.email.trim().toLowerCase();

    const password = input.password;

    if (!name) {
        throw new Error(
            'Admin name is required.',
        );
    }

    if (!email) {
        throw new Error(
            'Admin email is required.',
        );
    }

    if (!password) {
        throw new Error(
            'Admin password is required.',
        );
    }

    const existingAdmin =
        await Admin.exists({
            email,
        });

    if (existingAdmin) {
        throw new Error(
            'An admin with this email already exists.',
        );
    }

    const passwordHash =
        await hashPassword(password);

    try {
        const admin =
            await Admin.create({
                name,
                email,
                passwordHash,

                // New users are always normal admins.
                isSuperAdmin: false,

                // New admins start active.
                status: 'active',

                tokenVersion: 0,

                failedLoginAttempts: 0,

                lockUntil: null,

                resetPasswordTokenHash: null,

                resetPasswordTokenExpiresAt: null,
            });

        /*
         * Send credentials after the admin
         * has been successfully created.
         */
        await sendAdminCreatedEmail({
            email: admin.email,
            name: admin.name,
            password,
        });

        return toDTO(admin);
    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code?: number }).code === 11000
        ) {
            throw new Error(
                'An admin with this email already exists.',
            );
        }

        throw error;
    }
}


/* ============================================================
   Set Admin Status
============================================================ */

/**
 * Activate or block a normal admin.
 *
 * Super admin accounts are protected.
 */
export async function setAdminStatus(
    actorAdminId: string,
    targetAdminId: string,
    status: AdminStatus,
): Promise<AdminDTO> {
    await connectDB();

    const actor =
        await assertSuperAdmin(
            actorAdminId,
        );

    if (
        status !== 'active' &&
        status !== 'blocked'
    ) {
        throw new Error(
            'Invalid admin status.',
        );
    }

    const target =
        await getAdminDocument(
            targetAdminId,
        );

    assertTargetIsNotSuperAdmin(
        target,
    );

    assertNotSelf(
        actor,
        target,
        status === 'blocked'
            ? 'block'
            : 'activate',
    );

    target.status = status;

    await target.save();

    return toDTO(target);
}

/* ============================================================
   Delete Admin
============================================================ */

/**
 * Delete a normal admin.
 *
 * Super admin accounts cannot be deleted.
 */
export async function deleteAdmin(
    actorAdminId: string,
    targetAdminId: string,
): Promise<{
    id: string;
}> {
    await connectDB();

    const actor =
        await assertSuperAdmin(
            actorAdminId,
        );

    const target =
        await getAdminDocument(
            targetAdminId,
        );

    assertTargetIsNotSuperAdmin(
        target,
    );

    assertNotSelf(
        actor,
        target,
        'delete',
    );

    await Admin.deleteOne({
        _id: target._id,
    });

    return {
        id: target._id.toString(),
    };
}