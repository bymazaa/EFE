'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
    ApplePayOneTimePaymentButton,
    PayLaterOneTimePaymentButton,
    PayPalOneTimePaymentButton,
    PayPalProvider,
    VenmoOneTimePaymentButton,
    useEligibleMethods,
    usePayPal,
    type OnApproveDataOneTimePayments,
} from '@paypal/react-paypal-js/sdk-v6';

import {
    createPayPalOrderAction,
    capturePayPalOrderAction,
} from '@/app/(public)/checkout/paypal.actions';

import type { PlaceOrderInput } from '@/lib/validation/order.schema';

import type { PaymentMethod } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface PayPalPaymentSuccess {
    orderNumber: string;
    confirmationToken: string;
    providerOrderId: string;
    providerCaptureId: string;
}

interface PayPalPaymentProps {
    paymentMethod: PaymentMethod;

    checkoutData: PlaceOrderInput;

    /**
     * Current server-calculated checkout total.
     *
     * Used for SDK eligibility/payment UI.
     * The server still recalculates the authoritative amount.
     */
    amount: number;

    currency?: string;

    merchantName?: string;

    disabled?: boolean;

    onSuccess: (
        result: PayPalPaymentSuccess,
    ) => void | Promise<void>;

    onError?: (message: string) => void;
}

/* ------------------------------------------------------------------ */
/* Google Pay browser types                                           */
/* ------------------------------------------------------------------ */

interface GooglePayPaymentMethodData {
    [key: string]: unknown;
}

interface GooglePayPaymentData {
    paymentMethodData: GooglePayPaymentMethodData;
}

interface GooglePayPaymentAuthorizationResult {
    transactionState: 'SUCCESS' | 'ERROR';
    error?: {
        intent?: string;
        message?: string;
        reason?: string;
    };
}

interface GooglePayPaymentDataRequest {
    apiVersion: number;
    apiVersionMinor: number;

    allowedPaymentMethods: readonly unknown[];

    transactionInfo: {
        totalPriceStatus: 'FINAL' | 'ESTIMATED';
        totalPrice: string;
        currencyCode: string;
        countryCode: string;
        totalPriceLabel?: string;
    };

    merchantInfo?: Record<string, unknown>;

    callbackIntents?: string[];
}

interface GooglePayPaymentsClient {
    isReadyToPay(request: {
        allowedPaymentMethods: readonly unknown[];
        apiVersion: number;
        apiVersionMinor: number;
    }): Promise<{
        result: boolean;
    }>;

    createButton(options: {
        onClick: () => void;
        buttonColor?: 'default' | 'black' | 'white';
        buttonType?: string;
    }): HTMLElement;

    loadPaymentData(
        request: GooglePayPaymentDataRequest,
    ): Promise<GooglePayPaymentData>;
}

interface GooglePayPaymentsApi {
    PaymentsClient: new (options: {
        environment: 'TEST' | 'PRODUCTION';

        paymentDataCallbacks?: {
            onPaymentAuthorized?: (
                paymentData: GooglePayPaymentData,
            ) => Promise<GooglePayPaymentAuthorizationResult>;
        };
    }) => GooglePayPaymentsClient;
}

function getGooglePayApi(): GooglePayPaymentsApi | undefined {
    return (
        window as unknown as {
            google?: {
                payments?: {
                    api?: GooglePayPaymentsApi;
                };
            };
        }
    ).google?.payments?.api;
}

/* ------------------------------------------------------------------ */
/* Google Pay script loader                                           */
/* ------------------------------------------------------------------ */

let googlePayScriptPromise: Promise<void> | null = null;

function loadGooglePayScript(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(
            new Error('Google Pay requires a browser environment.'),
        );
    }

    if (getGooglePayApi()) {
        return Promise.resolve();
    }

    if (googlePayScriptPromise) {
        return googlePayScriptPromise;
    }

    googlePayScriptPromise = new Promise<void>(
        (resolve, reject) => {
            const existingScript =
                document.querySelector<HTMLScriptElement>(
                    'script[data-google-pay-sdk]',
                );

            if (existingScript) {
                const checkLoaded = () => {
                    if (getGooglePayApi()) {
                        resolve();
                    } else {
                        reject(
                            new Error(
                                'Google Pay SDK loaded but API is unavailable.',
                            ),
                        );
                    }
                };

                if (existingScript.readyState === 'complete') {
                    checkLoaded();
                    return;
                }

                existingScript.addEventListener(
                    'load',
                    checkLoaded,
                    { once: true },
                );

                existingScript.addEventListener(
                    'error',
                    () => {
                        reject(
                            new Error(
                                'Google Pay SDK failed to load.',
                            ),
                        );
                    },
                    { once: true },
                );

                return;
            }

            const script =
                document.createElement('script');

            script.src =
                'https://pay.google.com/gp/p/js/pay.js';

            script.async = true;
            script.dataset.googlePaySdk = 'true';

            script.onload = () => {
                if (getGooglePayApi()) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            'Google Pay SDK loaded but API is unavailable.',
                        ),
                    );
                }
            };

            script.onerror = () => {
                reject(
                    new Error(
                        'Google Pay SDK failed to load.',
                    ),
                );
            };

            document.head.appendChild(script);
        },
    ).catch((error) => {
        googlePayScriptPromise = null;
        throw error;
    });

    return googlePayScriptPromise;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPaymentMethodLabel(
    method: PaymentMethod,
): string {
    switch (method) {
        case 'paypal':
            return 'PayPal';

        case 'paylater':
            return 'Pay Later';

        case 'venmo':
            return 'Venmo';

        case 'applepay':
            return 'Apple Pay';

        case 'googlepay':
            return 'Google Pay';

        default:
            return 'Payment';
    }
}

function getApprovalOrderId(
    data: unknown,
): string | null {
    if (
        typeof data !== 'object' ||
        data === null
    ) {
        return null;
    }

    const value = data as {
        orderId?: unknown;
    };

    return typeof value.orderId === 'string'
        ? value.orderId
        : null;
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PayPalPayment({
    paymentMethod,
    checkoutData,
    amount,
    currency = 'USD',
    merchantName = 'Your Store',
    disabled = false,
    onSuccess,
    onError,
}: PayPalPaymentProps) {
    const clientId =
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    const environment =
        process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT ===
        'production'
            ? 'production'
            : 'sandbox';

    if (!clientId) {
        return (
            <PaymentError message="PayPal Client ID is not configured." />
        );
    }

    return (
        <PayPalProvider
            clientId={clientId}
            environment={environment}
            components={[
                'paypal-payments',
                'venmo-payments',
                'applepay-payments',
                'googlepay-payments',
            ]}
            pageType="checkout"
            locale="en-US"
            testBuyerCountry={
                environment === 'sandbox'
                    ? 'US'
                    : undefined
            }
        >
            <PaymentMethodRenderer
                paymentMethod={paymentMethod}
                checkoutData={checkoutData}
                amount={amount}
                currency={currency}
                merchantName={merchantName}
                disabled={disabled}
                onSuccess={onSuccess}
                onError={onError}
            />
        </PayPalProvider>
    );
}

/* ------------------------------------------------------------------ */
/* Payment method renderer                                            */
/* ------------------------------------------------------------------ */

function PaymentMethodRenderer({
    paymentMethod,
    checkoutData,
    amount,
    currency = 'USD',
    merchantName = 'Your Store',
    disabled = false,
    onSuccess,
    onError,
}: PayPalPaymentProps) {
    const {
        eligiblePaymentMethods,
        isLoading,
        error,
    } = useEligibleMethods({
        payload: {
            amount: amount.toFixed(2),
            currencyCode: currency.toUpperCase(),
            paymentFlow: 'ONE_TIME_PAYMENT',
        },
    });

    /* ----------------------------------------------------------------
       Create PayPal order
       ---------------------------------------------------------------- */

    const handleCreateOrder = useCallback(
        async () => {
            if (disabled) {
                throw new Error(
                    'Payment is currently disabled.',
                );
            }

            const result =
                await createPayPalOrderAction(
                    checkoutData,
                );

            if (!result.success) {
                throw new Error(
                    result.error ||
                        'Unable to create PayPal order.',
                );
            }

            if (!result.data?.id) {
                throw new Error(
                    'PayPal did not return an order ID.',
                );
            }

            return {
                orderId: result.data.id,
            };
        },
        [checkoutData, disabled],
    );

    /* ----------------------------------------------------------------
       Approved payment → capture → create Mongo order
       ---------------------------------------------------------------- */

    const handleApprovedPayment = useCallback(
        async (data: unknown) => {
            try {
                const orderId =
                    getApprovalOrderId(data);

                if (!orderId) {
                    throw new Error(
                        'PayPal did not return an order ID.',
                    );
                }

                const result =
                    await capturePayPalOrderAction(
                        checkoutData,
                        orderId,
                    );

                if (!result.success) {
                    throw new Error(
                        result.error ||
                            'Payment could not be completed.',
                    );
                }

                if (!result.data) {
                    throw new Error(
                        'Payment completed, but order details were not returned.',
                    );
                }

                await onSuccess(result.data);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Payment failed. Please try again.';

                onError?.(message);
            }
        },
        [
            checkoutData,
            onError,
            onSuccess,
        ],
    );

    /* ----------------------------------------------------------------
       SDK / eligibility state
       ---------------------------------------------------------------- */

    if (isLoading) {
        return <PaymentLoading />;
    }

    if (error) {
        return (
            <PaymentError message="Unable to load available payment methods." />
        );
    }

    if (!eligiblePaymentMethods) {
        return (
            <PaymentError message="No payment method is available right now." />
        );
    }

    /* ----------------------------------------------------------------
       Eligibility
       ---------------------------------------------------------------- */

    if (
        !eligiblePaymentMethods.isEligible(
            paymentMethod,
        )
    ) {
        return (
            <PaymentError
                message={`${getPaymentMethodLabel(
                    paymentMethod,
                )} is not available for this checkout.`}
            />
        );
    }

    /* ----------------------------------------------------------------
       Payment buttons
       ---------------------------------------------------------------- */

    switch (paymentMethod) {
        case 'paypal':
            return (
                <PayPalOneTimePaymentButton
                    createOrder={
                        handleCreateOrder
                    }
                    onApprove={(
                        data: OnApproveDataOneTimePayments,
                    ) =>
                        handleApprovedPayment(
                            data,
                        )
                    }
                    onCancel={() => {
                        onError?.(
                            'PayPal payment was cancelled.',
                        );
                    }}
                    onError={(error) => {
                        onError?.(
                            error.message ||
                                'PayPal payment failed.',
                        );
                    }}
                    presentationMode="auto"
                    disabled={disabled}
                />
            );

        case 'paylater':
            return (
                <PayLaterOneTimePaymentButton
                    createOrder={
                        handleCreateOrder
                    }
                    onApprove={(data) =>
                        handleApprovedPayment(
                            data,
                        )
                    }
                    onCancel={() => {
                        onError?.(
                            'Pay Later payment was cancelled.',
                        );
                    }}
                    onError={(error) => {
                        onError?.(
                            error.message ||
                                'Pay Later payment failed.',
                        );
                    }}
                    presentationMode="auto"
                    disabled={disabled}
                />
            );

        case 'venmo':
            return (
                <VenmoOneTimePaymentButton
                    createOrder={
                        handleCreateOrder
                    }
                    onApprove={(data) =>
                        handleApprovedPayment(
                            data,
                        )
                    }
                    onCancel={() => {
                        onError?.(
                            'Venmo payment was cancelled.',
                        );
                    }}
                    onError={(error) => {
                        onError?.(
                            error.message ||
                                'Venmo payment failed.',
                        );
                    }}
                    presentationMode="auto"
                    disabled={disabled}
                />
            );

        case 'applepay':
            return (
                <ApplePayPaymentButton
                    createOrder={
                        handleCreateOrder
                    }
                    amount={amount}
                    currency={currency}
                    merchantName={merchantName}
                    onApprove={
                        handleApprovedPayment
                    }
                    onError={onError}
                    disabled={disabled}
                />
            );

        case 'googlepay':
            return (
                <GooglePayPaymentButton
                    createOrder={
                        handleCreateOrder
                    }
                    checkoutData={checkoutData}
                    amount={amount}
                    currency={currency}
                    onSuccess={onSuccess}
                    onError={onError}
                    disabled={disabled}
                />
            );

        default:
            return null;
    }
}

/* ------------------------------------------------------------------ */
/* Apple Pay                                                          */
/* ------------------------------------------------------------------ */

interface ApplePayPaymentButtonProps {
    createOrder: () => Promise<{
        orderId: string;
    }>;

    amount: number;

    currency: string;

    merchantName: string;

    onApprove: (
        data: unknown,
    ) => Promise<void>;

    onError?: (message: string) => void;

    disabled: boolean;
}

function ApplePayPaymentButton({
    createOrder,
    amount,
    currency,
    merchantName,
    onApprove,
    onError,
    disabled,
}: ApplePayPaymentButtonProps) {
    const {
        eligiblePaymentMethods,
    } = usePayPal();

    const details =
        eligiblePaymentMethods?.getDetails(
            'applepay',
        );

    if (!details?.config) {
        return (
            <PaymentError message="Apple Pay configuration is unavailable." />
        );
    }

    return (
        <ApplePayOneTimePaymentButton
            applePayConfig={
                details.config
            }
            paymentRequest={{
                countryCode: 'US',
                currencyCode:
                    currency.toUpperCase(),
                total: {
                    label: merchantName,
                    amount:
                        amount.toFixed(2),
                    type: 'final',
                },
            }}
            applePaySessionVersion={4}
            createOrder={createOrder}
            onApprove={(data) =>
                onApprove(data)
            }
            onCancel={() => {
                onError?.(
                    'Apple Pay payment was cancelled.',
                );
            }}
            onError={(error) => {
                onError?.(
                    error.message ||
                        'Apple Pay payment failed.',
                );
            }}
            displayName={merchantName}
            domainName={
                typeof window !== 'undefined'
                    ? window.location.hostname
                    : ''
            }
            buttonstyle="black"
            type="pay"
            locale="en"
            disabled={disabled}
        />
    );
}

/* ------------------------------------------------------------------ */
/* Google Pay                                                         */
/* ------------------------------------------------------------------ */

interface GooglePayPaymentButtonProps {
    createOrder: () => Promise<{
        orderId: string;
    }>;

    checkoutData: PlaceOrderInput;

    amount: number;

    currency: string;

    onSuccess: (
        result: PayPalPaymentSuccess,
    ) => void | Promise<void>;

    onError?: (message: string) => void;

    disabled: boolean;
}

function GooglePayPaymentButton({
    createOrder,
    checkoutData,
    amount,
    currency,
    onSuccess,
    onError,
    disabled,
}: GooglePayPaymentButtonProps) {
    const {
        sdkInstance,
        eligiblePaymentMethods,
    } = usePayPal();

    const containerRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const onSuccessRef =
        useRef(onSuccess);

    const onErrorRef =
        useRef(onError);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isReady, setIsReady] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    /* ----------------------------------------------------------------
       Keep latest callbacks without forcing
       Google Pay SDK setup to restart.
       ---------------------------------------------------------------- */

    useEffect(() => {
        onSuccessRef.current =
            onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        onErrorRef.current =
            onError;
    }, [onError]);

    /* ----------------------------------------------------------------
       Google Pay setup
       ---------------------------------------------------------------- */

    useEffect(() => {
        let cancelled = false;

        async function setup() {
            try {
                setIsLoading(true);
                setIsReady(false);
                setError(null);

                if (!sdkInstance) {
                    return;
                }

                if (!eligiblePaymentMethods) {
                    return;
                }

                const details =
                    eligiblePaymentMethods.getDetails(
                        'googlepay',
                    );

                if (!details?.config) {
                    throw new Error(
                        'Google Pay configuration is unavailable.',
                    );
                }

                await loadGooglePayScript();

                if (cancelled) {
                    return;
                }

                const googleApi =
                    getGooglePayApi();

                if (!googleApi) {
                    throw new Error(
                        'Google Pay SDK is unavailable.',
                    );
                }

                /* ----------------------------------------------------
                   Create PayPal Google Pay session
                   ---------------------------------------------------- */

                const googlePaySession =
                    sdkInstance.createGooglePayOneTimePaymentSession();

                /* ----------------------------------------------------
                   Current PayPal v6 API:
                   getGooglePayConfig()
                   ---------------------------------------------------- */

                const googlePayConfig =
                    await googlePaySession.getGooglePayConfig();

                if (cancelled) {
                    return;
                }

                /* ----------------------------------------------------
                   Initialize Google PaymentsClient
                   ---------------------------------------------------- */

                const paymentsClient =
                    new googleApi.PaymentsClient({
                        environment:
                            process.env
                                .NEXT_PUBLIC_PAYPAL_ENVIRONMENT ===
                            'production'
                                ? 'PRODUCTION'
                                : 'TEST',

                        paymentDataCallbacks: {
                            onPaymentAuthorized:
                                async (
                                    paymentData,
                                ) => {
                                    try {
                                        /**
                                         * PayPal's official Google Pay
                                         * integration creates the order
                                         * after Google Pay authorization.
                                         */
                                        const created =
                                            await createOrder();

                                        /**
                                         * Confirm Google Pay payment
                                         * data with the PayPal order.
                                         */
                                        const confirmation =
                                            await googlePaySession.confirmOrder(
                                                {
                                                    orderId:
                                                        created.orderId,

                                                    paymentMethodData:
                                                        paymentData.paymentMethodData as unknown as Parameters<
                                                            typeof googlePaySession.confirmOrder
                                                        >[0]['paymentMethodData'],
                                                },
                                            );

                                        /* --------------------------------
                                           Handle payer authentication
                                           -------------------------------- */

                                        if (
                                            confirmation.status ===
                                            'PAYER_ACTION_REQUIRED'
                                        ) {
                                            await googlePaySession.initiatePayerAction(
                                                {
                                                    orderId:
                                                        created.orderId,
                                                },
                                            );
                                        } else if (
                                            confirmation.status !==
                                            'APPROVED'
                                        ) {
                                            throw new Error(
                                                'Google Pay payment could not be approved.',
                                            );
                                        }

                                        /* --------------------------------
                                           Capture through server
                                           -------------------------------- */

                                        const result =
                                            await capturePayPalOrderAction(
                                                checkoutData,
                                                created.orderId,
                                            );

                                        if (
                                            !result.success
                                        ) {
                                            throw new Error(
                                                result.error ||
                                                    'Google Pay payment could not be completed.',
                                            );
                                        }

                                        if (
                                            !result.data
                                        ) {
                                            throw new Error(
                                                'Payment completed, but order details were not returned.',
                                            );
                                        }

                                        await onSuccessRef.current?.(
                                            result.data,
                                        );

                                        return {
                                            transactionState:
                                                'SUCCESS',
                                        };
                                    } catch (
                                        error
                                    ) {
                                        const message =
                                            error instanceof
                                            Error
                                                ? error.message
                                                : 'Google Pay payment failed.';

                                        onErrorRef.current?.(
                                            message,
                                        );

                                        return {
                                            transactionState:
                                                'ERROR',

                                            error: {
                                                message,
                                            },
                                        };
                                    }
                                },
                        },
                    });

                /* ----------------------------------------------------
                   Check Google Pay readiness
                   ---------------------------------------------------- */

                const readiness =
                    await paymentsClient.isReadyToPay(
                        {
                            allowedPaymentMethods:
                                googlePayConfig.allowedPaymentMethods,

                            apiVersion:
                                googlePayConfig.apiVersion,

                            apiVersionMinor:
                                googlePayConfig.apiVersionMinor,
                        },
                    );

                if (cancelled) {
                    return;
                }

                if (!readiness.result) {
                    setIsReady(false);
                    return;
                }

                /* ----------------------------------------------------
                   Create Google Pay button
                   ---------------------------------------------------- */

                const button =
                    paymentsClient.createButton({
                        onClick: async () => {
                            if (disabled) {
                                return;
                            }

                            try {
                                setError(null);

                                const {
                                    allowedPaymentMethods,
                                    merchantInfo,
                                    apiVersion,
                                    apiVersionMinor,
                                    countryCode,
                                } =
                                    googlePayConfig;

                                const paymentDataRequest: GooglePayPaymentDataRequest =
                                    {
                                        apiVersion,
                                        apiVersionMinor,

                                        allowedPaymentMethods,

                                        merchantInfo,

                                        transactionInfo: {
                                            totalPriceStatus:
                                                'FINAL',

                                            totalPrice:
                                                amount.toFixed(
                                                    2,
                                                ),

                                            currencyCode:
                                                currency.toUpperCase(),

                                            countryCode:
                                                countryCode ||
                                                'US',

                                            totalPriceLabel:
                                                'Total',
                                        },

                                        callbackIntents: [
                                            'PAYMENT_AUTHORIZATION',
                                        ],
                                    };

                                await paymentsClient.loadPaymentData(
                                    paymentDataRequest,
                                );
                            } catch (
                                error
                            ) {
                                const message =
                                    error instanceof
                                    Error
                                        ? error.message
                                        : 'Google Pay payment failed.';

                                setError(
                                    message,
                                );

                                onErrorRef.current?.(
                                    message,
                                );
                            }
                        },

                        buttonColor:
                            'black',

                        buttonType: 'pay',
                    });

                if (cancelled) {
                    return;
                }

                /**
                 * IMPORTANT:
                 *
                 * The container is rendered even while loading.
                 * Therefore containerRef.current is available here.
                 *
                 * This fixes the previous delayed/two-render button issue.
                 */
                if (containerRef.current) {
                    containerRef.current.replaceChildren(
                        button,
                    );
                }

                setIsReady(true);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : 'Google Pay could not be initialized.';

                setError(message);

                onErrorRef.current?.(
                    message,
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void setup();

        return () => {
            cancelled = true;

            if (
                containerRef.current
            ) {
                containerRef.current.replaceChildren();
            }
        };
    }, [
        amount,
        checkoutData,
        createOrder,
        currency,
        disabled,
        eligiblePaymentMethods,
        sdkInstance,
    ]);

    /* ----------------------------------------------------------------
       IMPORTANT:
       Keep the container mounted while loading so the ref exists
       when the async Google Pay setup finishes.
       ---------------------------------------------------------------- */

    return (
        <div className="w-full space-y-3">
            <div
                ref={containerRef}
                className="min-h-12 w-full"
            />

            {isLoading ? (
                <PaymentLoading />
            ) : null}

            {!isLoading && error ? (
                <PaymentError
                    message={error}
                />
            ) : null}

            {!isLoading &&
            !error &&
            !isReady ? (
                <PaymentError message="Google Pay is not available on this device or browser." />
            ) : null}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                   */
/* ------------------------------------------------------------------ */

function PaymentLoading() {
    return (
        <div className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-500">
            Loading payment...
        </div>
    );
}

function PaymentError({
    message,
}: {
    message: string;
}) {
    return (
        <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
            {message}
        </div>
    );
}