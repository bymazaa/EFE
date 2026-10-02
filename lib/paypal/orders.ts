import {
    CheckoutPaymentIntent,
    OrdersController,
} from '@paypal/paypal-server-sdk';

import { paypalClient } from './client';

const ordersController =
    new OrdersController(
        paypalClient,
    );

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CreatePayPalOrderInput {
    amount: string;
    currencyCode: string;
    customId: string;
}

export interface PayPalOrderResult {
    id: string;
    status?: string;
}

export interface PayPalCaptureResult {
    id: string;
    status?: string;
    amount?: {
        currencyCode?: string;
        value?: string;
    };
}

/* ------------------------------------------------------------------ */
/* Create order                                                       */
/* ------------------------------------------------------------------ */

/**
 * Creates a PayPal Checkout order.
 *
 * IMPORTANT:
 * The amount passed here must already be calculated
 * from trusted server-side data.
 */
export async function createPayPalOrder(
    input: CreatePayPalOrderInput,
): Promise<PayPalOrderResult> {
    const { result } =
        await ordersController.createOrder({
            body: {
                intent:
                    CheckoutPaymentIntent.Capture,

                purchaseUnits: [
                    {
                        customId:
                            input.customId,

                        amount: {
                            currencyCode:
                                input.currencyCode,

                            value:
                                input.amount,
                        },
                    },
                ],
            },
        });

    if (!result.id) {
        throw new Error(
            'PayPal order creation failed.',
        );
    }

    return {
        id: result.id,
        status: result.status,
    };
}

/* ------------------------------------------------------------------ */
/* Get order                                                          */
/* ------------------------------------------------------------------ */

/**
 * Returns the current PayPal order details.
 *
 * Used to verify that the PayPal order belongs
 * to the checkout payload we created.
 */
export async function getPayPalOrder(
    orderId: string,
): Promise<unknown> {
    const { result } =
        await ordersController.getOrder({
            id: orderId,
        });

    return result;
}

/* ------------------------------------------------------------------ */
/* Capture order                                                      */
/* ------------------------------------------------------------------ */

/**
 * Captures an approved PayPal order.
 */
export async function capturePayPalOrder(
    orderId: string,
): Promise<unknown> {
    const { result } =
        await ordersController.captureOrder({
            id: orderId,
        });

    return result;
}