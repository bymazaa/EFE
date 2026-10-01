'use client';

import Image from 'next/image';

import {
    Loader2,
    ShoppingBag,
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderItem {
    productId: string;
    name: string;
    image: string;
    size: string;
    quantity: number;
    lineTotal: number;
}

interface OrderSummaryProps {
    items: OrderItem[];
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    submitting: boolean;
    disabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function OrderSummary({
    items,
    subtotal,
    discountAmount,
    shippingCost,
    totalAmount,
    currency,
    submitting,
    disabled,
}: OrderSummaryProps) {
    return (
        <section className="w-full min-w-0 rounded-3xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50 sm:p-6 lg:sticky lg:top-24">
            {/* =========================================================
                Header
            ========================================================= */}

            <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 sm:h-11 sm:w-11 sm:rounded-2xl">
                    <ShoppingBag className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <h2 className="font-serif text-xl font-bold text-[#3b2419] sm:text-2xl">
                        Order Summary
                    </h2>

                    <p className="mt-0.5 text-xs leading-5 text-gray-500 sm:text-sm">
                        Review your order.
                    </p>
                </div>
            </div>

            {/* =========================================================
                Items
            ========================================================= */}

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={`${item.productId}:${item.size}`}
                        className="flex min-w-0 items-center gap-3"
                    >
                        {/* -------------------------------------------------
                            Image
                        ------------------------------------------------- */}

                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#fff7f0] sm:h-16 sm:w-16 sm:rounded-2xl">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-gray-400">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* -------------------------------------------------
                            Product info
                        ------------------------------------------------- */}

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold leading-5 text-[#3b2419] sm:text-sm">
                                {item.name}
                            </p>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] leading-5 sm:text-xs">
                                <span className="text-gray-500">
                                    Size:
                                </span>

                                <span className="font-semibold text-[#3b2419]">
                                    {item.size}
                                </span>

                                <span className="text-gray-300">
                                    •
                                </span>

                                <span className="text-gray-500">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                        </div>

                        {/* -------------------------------------------------
                            Line total
                        ------------------------------------------------- */}

                        <p className="shrink-0 text-right text-xs font-semibold text-[#3b2419] sm:text-sm">
                            {formatPrice(
                                item.lineTotal,
                                currency,
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* =========================================================
                Divider
            ========================================================= */}

            <div className="my-5 border-t border-orange-100 sm:my-6" />

            {/* =========================================================
                Pricing
            ========================================================= */}

            <div className="space-y-3 text-sm">
                {/* -----------------------------------------------------
                    Subtotal
                ----------------------------------------------------- */}

                <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Subtotal</span>

                    <span className="shrink-0 font-medium text-gray-900">
                        {formatPrice(
                            subtotal,
                            currency,
                        )}
                    </span>
                </div>

                {/* -----------------------------------------------------
                    Discount
                ----------------------------------------------------- */}

                {discountAmount > 0 && (
                    <div className="flex items-center justify-between gap-4 text-green-600">
                        <span>You save</span>

                        <span className="shrink-0 font-medium">
                            -
                            {formatPrice(
                                discountAmount,
                                currency,
                            )}
                        </span>
                    </div>
                )}

                {/* -----------------------------------------------------
                    Shipping
                ----------------------------------------------------- */}

                <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Shipping</span>

                    <span className="shrink-0 font-medium text-gray-900">
                        {shippingCost === 0
                            ? 'Free'
                            : formatPrice(
                                  shippingCost,
                                  currency,
                              )}
                    </span>
                </div>
            </div>

            {/* =========================================================
                Total Divider
            ========================================================= */}

            <div className="my-5 border-t border-orange-100 sm:my-6" />

            {/* =========================================================
                Total
            ========================================================= */}

            <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 sm:text-sm">
                        Total
                    </p>

                    <p className="mt-1 font-serif text-xl font-bold text-[#3b2419] sm:text-2xl">
                        {formatPrice(
                            totalAmount,
                            currency,
                        )}
                    </p>
                </div>
            </div>

            {/* =========================================================
                Submit Button
            ========================================================= */}

            <button
                type="submit"
                disabled={
                    disabled || submitting
                }
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:px-5"
            >
                {submitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        <span>
                            Placing Order...
                        </span>
                    </>
                ) : (
                    'Place Order'
                )}
            </button>

            {/* =========================================================
                Terms
            ========================================================= */}

            <p className="mt-3 text-center text-[11px] leading-5 text-gray-500 sm:text-xs">
                By placing your order, you agree to
                our terms and purchase conditions.
            </p>
        </section>
    );
}