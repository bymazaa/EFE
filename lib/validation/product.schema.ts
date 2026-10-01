import { z } from 'zod';

import {
    currencySchema,
    imageUrlSchema,
    moneySchema,
    objectIdSchema,
    pageSchema,
    searchSchema,
} from './common.schema';

/* -------------------------------------------------------------------------- */
/* Product variants / inventory                                               */
/* -------------------------------------------------------------------------- */

export const productVariantSchema = z.object({
    size: z
        .string()
        .trim()
        .min(1, 'Size is required')
        .max(20, 'Size is too long'),

    stock: z
        .number()
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
        .max(100000, 'Stock is too high'),
});

/* *Admin product form (new + edit) and create/update Server Actions* */
export const productInputSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(120, 'Name is too long'),

        slug: z
            .string()
            .trim()
            .toLowerCase()
            .min(2, 'Slug is required')
            .max(140, 'Slug is too long')
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                'Use lowercase letters, numbers and hyphens only',
            ),

        description: z
            .string()
            .trim()
            .max(5000, 'Description is too long'),

        price: moneySchema,

        // *"Original price" in the admin form. Empty = no discount (send null).*
        compareAtPrice: moneySchema.nullable(),

        currency: currencySchema,

        images: z
            .array(imageUrlSchema)
            .min(1, 'Add at least one image')
            .max(8, 'Maximum 8 images'),

        variants: z
            .array(productVariantSchema)
            .max(20, 'Maximum 20 size variants')
            .refine(
                (variants) => {
                    const normalizedSizes = variants.map((variant) =>
                        variant.size.trim().toUpperCase(),
                    );

                    return new Set(normalizedSizes).size === normalizedSizes.length;
                },
                {
                    message: 'Each size can only be added once',
                },
            ),

        isActive: z.boolean(),
    })
    .refine(
        (data) =>
            data.compareAtPrice === null ||
            data.compareAtPrice > data.price,
        {
            message: 'Original price must be higher than the price',
            path: ['compareAtPrice'],
        },
    );

/* -------------------------------------------------------------------------- */
/* Edit / delete / toggle actions                                             */
/* -------------------------------------------------------------------------- */

export const productIdSchema = objectIdSchema;

export const setProductActiveSchema = z.object({
    id: objectIdSchema,
    isActive: z.boolean(),
});


export const productListQuerySchema = z.object({
    page: pageSchema,
    search: searchSchema,
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProductVariant = z.infer<typeof productVariantSchema>;

export type ProductInput = z.infer<typeof productInputSchema>;

export type SetProductActiveInput = z.infer<
    typeof setProductActiveSchema
>;

export type ProductListQuery = z.infer<
    typeof productListQuerySchema
>;