'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Menu,
    ShoppingBag,
    X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCartCount } from '@/store/cart.store';

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/order-status', label: 'Status' },
    { href: '/size-guide', label: 'Size Guide' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
] as const;

export function Header({
    brandName,
    logoUrl,
}: {
    brandName: string;
    logoUrl: string;
}) {
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    const cartCount = useCartCount();

    const isActive = (href: string) =>
        href === '/'
            ? pathname === '/'
            : pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-[#fffaf6]/90 shadow-sm shadow-orange-100/30 backdrop-blur-xl">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* ================================================== */}
                {/* Logo */}
                {/* ================================================== */}

                <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-2.5"
                >
                    {logoUrl ? (
                        <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src={logoUrl}
                                alt={brandName}
                                fill
                                sizes="36px"
                                className="object-cover"
                            />
                        </span>
                    ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-serif text-sm text-orange-700 shadow-sm">
                            {brandName.charAt(0)}
                        </span>
                    )}

                    <span className="font-serif text-xl tracking-tight text-chocolate transition-colors duration-200 group-hover:text-orange-600">
                        {brandName}
                    </span>
                </Link>

                {/* ================================================== */}
                {/* Desktop Navigation */}
                {/* ================================================== */}

                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_ITEMS.map(
                        ({ href, label }) => {
                            const active =
                                isActive(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'group relative py-2 text-[14px] font-medium transition-colors duration-200',
                                        active
                                            ? 'text-chocolate'
                                            : 'text-chocolate-soft hover:text-chocolate',
                                    )}
                                >
                                    {label}

                                    <span
                                        className={cn(
                                            'absolute bottom-0 left-0 h-0.5 rounded-full bg-orange-500 transition-all duration-300',
                                            active
                                                ? 'w-full'
                                                : 'w-0 group-hover:w-1/2',
                                        )}
                                    />
                                </Link>
                            );
                        },
                    )}
                </nav>

                {/* ================================================== */}
                {/* Right Actions */}
                {/* ================================================== */}

                <div className="flex items-center gap-1.5">

                    {/* Go Admin */}
                    <Link
                        href="/admin"
                        className="hidden rounded-xl px-3 py-2 text-[14px] font-semibold text-chocolate-soft transition-all duration-200 hover:bg-orange-50 hover:text-chocolate sm:flex"
                    >
                        Go Admin
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        aria-label="View cart"
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-chocolate-soft transition-all duration-200 hover:bg-orange-50 hover:text-chocolate"
                    >
                        <ShoppingBag
                            className="h-5 w-5 transition-transform duration-200 group-hover:scale-105"
                            strokeWidth={1.75}
                        />

                        {cartCount > 0 ? (
                            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                                {cartCount > 9
                                    ? '9+'
                                    : cartCount}
                            </span>
                        ) : null}
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        type="button"
                        onClick={() =>
                            setIsMenuOpen(
                                (prev) => !prev,
                            )
                        }
                        aria-label={
                            isMenuOpen
                                ? 'Close menu'
                                : 'Open menu'
                        }
                        aria-expanded={
                            isMenuOpen
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-chocolate-soft transition-all duration-200 hover:bg-orange-50 hover:text-chocolate md:hidden"
                    >
                        {isMenuOpen ? (
                            <X
                                className="h-5 w-5"
                                strokeWidth={1.8}
                            />
                        ) : (
                            <Menu
                                className="h-5 w-5"
                                strokeWidth={1.8}
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* ================================================== */}
            {/* Mobile Navigation */}
            {/* ================================================== */}

            <div
                className={cn(
                    'overflow-hidden border-t border-orange-100/80 bg-[#fffaf6] transition-all duration-300 md:hidden',
                    isMenuOpen
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 border-transparent opacity-0',
                )}
            >
                <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <div className="rounded-2xl border border-orange-100 bg-white p-2 shadow-2xl shadow-gray-50">

                        {NAV_ITEMS.map(
                            ({
                                href,
                                label,
                            }) => {
                                const active =
                                    isActive(href);

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() =>
                                            setIsMenuOpen(
                                                false,
                                            )
                                        }
                                        className={cn(
                                            'flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200',
                                            active
                                                ? 'bg-orange-50 text-orange-700'
                                                : 'text-chocolate-soft hover:bg-gray-50 hover:text-chocolate',
                                        )}
                                    >
                                        <span>
                                            {label}
                                        </span>

                                        {active ? (
                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                        ) : null}
                                    </Link>
                                );
                            },
                        )}

                        {/* Mobile Go Admin */}
                        <Link
                            href="/admin"
                            onClick={() =>
                                setIsMenuOpen(false)
                            }
                            className="mt-1 flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold text-chocolate-soft transition-all duration-200 hover:bg-gray-50 hover:text-chocolate"
                        >
                            <span>Go Admin</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}