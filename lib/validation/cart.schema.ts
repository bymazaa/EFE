import { z } from 'zod';

import { objectIdSchema } from './common.schema';

export const MAX_ITEM_QUANTITY = 100;

export const MAX_CART_ITEMS = 20;

/**
 * Client cart stores:
 * - productId
 * - size
 * - quantity
 *
 * Prices are NEVER accepted from the client.
 */
export const cartItemSchema = z.object({
    productId: objectIdSchema,

    size: z
        .string()
        .trim()
        .min(1, 'Size is required')
        .max(20, 'Size is too long'),

    quantity: z
        .number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .max(
            MAX_ITEM_QUANTITY,
            `Maximum ${MAX_ITEM_QUANTITY} per item`,
        ),
});

export const cartItemsSchema = z
    .array(cartItemSchema)
    .min(1, 'Your cart is empty')
    .max(
        MAX_CART_ITEMS,
        'Too many items in the cart',
    )
    .refine(
        (items) => {
            const keys = items.map(
                (item) =>
                    `${item.productId}:${item.size
                        .trim()
                        .toLowerCase()}`,
            );

            return new Set(keys).size === keys.length;
        },
        {
            message:
                'Duplicate product sizes in the cart',
        },
    );

/**
 * validateCart Server Action,
 * and reading cart from localStorage.
 */
export const cartSchema = z.object({
    items: cartItemsSchema,
});

export type CartItemInput = z.infer<
    typeof cartItemSchema
>;

export type CartInput = z.infer<
    typeof cartSchema
>;