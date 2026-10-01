
/**
 * Shared contact/business info used across static pages
 * (Privacy Policy, Terms, Footer, Contact page) so nothing
 * is hard-coded in more than one place.
 *
 * TEMPORARY: once `services/settings.service.ts` is built,
 * replace this object with a call to `getSettings()` or the
 * appropriate SiteSettings service.
 */

export const SITE_CONTACT = {
    brandName: 'EFE Apparel',

    legalName: 'EFE Apparel',

    description:
        'Premium streetwear essentials, jackets, sweaters, and sweatshirts designed for modern everyday style.',

    address: '',

    email: '',

    phone: '',

    websiteUrl: 'https://www.efeapparel.net',

    social: {
        facebook: '',

        instagram:
            'https://www.instagram.com/efe.apparel/',

        twitter: '',

        whatsapp: '',
    },
} as const;

export const LAST_UPDATED = 'October 1, 2026';

