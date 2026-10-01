'use client';

import Link from 'next/link';

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import { AlertCircle, ArrowLeft } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { checkoutSchema } from '@/lib/validation/order.schema';

import {
    categoryName,
    DEFAULT_CURRENCY,
} from '@/lib/constants';

import { useCartStore } from '@/store/cart.store';

import {
    getCheckoutSummaryAction,
    placeOrderAction,
    type CheckoutSummaryDTO,
} from './action';

import { ContactInformation } from './components/ContactInformation';
import { ShippingAddress } from './components/ShippingAddress';

import {
    PaymentMethod,
    type PaymentMethodValue,
} from './components/PaymentMethod';

import { OrderSummary } from './components/OrderSummary';

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

interface ContactInfo {
    name: string;
    email: string;
    phone: string;
}

interface ShippingAddressInfo {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface FieldErrors {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    paymentMethod?: string;
}

/* ========================================================================== */
/* Component                                                                  */
/* ========================================================================== */

export function CheckoutPageClient() {
    const router = useRouter();

    /* ======================================================================
       Cart
    ====================================================================== */

    const cartItems = useCartStore(
        (state) => state.items,
    );

    const clearCart = useCartStore(
        (state) => state.clear,
    );

    /* ======================================================================
       Form state
    ====================================================================== */

    const [contact, setContact] =
        useState<ContactInfo>({
            name: '',
            email: '',
            phone: '',
        });

    const [shippingAddress, setShippingAddress] =
        useState<ShippingAddressInfo>({
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'United States',
        });

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodValue>('cod');

    /* ======================================================================
       Checkout state
    ====================================================================== */

    const [summary, setSummary] =
        useState<CheckoutSummaryDTO | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState('');

    const [fieldErrors, setFieldErrors] =
        useState<FieldErrors>({});

    /* ======================================================================
       Load checkout summary
    ====================================================================== */

    useEffect(() => {
        let cancelled = false;

        async function loadCheckout() {
            /* --------------------------------------------------------------
               Empty cart
            -------------------------------------------------------------- */

            if (cartItems.length === 0) {
                if (!cancelled) {
                    setLoading(false);
                    setSummary(null);
                    setError('');
                }

                return;
            }

            /* --------------------------------------------------------------
               Start loading
            -------------------------------------------------------------- */

            setLoading(true);
            setError('');

            /* --------------------------------------------------------------
               Server-authoritative checkout summary
            -------------------------------------------------------------- */

            const result =
                await getCheckoutSummaryAction(
                    cartItems,
                );

            /* --------------------------------------------------------------
               Ignore outdated request
            -------------------------------------------------------------- */

            if (cancelled) {
                return;
            }

            /* --------------------------------------------------------------
               Server action failed
            -------------------------------------------------------------- */

            if (!result.success) {
                setError(
                    result.error ||
                        'Unable to validate your cart.',
                );

                setSummary(null);
                setLoading(false);

                return;
            }

            /* --------------------------------------------------------------
               Missing data
            -------------------------------------------------------------- */

            if (!result.data) {
                setError(
                    'Unable to load checkout details.',
                );

                setSummary(null);
                setLoading(false);

                return;
            }

            /* --------------------------------------------------------------
               Store latest summary
            -------------------------------------------------------------- */

            setSummary(result.data);
            setLoading(false);
        }

        loadCheckout();

        return () => {
            cancelled = true;
        };
    }, [cartItems]);

    /* ======================================================================
       Availability
    ====================================================================== */

    const hasUnavailableItems = useMemo(() => {
        if (!summary) {
            return true;
        }

        /*
         * An item is unavailable when:
         *
         * 1. Product/size was removed
         * 2. Product/size is inactive
         * 3. Cart quantity is greater than current size stock
         */
        return (
            summary.removedProductIds.length >
                0 ||
            summary.items.some(
                (item) =>
                    !item.isActive ||
                    item.quantity >
                        item.availableStock,
            )
        );
    }, [summary]);

    /* ======================================================================
       Submit
    ====================================================================== */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        /* --------------------------------------------------------------
           Prevent duplicate submission
        -------------------------------------------------------------- */

        if (submitting) {
            return;
        }

        setError('');
        setFieldErrors({});

        /* --------------------------------------------------------------
           Summary check
        -------------------------------------------------------------- */

        if (!summary) {
            setError(
                'Unable to load your order summary.',
            );

            return;
        }

        /* --------------------------------------------------------------
           Availability check
        -------------------------------------------------------------- */

        if (hasUnavailableItems) {
            setError(
                'Please update your cart before placing the order.',
            );

            return;
        }

        /* --------------------------------------------------------------
           Client-side validation
        -------------------------------------------------------------- */

        const checkoutData = {
            customer: contact,
            shippingAddress,
            paymentMethod,
        };

        const parsed =
            checkoutSchema.safeParse(
                checkoutData,
            );

        if (!parsed.success) {
            const errors: FieldErrors = {};

            for (const issue of parsed.error
                .issues) {
                const path =
                    issue.path.join('.');

                if (
                    path === 'customer.name' &&
                    !errors.name
                ) {
                    errors.name =
                        issue.message;
                }

                if (
                    path === 'customer.email' &&
                    !errors.email
                ) {
                    errors.email =
                        issue.message;
                }

                if (
                    path === 'customer.phone' &&
                    !errors.phone
                ) {
                    errors.phone =
                        issue.message;
                }

                if (
                    path ===
                        'shippingAddress.address' &&
                    !errors.address
                ) {
                    errors.address =
                        issue.message;
                }

                if (
                    path ===
                        'shippingAddress.city' &&
                    !errors.city
                ) {
                    errors.city =
                        issue.message;
                }

                if (
                    path ===
                        'shippingAddress.state' &&
                    !errors.state
                ) {
                    errors.state =
                        issue.message;
                }

                if (
                    path ===
                        'shippingAddress.postalCode' &&
                    !errors.postalCode
                ) {
                    errors.postalCode =
                        issue.message;
                }

                if (
                    path ===
                        'shippingAddress.country' &&
                    !errors.country
                ) {
                    errors.country =
                        issue.message;
                }

                if (
                    path === 'paymentMethod' &&
                    !errors.paymentMethod
                ) {
                    errors.paymentMethod =
                        issue.message;
                }
            }

            setFieldErrors(errors);

            return;
        }

        /* --------------------------------------------------------------
           Start placing order
        -------------------------------------------------------------- */

        setSubmitting(true);

        /*
         * The server receives:
         *
         * customer
         * shippingAddress
         * paymentMethod
         * productId
         * size
         * quantity
         *
         * Prices, totals and stock are recalculated on the server.
         */
        const result =
            await placeOrderAction({
                ...parsed.data,
                items: cartItems,
            });

        /* --------------------------------------------------------------
           Order failed
        -------------------------------------------------------------- */

        if (!result.success) {
            const message =
                result.error ||
                'Unable to place your order.';

            setError(message);
            setSubmitting(false);

            toast.error(message);

            return;
        }

        /* --------------------------------------------------------------
           Missing confirmation token
        -------------------------------------------------------------- */

        if (!result.data) {
            setError(
                'Order was created but no confirmation token was returned.',
            );

            setSubmitting(false);

            return;
        }

        /* --------------------------------------------------------------
           Order successfully created
        -------------------------------------------------------------- */

        clearCart();

        router.push(
            `/order-confirmation/${result.data.confirmationToken}`,
        );
    };

    /* ======================================================================
       Empty cart
    ====================================================================== */

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-[#fff8f2]">
                <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-3 py-10 sm:px-6 sm:py-16">
                    <div className="w-full rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-2xl shadow-gray-50 sm:p-8">
                        <h1 className="font-serif text-2xl font-bold text-[#3b2419] sm:text-3xl">
                            Your cart is empty
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                            Add some{' '}
                            {categoryName} before
                            continuing to checkout.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
                        >
                            Shop {categoryName}
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ======================================================================
       Main checkout page
    ====================================================================== */

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {/* ==========================================================
                    Header
                ========================================================== */}

                <div className="mb-6 sm:mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-orange-600"
                    >
                        <ArrowLeft className="h-4 w-4" />

                        Back to Cart
                    </Link>

                    <h1 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#3b2419] sm:text-3xl md:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                        Complete your details and
                        place your order.
                    </p>
                </div>

                {/* ==========================================================
                    General error
                ========================================================== */}

                {error ? (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700 sm:mb-6 sm:p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <p className="min-w-0 leading-5">
                            {error}
                        </p>
                    </div>
                ) : null}

                {/* ==========================================================
                    Unavailable products
                ========================================================== */}

                {summary &&
                hasUnavailableItems ? (
                    <div className="mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 sm:mb-6">
                        <p className="font-semibold">
                            Some items are no longer
                            available.
                        </p>

                        <p className="mt-1 leading-5">
                            A selected size may have
                            insufficient stock. Please
                            return to your cart and
                            update the quantity before
                            placing the order.
                        </p>

                        <Link
                            href="/cart"
                            className="mt-3 inline-flex cursor-pointer font-semibold text-yellow-900 underline underline-offset-2"
                        >
                            Update Cart
                        </Link>
                    </div>
                ) : null}

                {/* ==========================================================
                    Loading
                ========================================================== */}

                {loading ? (
                    <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-2xl shadow-gray-50 sm:p-10">
                        <p className="text-sm text-gray-500 sm:text-base">
                            Checking your cart...
                        </p>
                    </div>
                ) : summary ? (
                    <form
                        onSubmit={handleSubmit}
                        className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
                    >
                        {/* ==================================================
                            Left
                        ================================================== */}

                        <div className="min-w-0 space-y-5 sm:space-y-6">
                            <ContactInformation
                                value={contact}
                                onChange={
                                    setContact
                                }
                                errors={{
                                    name: fieldErrors.name,
                                    email: fieldErrors.email,
                                    phone: fieldErrors.phone,
                                }}
                            />

                            <ShippingAddress
                                value={
                                    shippingAddress
                                }
                                onChange={
                                    setShippingAddress
                                }
                                errors={{
                                    address:
                                        fieldErrors.address,
                                    city:
                                        fieldErrors.city,
                                    state:
                                        fieldErrors.state,
                                    postalCode:
                                        fieldErrors.postalCode,
                                    country:
                                        fieldErrors.country,
                                }}
                            />

                            <PaymentMethod
                                value={
                                    paymentMethod
                                }
                                onChange={
                                    setPaymentMethod
                                }
                                error={
                                    fieldErrors.paymentMethod
                                }
                            />
                        </div>

                        {/* ==================================================
                            Right
                        ================================================== */}

                        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                            <OrderSummary
                                items={summary.items.map(
                                    (item) => ({
                                        productId:
                                            item.productId,
                                        name: item.name,
                                        image: item.image,

                                        /*
                                         * IMPORTANT:
                                         * Size must be passed here.
                                         */
                                        size: item.size,

                                        quantity:
                                            item.quantity,

                                        lineTotal:
                                            item.lineTotal,
                                    }),
                                )}
                                subtotal={
                                    summary.subtotal
                                }
                                discountAmount={
                                    summary.discountAmount
                                }
                                shippingCost={
                                    summary.shippingCost
                                }
                                totalAmount={
                                    summary.totalAmount
                                }
                                currency={
                                    DEFAULT_CURRENCY
                                }
                                submitting={
                                    submitting
                                }
                                disabled={
                                    loading ||
                                    hasUnavailableItems
                                }
                            />
                        </div>
                    </form>
                ) : null}
            </div>
        </main>
    );
}