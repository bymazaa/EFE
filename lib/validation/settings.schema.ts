import { z } from 'zod';

import {
    optionalEmailSchema,
    optionalHttpsUrlSchema,
    optionalPhoneSchema,
} from './common.schema';

/*
 * Admin settings form + action.
 * Optional fields may be left empty ("").
 */

export const siteSettingsSchema = z.object({
    brandName: z
        .string()
        .trim()
        .min(2, 'Brand name is required')
        .max(80, 'Brand name is too long'),

    description: z
        .string()
        .trim()
        .max(
            300,
            'Keep the description under 300 characters',
        ),

    logoUrl: optionalHttpsUrlSchema,

    address: z
        .string()
        .trim()
        .max(200, 'Address is too long'),

    websiteUrl: optionalHttpsUrlSchema,

    phone: optionalPhoneSchema,

    email: optionalEmailSchema,

    shippingCost: z
        .number()
        .min(0, 'Shipping cost cannot be negative')
        .max(1000, 'Shipping cost seems too high')
        .refine(
            (value) =>
                Math.abs(
                    value * 100 -
                        Math.round(value * 100),
                ) < 1e-6,
            'Use at most 2 decimal places',
        ),

    social: z.object({
        facebook: optionalHttpsUrlSchema,

        instagram: optionalHttpsUrlSchema,

        twitter: optionalHttpsUrlSchema,

        /**
         * WhatsApp:
         * US phone number only.
         *
         * Accepted:
         * 2137920038
         * +12137920038
         * 12137920038
         * (213) 792-0038
         * +1 (213) 792-0038
         */
        whatsapp: z
            .string()
            .trim()
            .max(
                20,
                'WhatsApp number is too long',
            )
            .refine(
                (value) => {
                    if (value === '') {
                        return true;
                    }

                    const digits =
                        value.replace(/\D/g, '');

                    // US number:
                    // 10 digits
                    // OR 11 digits beginning with 1
                    return (
                        digits.length === 10 ||
                        (
                            digits.length === 11 &&
                            digits.startsWith('1')
                        )
                    );
                },
                'Enter a valid US WhatsApp phone number',
            ),
    }),
});

export type SiteSettingsInput =
    z.infer<typeof siteSettingsSchema>;