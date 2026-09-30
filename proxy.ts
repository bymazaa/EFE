import {
    NextResponse,
    type NextRequest,
} from 'next/server';

import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import { verifyToken } from '@/lib/token';
import { SESSION_COOKIE } from './lib/constants';

// *Next.js 16:*

// *middleware.ts -> proxy.ts*

//
// *Proxy is the first authentication gate.*
//
// *It checks:*
// *- JWT*
// *- admin existence*
// *- tokenVersion*
// *- account status*
//
// *Real authorization still remains in*
// *requireAdmin() / Server Actions as defense in depth.
//

const LOGIN_PATH = '/admin/login';
const RESET_PASSWORD_PATH = '/admin/reset-password';
const ADMIN_HOME_PATH = '/admin';

export async function proxy(
    request: NextRequest,
) {
    const { pathname } = request.nextUrl;

    const isLoginPage =
        pathname === LOGIN_PATH;

    const isResetPasswordPage =
        pathname === RESET_PASSWORD_PATH;

    const isPublicAdminPage =
        isLoginPage || isResetPasswordPage;

    const token =
        request.cookies.get(
            SESSION_COOKIE,
        )?.value;

    const session =
        await verifyToken(token);

    /*
     * No valid session.
     *
     * Login page and reset-password page
     * can continue normally.
     *
     * Any other /admin route goes to login.
     */
    if (!session) {
        if (isPublicAdminPage) {
            return NextResponse.next();
        }

        const response =
            NextResponse.redirect(
                new URL(
                    LOGIN_PATH,
                    request.url,
                ),
            );

        // *Clean up an invalid/stale cookie.*
        response.cookies.delete(
            SESSION_COOKIE,
        );

        return response;
    }

    try {
        await connectDB();

        const admin =
            await Admin.findById(
                session.adminId,
            )
                .select(
                    'tokenVersion status',
                )
                .lean();

        /*
         * Admin deleted or no longer exists.
         */
        if (!admin) {
            const response =
                isPublicAdminPage
                    ? NextResponse.next()
                    : NextResponse.redirect(
                          new URL(
                              LOGIN_PATH,
                              request.url,
                          ),
                      );

            response.cookies.delete(
                SESSION_COOKIE,
            );

            return response;
        }

        /*
         * Old session after password change
         * or another token invalidation.
         */
        if (
            admin.tokenVersion !==
            session.tokenVersion
        ) {
            const response =
                isPublicAdminPage
                    ? NextResponse.next()
                    : NextResponse.redirect(
                          new URL(
                              LOGIN_PATH,
                              request.url,
                          ),
                      );

            response.cookies.delete(
                SESSION_COOKIE,
            );

            return response;
        }

        /*
         * Blocked account.
         *
         * Destroy the browser session immediately
         * and send the user to login.
         */
        if (admin.status !== 'active') {
            const response =
                isPublicAdminPage
                    ? NextResponse.next()
                    : NextResponse.redirect(
                          new URL(
                              LOGIN_PATH,
                              request.url,
                          ),
                      );

            response.cookies.delete(
                SESSION_COOKIE,
            );

            return response;
        }

        /*
         * Valid active session.
         *
         * If an authenticated user tries to open
         * the login page, send them to dashboard.
         */
        if (isLoginPage) {
            return NextResponse.redirect(
                new URL(
                    ADMIN_HOME_PATH,
                    request.url,
                ),
            );
        }

        /*
         * Reset-password page must remain accessible
         * even when the user already has a valid session.
         */
        if (isResetPasswordPage) {
            return NextResponse.next();
        }

        return NextResponse.next();
    } catch (error) {
        /*
         * Database / infrastructure error.
         *
         * Fail closed for protected admin routes.
         *
         * We do NOT destroy a potentially valid session
         * just because MongoDB temporarily failed.
         */
        console.error(
            'Admin proxy error:',
            error,
        );

        /*
         * Public admin pages can continue normally
         * even if database verification fails.
         */
        if (isPublicAdminPage) {
            return NextResponse.next();
        }

        return NextResponse.redirect(
            new URL(
                LOGIN_PATH,
                request.url,
            ),
        );
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};