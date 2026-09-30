'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Menu,
    Package2,
    Settings2,
    ShoppingCart,
    UserRound,
    Handshake,
    X,
    UserCog,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { LogoutButton } from '@/app/components/admin/LogoutButton';

const NAV_ITEMS = [
    {
        href: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: '/admin/orders',
        label: 'Orders',
        icon: ShoppingCart,
        exact: false,
    },
    {
        href: '/admin/products',
        label: 'Products',
        icon: Package2,
        exact: false,
    },
    {
        href: '/admin/account',
        label: 'Account',
        icon: UserRound,
        exact: false,
    },
    {
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings2,
        exact: false,
    },
    {
        href: '/admin/admin-management',
        label: 'Admin Management',
        icon: UserCog,
        exact: false,
    },
    {
        href: '/admin/hand-over-guide',
        label: 'Hand Over Guide',
        icon: Handshake,
        exact: false,
    },
] as const;

export function Sidebar({
    brandName,
    adminName,
    adminEmail,
}: {
    brandName: string;
    adminName: string;
    adminEmail: string;
}) {
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Restore sidebar state.
    useEffect(() => {
        const saved = localStorage.getItem(
            'admin-sidebar-collapsed',
        );

        if (saved === 'true') {
            setIsCollapsed(true);
        }
    }, []);

    // Save sidebar state.
    useEffect(() => {
        localStorage.setItem(
            'admin-sidebar-collapsed',
            String(isCollapsed),
        );
    }, [isCollapsed]);

    // Close mobile drawer on route change.
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Lock body scroll while mobile drawer is open.
    useEffect(() => {
        document.body.style.overflow = isOpen
            ? 'hidden'
            : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Escape closes mobile drawer.
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener(
            'keydown',
            onKeyDown,
        );

        return () => {
            window.removeEventListener(
                'keydown',
                onKeyDown,
            );
        };
    }, [isOpen]);

    const isActive = (
        href: string,
        exact?: boolean,
    ) =>
        exact
            ? pathname === href
            : pathname === href ||
              pathname.startsWith(`${href}/`);

    const initials =
        adminName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) =>
                part[0]?.toUpperCase(),
            )
            .join('') || 'A';

    const navList = (
        <nav className="flex flex-1 flex-col gap-1 px-2.5">
            {NAV_ITEMS.map(
                ({
                    href,
                    label,
                    icon: Icon,
                    exact,
                }) => {
                    const active = isActive(
                        href,
                        exact,
                    );

                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() =>
                                setIsOpen(false)
                            }
                            aria-current={
                                active
                                    ? 'page'
                                    : undefined
                            }
                            title={
                                isCollapsed
                                    ? label
                                    : undefined
                            }
                            className={cn(
                                'group relative flex h-10 items-center rounded-md text-[13px] font-medium transition-all duration-200',
                                isCollapsed
                                    ? 'justify-center px-0'
                                    : 'gap-3 px-3',
                                active
                                    ? 'bg-amber-100/70 text-amber-800 shadow-sm'
                                    : 'text-slate-600 hover:bg-amber-50/70 hover:text-slate-900',
                            )}
                        >
                            {/* Active indicator */}
                            <span
                                className={cn(
                                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-600 transition-opacity',
                                    active
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                )}
                            />

                            <Icon
                                className={cn(
                                    'h-[17px] w-[17px] shrink-0 transition-transform duration-200',
                                    active
                                        ? 'text-amber-700'
                                        : 'text-slate-500 group-hover:text-amber-700',
                                    'group-hover:scale-105',
                                )}
                                strokeWidth={
                                    active ? 2 : 1.7
                                }
                            />

                            <span
                                className={cn(
                                    'truncate transition-all duration-200',
                                    isCollapsed
                                        ? 'w-0 overflow-hidden opacity-0'
                                        : 'w-auto opacity-100',
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                },
            )}
        </nav>
    );

    return (
        <>
            {/* =====================================================
                Mobile top bar
            ===================================================== */}
            <div className="print:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-amber-200/60 bg-[#fffaf4]/95 px-4 backdrop-blur-md md:hidden">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-xs font-semibold text-amber-700 shadow-sm">
                        {brandName
                            .trim()
                            .charAt(0)
                            .toUpperCase() || 'S'}
                    </div>

                    <span className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                        {brandName}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open menu"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200/70 bg-white text-slate-600 transition-all hover:border-amber-300 hover:text-amber-700 active:scale-95"
                >
                    <Menu
                        className="h-[17px] w-[17px]"
                        strokeWidth={1.8}
                    />
                </button>
            </div>

            {/* =====================================================
                Mobile overlay
            ===================================================== */}
            <div
                onClick={() => setIsOpen(false)}
                aria-hidden={!isOpen}
                className={cn(
                    'fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
                    isOpen
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            />

            {/* =====================================================
                Sidebar
            ===================================================== */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-amber-200/60 bg-[#fffaf4] transition-all duration-300 ease-in-out',
                    isCollapsed
                        ? 'w-[68px]'
                        : 'w-[218px]',
                    isOpen
                        ? 'translate-x-0 shadow-2xl'
                        : '-translate-x-full md:translate-x-0',
                    'md:sticky md:top-0 md:h-screen md:shadow-none',
                )}
            >
                {/* =================================================
                    Brand
                ================================================= */}
                <div
                    className={cn(
                        'flex h-[68px] shrink-0 items-center border-b border-amber-100',
                        isCollapsed
                            ? 'justify-center px-2'
                            : 'justify-between px-3.5',
                    )}
                >
                    <Link
                        href="/admin"
                        onClick={() =>
                            setIsOpen(false)
                        }
                        title={
                            isCollapsed
                                ? brandName
                                : undefined
                        }
                        className="flex min-w-0 items-center gap-2.5"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-700 shadow-sm">
                            {brandName
                                .trim()
                                .charAt(0)
                                .toUpperCase() ||
                                'S'}
                        </div>

                        <span
                            className={cn(
                                'truncate text-[15px] font-semibold tracking-tight text-slate-900 transition-all duration-200',
                                isCollapsed
                                    ? 'w-0 opacity-0'
                                    : 'w-auto opacity-100',
                            )}
                        >
                            {brandName}
                        </span>
                    </Link>

                    {/* Mobile close */}
                    <button
                        type="button"
                        onClick={() =>
                            setIsOpen(false)
                        }
                        aria-label="Close menu"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700 md:hidden"
                    >
                        <X
                            className="h-4 w-4"
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

                {/* =================================================
                    Navigation
                ================================================= */}
                <div className="flex-1 overflow-y-auto py-4">
                    {!isCollapsed && (
                        <p className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Menu
                        </p>
                    )}

                    {navList}
                </div>

                {/* =================================================
                    Desktop collapse toggle
                ================================================= */}
                <div className="hidden border-t border-amber-100 px-2.5 py-2.5 md:block">
                    <button
                        type="button"
                        onClick={() =>
                            setIsCollapsed(
                                (prev) => !prev,
                            )
                        }
                        aria-label={
                            isCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                        title={
                            isCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                        className={cn(
                            'flex h-9 w-full items-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700',
                            isCollapsed
                                ? 'justify-center'
                                : 'gap-2.5 px-3',
                        )}
                    >
                        {isCollapsed ? (
                            <ChevronRight
                                className="h-4 w-4"
                                strokeWidth={1.8}
                            />
                        ) : (
                            <>
                                <ChevronLeft
                                    className="h-4 w-4"
                                    strokeWidth={1.8}
                                />

                                <span className="text-xs font-medium">
                                    Collapse
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* =================================================
                    User
                ================================================= */}
                <div className="border-t border-amber-100 px-2.5 py-3">
                    <div
                        className={cn(
                            'flex items-center rounded-lg',
                            isCollapsed
                                ? 'justify-center'
                                : 'gap-2.5 px-2',
                        )}
                    >
                        <div
                            title={
                                isCollapsed
                                    ? adminName
                                    : undefined
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-semibold text-amber-800"
                        >
                            {initials}
                        </div>

                        <div
                            className={cn(
                                'min-w-0 transition-all duration-200',
                                isCollapsed
                                    ? 'w-0 overflow-hidden opacity-0'
                                    : 'w-auto opacity-100',
                            )}
                        >
                            <p className="truncate text-[12px] font-semibold text-slate-800">
                                {adminName}
                            </p>

                            <p className="truncate text-[10px] text-slate-500">
                                {adminEmail}
                            </p>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'mt-2 flex flex-col gap-1',
                            isCollapsed
                                ? 'items-center'
                                : '',
                        )}
                    >
                        <Link
                            href="/"
                            onClick={() =>
                                setIsOpen(false)
                            }
                            title={
                                isCollapsed
                                    ? 'Go to Home Page'
                                    : undefined
                            }
                            className={cn(
                                'flex h-9 items-center rounded-lg text-[12px] font-medium text-slate-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700',
                                isCollapsed
                                    ? 'w-9 justify-center'
                                    : 'px-3',
                            )}
                        >
                            <span
                                className={cn(
                                    'truncate transition-all duration-200',
                                    isCollapsed
                                        ? 'w-0 overflow-hidden opacity-0'
                                        : 'w-auto opacity-100',
                                )}
                            >
                                Go to Home Page
                            </span>
                        </Link>

                        <LogoutButton />
                    </div>
                </div>
            </aside>
        </>
    );
}