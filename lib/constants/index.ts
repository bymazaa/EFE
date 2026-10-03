// Single source of truth: used by Mongoose models AND Zod schemas.

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
    'paypal',
    'paylater',
    'venmo',
    'applepay',
    'googlepay',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DEFAULT_CURRENCY = 'USD';

export const ORDER_NUMBER_PREFIX = 'EFE';
export const ORDER_NUMBER_START = 10000;

// Constants for authentication and session management.
export const SESSION_COOKIE = 'efe_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

// purpouse
export const printHeightLightPoint = 'Luxury Streetwear';
export const categoryName = 'Streetwear';

export const RESET_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;

export const apiKey = process.env.RESEND_API_KEY;
export const mailDomain = process.env.MAIL_FROM;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://efeapparel.vercel.app';
export const SITE_NAME = 'EFE Store';
export const LOW_STOCK_THRESHOLD = 9;

export const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_EMAIL ;