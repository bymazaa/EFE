import { z } from 'zod';

import {
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
} from '@/lib/constants';

import {
    emailSchema,
    objectIdSchema,
    pageSchema,
    phoneSchema,
    searchSchema,
    zipCodeSchema,
} from './common.schema';

import { cartItemsSchema } from './cart.schema';

/* ------------------------------------------------------------------ */
/* Customer                                                           */
/* ------------------------------------------------------------------ */

export const customerInfoSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Full name is required')
        .max(80, 'Name is too long'),

    email: emailSchema,

    phone: phoneSchema,
});

/* ------------------------------------------------------------------ */
/* Shipping address                                                   */
/* ------------------------------------------------------------------ */

export const shippingAddressSchema = z.object({
    address: z
        .string()
        .trim()
        .min(2, 'Enter your street address')
        .max(200, 'Address is too long'),

    city: z
        .string()
        .trim()
        .min(2, 'City is required')
        .max(80, 'City name is too long'),

    state: z
        .string()
        .trim()
        .min(2, 'State is required')
        .max(50, 'State is too long'),

    postalCode: zipCodeSchema,

    country: z.literal('United States'),
});

/* ------------------------------------------------------------------ */
/* Checkout form (client + server)                                    */
/* ------------------------------------------------------------------ */

export const checkoutSchema = z.object({
    customer: customerInfoSchema,

    shippingAddress: shippingAddressSchema,

    /**
     * Customer-selected payment method.
     *
     * PAYMENT_METHODS currently contains:
     * - paypal
     * - paylater
     * - venmo
     * - applepay
     * - googlepay
     */
    paymentMethod: z.enum(PAYMENT_METHODS),
});

/* ------------------------------------------------------------------ */
/* Place order                                                        */
/*                                                                      */
/* Contains cart items only. Prices/totals are NOT trusted from       */
/* the client. The server reads current product prices from DB.       */
/* ------------------------------------------------------------------ */

export const placeOrderSchema = checkoutSchema.extend({
    items: cartItemsSchema,
});

/* ------------------------------------------------------------------ */
/* Admin: change order status                                         */
/* ------------------------------------------------------------------ */

export const updateOrderStatusSchema = z.object({
    orderId: objectIdSchema,

    orderStatus: z.enum(ORDER_STATUSES),
});

/* ------------------------------------------------------------------ */
/* Admin order sorting                                                */
/* ------------------------------------------------------------------ */

export const ORDER_SORT_OPTIONS = [
    'newest',
    'oldest',
    'amount_desc',
    'amount_asc',
] as const;

export type OrderSort =
    (typeof ORDER_SORT_OPTIONS)[number];

/* ------------------------------------------------------------------ */
/* Admin order list query                                             */
/*                                                                      */
/* Example:                                                           */
/* /admin/orders?page=1&search=&orderStatus=&paymentStatus=&sort=     */
/* ------------------------------------------------------------------ */

export const orderListQuerySchema = z.object({
    page: pageSchema,

    search: searchSchema,

    /**
     * Invalid or "all" values become undefined
     * instead of throwing a validation error.
     */
    orderStatus: z
        .enum(ORDER_STATUSES)
        .optional()
        .catch(undefined),

    paymentStatus: z
        .enum(PAYMENT_STATUSES)
        .optional()
        .catch(undefined),

    /**
     * Defaults to newest when missing or invalid.
     */
    sort: z
        .enum(ORDER_SORT_OPTIONS)
        .catch('newest'),
});

/* ------------------------------------------------------------------ */
/* Order confirmation                                                 */
/*                                                                      */
/* Example: CND-10024                                                 */
/* ------------------------------------------------------------------ */

export const orderNumberSchema = z
    .string()
    .trim()
    .toUpperCase()
    .regex(
        /^[A-Z]{2,6}-\d{3,10}$/,
        'Invalid order number',
    );

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type CustomerInfoInput = z.infer<
    typeof customerInfoSchema
>;

export type ShippingAddressInput = z.infer<
    typeof shippingAddressSchema
>;

export type CheckoutInput = z.infer<
    typeof checkoutSchema
>;

export type PlaceOrderInput = z.infer<
    typeof placeOrderSchema
>;

export type UpdateOrderStatusInput = z.infer<
    typeof updateOrderStatusSchema
>;

export type OrderListQuery = z.infer<
    typeof orderListQuerySchema
>;