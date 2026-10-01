'use server';

import { getSettings } from '@/services/settings.service';

import {
    placeOrder,
    validateCart,
} from '@/services/order.service';

import {
    fail,
    handleError,
    ok,
    type ActionResult,
} from '@/lib/action-result';

import { fromCents, toCents } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Checkout summary item                                              */
/* ------------------------------------------------------------------ */

export interface CheckoutSummaryItem {
    productId: string;

    name: string;

    image: string;

    /*
     * Selected product variant size.
     *
     * Example:
     * S / M / L / XL
     */
    size: string;

    quantity: number;

    lineTotal: number;

    /*
     * Whether the selected product/size can currently
     * be purchased.
     */
    isActive: boolean;

    /*
     * Current stock of the selected size.
     *
     * This is used by the checkout page to detect
     * quantity > available stock.
     */
    availableStock: number;
}

/* ------------------------------------------------------------------ */
/* Checkout summary                                                   */
/* ------------------------------------------------------------------ */

export interface CheckoutSummaryDTO {
    items: CheckoutSummaryItem[];

    subtotal: number;

    discountAmount: number;

    shippingCost: number;

    totalAmount: number;

    /*
     * Products that no longer exist.
     */
    removedProductIds: string[];
}

/* ------------------------------------------------------------------ */
/* Get checkout summary                                               */
/* ------------------------------------------------------------------ */

export async function getCheckoutSummaryAction(
    items: unknown,
): Promise<ActionResult<CheckoutSummaryDTO>> {
    try {
        /*
         * validateCart() is the server-authoritative
         * source for:
         *
         * - product existence
         * - active status
         * - selected size
         * - current size stock
         * - current product price
         * - subtotal
         */
        const result = await validateCart(
            items,
        );

        if (!result.success) {
            return result;
        }

        const data = result.data;

        if (!data) {
            return fail(
                'Unable to validate your cart.',
            );
        }

        /* --------------------------------------------------------------
           Store settings
        -------------------------------------------------------------- */

        const settings = await getSettings();

        /* --------------------------------------------------------------
           Product discount
        -------------------------------------------------------------- */

        let discountCents = 0;

        for (const item of data.items) {
            /*
             * Compare-at price represents the original
             * product price.
             *
             * Discount:
             *
             * (compareAtPrice - currentPrice) * quantity
             */
            if (
                item.compareAtPrice !== null &&
                item.compareAtPrice > item.price
            ) {
                const discountPerItemCents =
                    toCents(
                        item.compareAtPrice,
                    ) -
                    toCents(item.price);

                discountCents +=
                    discountPerItemCents *
                    item.quantity;
            }
        }

        /* --------------------------------------------------------------
           Subtotal
        -------------------------------------------------------------- */

        const subtotalCents = toCents(
            data.subtotal,
        );

        /* --------------------------------------------------------------
           Shipping
        -------------------------------------------------------------- */

        const shippingCostCents = toCents(
            settings.shippingCost,
        );

        /* --------------------------------------------------------------
           Total
           subtotal + shipping
        -------------------------------------------------------------- */

        const totalCents =
            subtotalCents +
            shippingCostCents;

        /* --------------------------------------------------------------
           Return server-authoritative summary
        -------------------------------------------------------------- */

        return ok(undefined, {
            items: data.items.map((item) => ({
                productId: item.productId,

                name: item.name,

                image: item.image,

                /*
                 * IMPORTANT:
                 * Keep the selected size.
                 */
                size: item.size,

                quantity: item.quantity,

                lineTotal: item.lineTotal,

                /*
                 * Product/size availability.
                 */
                isActive: item.isActive,

                /*
                 * IMPORTANT:
                 * Current stock of the selected size.
                 */
                availableStock:
                    item.availableStock,
            })),

            subtotal: data.subtotal,

            discountAmount:
                fromCents(discountCents),

            shippingCost:
                fromCents(
                    shippingCostCents,
                ),

            totalAmount:
                fromCents(totalCents),

            removedProductIds:
                data.removedProductIds,
        });
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Place order                                                        */
/* ------------------------------------------------------------------ */

export async function placeOrderAction(
    data: unknown,
) {
    /*
     * placeOrder() performs its own server-side
     * validation, price calculation and stock check.
     *
     * Never trust client-side totals.
     */
    return placeOrder(data);
}