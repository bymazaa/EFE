'use server';

import { createHash } from 'node:crypto';

import {
    DEFAULT_CURRENCY,
} from '@/lib/constants';

import {
    placeOrderSchema,
    type PlaceOrderInput,
} from '@/lib/validation/order.schema';

import {
    getSettings,
} from '@/services/settings.service';

import {
    validateCart,
    placeOrder,
} from '@/services/order.service';

import {
    createPayPalOrder,
    getPayPalOrder,
    capturePayPalOrder,
} from '@/lib/paypal/orders';

import {
    fail,
    handleError,
    ok,
    validationFail,
    type ActionResult,
} from '@/lib/action-result';

import {
    fromCents,
    toCents,
} from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface PayPalCreateOrderResult {
    id: string;
}

export interface PayPalCompletedOrderResult {
    orderNumber: string;
    confirmationToken: string;
    providerOrderId: string;
    providerCaptureId: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Creates a deterministic fingerprint for the checkout payload.
 *
 * The fingerprint is stored in PayPal's custom_id field.
 *
 * During capture we calculate it again from the submitted
 * checkout data and compare it with the PayPal order.
 */
function createCheckoutFingerprint(
    data: PlaceOrderInput,
): string {
    const payload =
        JSON.stringify(data);

    return createHash('sha256')
        .update(payload)
        .digest('hex');
}

/**
 * Checks whether a value is a plain object.
 */
function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null
    );
}

/**
 * Extracts the first purchase unit from
 * a PayPal order response.
 */
function getFirstPurchaseUnit(
    value: unknown,
): Record<string, unknown> | null {
    if (!isRecord(value)) {
        return null;
    }

    const purchaseUnits =
        value.purchaseUnits;

    if (
        !Array.isArray(
            purchaseUnits,
        )
    ) {
        return null;
    }

    const first =
        purchaseUnits[0];

    return isRecord(first)
        ? first
        : null;
}

/**
 * Returns the PayPal custom ID.
 */
function getPayPalCustomId(
    value: unknown,
): string | null {
    const purchaseUnit =
        getFirstPurchaseUnit(
            value,
        );

    const customId =
        purchaseUnit?.customId;

    return typeof customId ===
        'string'
        ? customId
        : null;
}

/**
 * Extracts the amount from a PayPal purchase unit.
 */
function getPayPalOrderAmount(
    value: unknown,
): {
    currencyCode: string;
    amount: string;
} | null {
    const purchaseUnit =
        getFirstPurchaseUnit(
            value,
        );

    const amount =
        purchaseUnit?.amount;

    if (!isRecord(amount)) {
        return null;
    }

    const currencyCode =
        amount.currencyCode;

    const valueString =
        amount.value;

    if (
        typeof currencyCode !==
            'string' ||
        typeof valueString !==
            'string'
    ) {
        return null;
    }

    return {
        currencyCode,
        amount:
            valueString,
    };
}

/**
 * Extracts the first completed capture
 * from a PayPal capture response.
 */
function getCompletedCapture(
    value: unknown,
): {
    id: string;
    status: string;
    amount: string;
    currencyCode: string;
} | null {
    if (!isRecord(value)) {
        return null;
    }

    const purchaseUnits =
        value.purchaseUnits;

    if (
        !Array.isArray(
            purchaseUnits,
        )
    ) {
        return null;
    }

    for (
        const purchaseUnit of
        purchaseUnits
    ) {
        if (
            !isRecord(
                purchaseUnit,
            )
        ) {
            continue;
        }

        const payments =
            purchaseUnit.payments;

        if (
            !isRecord(
                payments,
            )
        ) {
            continue;
        }

        const captures =
            payments.captures;

        if (
            !Array.isArray(
                captures,
            )
        ) {
            continue;
        }

        for (
            const capture of
            captures
        ) {
            if (
                !isRecord(
                    capture,
                )
            ) {
                continue;
            }

            const id =
                capture.id;

            const status =
                capture.status;

            const amount =
                capture.amount;

            if (
                typeof id !==
                    'string' ||
                typeof status !==
                    'string' ||
                !isRecord(
                    amount,
                )
            ) {
                continue;
            }

            const valueString =
                amount.value;

            const currencyCode =
                amount.currencyCode;

            if (
                typeof valueString !==
                    'string' ||
                typeof currencyCode !==
                    'string'
            ) {
                continue;
            }

            return {
                id,
                status,
                amount:
                    valueString,
                currencyCode,
            };
        }
    }

    return null;
}

/**
 * Converts a provider amount string into cents
 * for reliable money comparison.
 */
function amountToCents(
    value: string,
): number | null {
    const numericValue =
        Number(value);

    if (
        !Number.isFinite(
            numericValue,
        ) ||
        numericValue < 0
    ) {
        return null;
    }

    return toCents(
        numericValue,
    );
}

/* ------------------------------------------------------------------ */
/* Authoritative payment total                                        */
/* ------------------------------------------------------------------ */

/**
 * Calculates the final payment amount entirely
 * from current server-side data.
 *
 * Browser-supplied totals are never trusted.
 */
async function getAuthoritativePaymentTotal(
    input: PlaceOrderInput,
): Promise<{
    amount: string;
    currencyCode: string;
}> {
    const cartResult =
        await validateCart(
            input.items,
        );

    if (!cartResult.success) {
        throw new Error(
            cartResult.error ||
                'Unable to validate your cart.',
        );
    }

    const cart =
        cartResult.data;

    if (!cart) {
        throw new Error(
            'Unable to validate your cart.',
        );
    }

    /**
     * Every submitted cart line must still exist.
     */
    if (
        cart.removedProductIds
            .length > 0
    ) {
        throw new Error(
            'Some items in your cart are no longer available.',
        );
    }

    /**
     * Every submitted line must still be present
     * after server-side validation.
     */
    if (
        cart.items.length !==
        input.items.length
    ) {
        throw new Error(
            'Some items in your cart are no longer available.',
        );
    }

    /**
     * Every selected product + size must still
     * be purchasable.
     */
    const unavailableItem =
        cart.items.find(
            (item) =>
                !item.isActive,
        );

    if (unavailableItem) {
        throw new Error(
            unavailableItem
                .availabilityMessage ||
                `${unavailableItem.name} is no longer available.`,
        );
    }

    const settings =
        await getSettings();

    const subtotalCents =
        toCents(
            cart.subtotal,
        );

    const shippingCostCents =
        toCents(
            settings.shippingCost,
        );

    const totalCents =
        subtotalCents +
        shippingCostCents;

    return {
        amount:
            fromCents(
                totalCents,
            ).toFixed(2),

        currencyCode:
            DEFAULT_CURRENCY.toUpperCase(),
    };
}

/* ------------------------------------------------------------------ */
/* Create PayPal order                                                */
/* ------------------------------------------------------------------ */

/**
 * Creates a PayPal order using only
 * server-calculated totals.
 */
export async function createPayPalOrderAction(
    data: unknown,
): Promise<
    ActionResult<PayPalCreateOrderResult>
> {
    const parsed =
        placeOrderSchema.safeParse(
            data,
        );

    if (!parsed.success) {
        return validationFail(
            parsed.error,
        );
    }

    try {
        const {
            amount,
            currencyCode,
        } =
            await getAuthoritativePaymentTotal(
                parsed.data,
            );

        const checkoutFingerprint =
            createCheckoutFingerprint(
                parsed.data,
            );

        const order =
            await createPayPalOrder({
                amount,

                currencyCode,

                customId:
                    checkoutFingerprint,
            });

        return ok(
            undefined,
            {
                id:
                    order.id,
            },
        );
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Capture + finalize order                                           */
/* ------------------------------------------------------------------ */

/**
 * Captures the approved PayPal order and then
 * finalizes the MongoDB order.
 *
 * Payment must be completely verified before
 * placeOrder() creates the database order.
 */
export async function capturePayPalOrderAction(
    data: unknown,
    paypalOrderId: string,
): Promise<
    ActionResult<PayPalCompletedOrderResult>
> {
    const parsed =
        placeOrderSchema.safeParse(
            data,
        );

    if (!parsed.success) {
        return validationFail(
            parsed.error,
        );
    }

    const normalizedOrderId =
        paypalOrderId.trim();

    if (!normalizedOrderId) {
        return fail(
            'Missing PayPal order ID.',
        );
    }

    try {
        /* ---------------------------------------------------------- */
        /* Recalculate authoritative amount                           */
        /* ---------------------------------------------------------- */

        const {
            amount:
                expectedAmount,
            currencyCode:
                expectedCurrency,
        } =
            await getAuthoritativePaymentTotal(
                parsed.data,
            );

        const expectedAmountCents =
            amountToCents(
                expectedAmount,
            );

        if (
            expectedAmountCents ===
            null
        ) {
            return fail(
                'Invalid order amount.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Get PayPal order                                            */
        /* ---------------------------------------------------------- */

        const paypalOrder =
            await getPayPalOrder(
                normalizedOrderId,
            );

        /* ---------------------------------------------------------- */
        /* Verify checkout fingerprint                                */
        /* ---------------------------------------------------------- */

        const expectedFingerprint =
            createCheckoutFingerprint(
                parsed.data,
            );

        const paypalCustomId =
            getPayPalCustomId(
                paypalOrder,
            );

        if (
            paypalCustomId !==
            expectedFingerprint
        ) {
            return fail(
                'PayPal order does not match this checkout.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Verify PayPal order amount                                 */
        /* ---------------------------------------------------------- */

        const paypalAmount =
            getPayPalOrderAmount(
                paypalOrder,
            );

        if (!paypalAmount) {
            return fail(
                'Unable to verify the PayPal order amount.',
            );
        }

        if (
            paypalAmount.currencyCode.toUpperCase() !==
            expectedCurrency.toUpperCase()
        ) {
            return fail(
                'PayPal currency does not match the order.',
            );
        }

        const paypalAmountCents =
            amountToCents(
                paypalAmount.amount,
            );

        if (
            paypalAmountCents ===
            null
        ) {
            return fail(
                'Invalid PayPal order amount.',
            );
        }

        if (
            paypalAmountCents !==
            expectedAmountCents
        ) {
            return fail(
                'PayPal amount does not match the current order total.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Capture PayPal order                                        */
        /* ---------------------------------------------------------- */

        const capture =
            await capturePayPalOrder(
                normalizedOrderId,
            );

        const completedCapture =
            getCompletedCapture(
                capture,
            );

        if (
            !completedCapture
        ) {
            return fail(
                'PayPal payment capture could not be verified.',
            );
        }

        if (
            completedCapture.status !==
            'COMPLETED'
        ) {
            return fail(
                'PayPal payment was not completed.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Verify captured amount                                      */
        /* ---------------------------------------------------------- */

        if (
            completedCapture.currencyCode.toUpperCase() !==
            expectedCurrency.toUpperCase()
        ) {
            return fail(
                'Captured payment currency does not match the order.',
            );
        }

        const captureAmountCents =
            amountToCents(
                completedCapture.amount,
            );

        if (
            captureAmountCents ===
            null
        ) {
            return fail(
                'Invalid captured payment amount.',
            );
        }

        if (
            captureAmountCents !==
            expectedAmountCents
        ) {
            return fail(
                'Captured payment amount does not match the order total.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Payment verified                                            */
        /* ---------------------------------------------------------- */

        const orderResult =
            await placeOrder(
                parsed.data,
                {
                    providerOrderId:
                        normalizedOrderId,

                    providerCaptureId:
                        completedCapture.id,
                },
            );

        if (
            !orderResult.success
        ) {
            return fail(
                orderResult.error,
            );
        }

        if (
            !orderResult.data
        ) {
            return fail(
                'Unable to place order.',
            );
        }

        /* ---------------------------------------------------------- */
        /* Success                                                      */
        /* ---------------------------------------------------------- */

        return ok(
            orderResult.message,
            {
                orderNumber:
                    orderResult.data
                        .orderNumber,

                confirmationToken:
                    orderResult.data
                        .confirmationToken,

                providerOrderId:
                    normalizedOrderId,

                providerCaptureId:
                    completedCapture.id,
            },
        );
    } catch (error) {
        return handleError(
            error,
        );
    }
}