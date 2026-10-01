import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_CURRENCY } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/* Class names                                                         */
/* ------------------------------------------------------------------ */

/** Merge Tailwind classes safely: cn("px-4", isActive && "bg-primary") */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

/** $45 -> 4500. Do all calculations in cents to avoid 0.1 + 0.2 problems. */
export function toCents(amount: number): number {
    return Math.round(amount * 100);
}

/** 4500 -> 45 */
export function fromCents(cents: number): number {
    return cents / 100;
}

/** Round a dollar amount to 2 decimals */
export function roundMoney(amount: number): number {
    return fromCents(toCents(amount));
}

/** formatPrice(45) -> "$45.00" */
export function formatPrice(amount: number, currency: string = DEFAULT_CURRENCY): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

/** calcDiscountPercent(38, 45) -> 16. Returns 0 if there is no valid discount. */
export function calcDiscountPercent(price: number, compareAtPrice?: number | null): number {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** true if the product has a valid discount */
export function hasDiscount(price: number, compareAtPrice?: number | null): boolean {
    return calcDiscountPercent(price, compareAtPrice) > 0;
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/** slugify("Vanilla Scented !") -> "vanilla-scented" */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** truncate("long text...", 100) -> "long te..." */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
}

/** Escape user input before using it inside a RegExp (safe admin search) */
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ------------------------------------------------------------------ */
/* Date                                                                */
/* ------------------------------------------------------------------ */

/** formatDate(date) -> "Sep 24, 2026" */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

/** formatDateTime(date) -> "Sep 24, 2026, 3:45 PM" */
export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

/** Safely read ?page= from the URL. Always returns an integer >= 1. */
export function parsePage(value: string | string[] | undefined): number {
    const raw = Array.isArray(value) ? value[0] : value;
    const page = Number.parseInt(raw ?? '1', 10);
    return Number.isFinite(page) && page > 0 ? page : 1;
}

/** getPagination(2, 10) -> { skip: 10, limit: 10 } */
export function getPagination(page: number, limit: number) {
    return { skip: (page - 1) * limit, limit };
}

/** getTotalPages(45, 10) -> 5 */
export function getTotalPages(total: number, limit: number): number {
    return Math.max(1, Math.ceil(total / limit));
}




