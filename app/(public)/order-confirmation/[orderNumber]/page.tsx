import type { Metadata } from 'next';

import Link from 'next/link';

import {
    CheckCircle2,
    Mail,
    MapPin,
    Package,
    Phone,
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';

import {
    getOrderByConfirmationToken,
    type OrderDTO,
} from '@/services/order.service';

export const metadata: Metadata = {
    title: 'Order Confirmation',
    robots: {
        index: false,
        follow: false,
    },
};

interface PageProps {
    params: Promise<{
        orderNumber: string;
    }>;
}

export default async function OrderConfirmationPage({
    params,
}: PageProps) {
    const { orderNumber } = await params;

    const order = await getOrderByConfirmationToken(
        orderNumber,
    );

    /* ==========================================================
       Order not found
    ========================================================== */

    if (!order) {
        return (
            <main className="min-h-screen bg-[#fff8f2]">
                <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
                    <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-2xl shadow-gray-50">
                        <Package className="mx-auto h-12 w-12 text-orange-500" />

                        <h1 className="mt-5 font-serif text-3xl font-bold text-[#3b2419]">
                            Order Not Found
                        </h1>

                        <p className="mt-3 text-gray-500">
                            This order confirmation link is
                            invalid or has expired.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ==========================================================
       Order confirmed
    ========================================================== */

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
                {/* ==================================================
                    Success Header
                ================================================== */}

                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 className="h-9 w-9" />
                    </div>

                    <h1 className="mt-5 font-serif text-3xl font-bold text-[#3b2419] sm:text-4xl">
                        Order Confirmed!
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-gray-500">
                        Thank you for your order. We&apos;ve
                        received your order and will start
                        processing it shortly.
                    </p>

                    <div className="mt-5 inline-flex items-center rounded-full border border-orange-100 bg-white px-5 py-2 text-sm shadow-sm">
                        <span className="text-gray-500">
                            Order
                        </span>

                        <span className="ml-2 font-semibold text-[#3b2419]">
                            #{order.orderNumber}
                        </span>
                    </div>
                </div>

                {/* ==================================================
                    Main Content
                ================================================== */}

                <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        {/* ==================================================
                            Customer Information
                        ================================================== */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                            <h2 className="font-serif text-xl font-bold text-[#3b2419]">
                                Customer Information
                            </h2>

                            <div className="mt-5 space-y-4 text-sm">
                                {/* Name */}

                                <div className="flex items-start gap-3">
                                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-400">
                                            Name
                                        </p>

                                        <p className="font-medium text-gray-700">
                                            {order.customer.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}

                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-400">
                                            Email
                                        </p>

                                        <p className="break-words font-medium text-gray-700">
                                            {
                                                order
                                                    .customer
                                                    .email
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Phone */}

                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Phone
                                        </p>

                                        <p className="font-medium text-gray-700">
                                            {
                                                order
                                                    .customer
                                                    .phone
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            Shipping Address
                        ================================================== */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                            <h2 className="font-serif text-xl font-bold text-[#3b2419]">
                                Shipping Address
                            </h2>

                            <div className="mt-5 flex gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />

                                <div className="text-sm leading-6 text-gray-600">
                                    <p className="font-medium text-gray-800">
                                        {
                                            order
                                                .shippingAddress
                                                .address
                                        }
                                    </p>

                                    <p>
                                        {
                                            order
                                                .shippingAddress
                                                .city
                                        }

                                        {order
                                            .shippingAddress
                                            .state
                                            ? `, ${order.shippingAddress.state}`
                                            : ''}
                                    </p>

                                    <p>
                                        {
                                            order
                                                .shippingAddress
                                                .postalCode
                                        }
                                    </p>

                                    <p>
                                        {
                                            order
                                                .shippingAddress
                                                .country
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            Order Items
                        ================================================== */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-[#3b2419]">
                                        Order Items
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {order.items.length}{' '}
                                        {order.items.length ===
                                        1
                                            ? 'item'
                                            : 'items'}{' '}
                                        in this order
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 divide-y divide-orange-100">
                                {order.items.map(
                                    (item) => (
                                        <div
                                            key={`${item.productId}-${item.size}`}
                                            className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                        >
                                            {/* Product image */}

                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fff7f0] sm:h-20 sm:w-20">
                                                {item.productImage ? (
                                                    <img
                                                        src={
                                                            item.productImage
                                                        }
                                                        alt={
                                                            item.productName
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="h-5 w-5 text-orange-300" />
                                                )}
                                            </div>

                                            {/* Product information */}

                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold leading-5 text-[#3b2419]">
                                                    {
                                                        item.productName
                                                    }
                                                </p>

                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                                                    <span>
                                                        Size:{' '}
                                                        <span className="font-medium text-gray-700">
                                                            {item.size ||
                                                                '—'}
                                                        </span>
                                                    </span>

                                                    <span className="text-gray-300">
                                                        •
                                                    </span>

                                                    <span>
                                                        Qty:{' '}
                                                        {
                                                            item.quantity
                                                        }
                                                    </span>
                                                </div>

                                                {item.quantity >
                                                1 ? (
                                                    <p className="mt-1 text-[11px] text-gray-400">
                                                        {formatPrice(
                                                            item.unitPrice,
                                                            order.currency,
                                                        )}{' '}
                                                        each
                                                    </p>
                                                ) : null}
                                            </div>

                                            {/* Total price */}

                                            <div className="shrink-0 text-right">
                                                <p className="font-semibold text-[#3b2419]">
                                                    {formatPrice(
                                                        item.totalPrice,
                                                        order.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ==================================================
                        Order Summary
                    ================================================== */}

                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                            <h2 className="font-serif text-xl font-bold text-[#3b2419]">
                                Order Summary
                            </h2>

                            <div className="mt-6 space-y-3 text-sm">
                                {/* Subtotal */}

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {formatPrice(
                                            order.subtotal,
                                            order.currency,
                                        )}
                                    </span>
                                </div>

                                {/* Discount */}

                                {order.discountAmount >
                                    0 && (
                                    <div className="flex justify-between gap-4 text-green-600">
                                        <span>
                                            Discount
                                        </span>

                                        <span>
                                            -
                                            {formatPrice(
                                                order.discountAmount,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>
                                )}

                                {/* Shipping */}

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Shipping
                                    </span>

                                    <span className="font-medium text-gray-900">
                                        {order.shippingCost ===
                                        0
                                            ? 'Free'
                                            : formatPrice(
                                                  order.shippingCost,
                                                  order.currency,
                                              )}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}

                            <div className="my-5 border-t border-orange-100" />

                            {/* Total */}

                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-gray-700">
                                    Total
                                </span>

                                <span className="font-serif text-2xl font-bold text-[#3b2419]">
                                    {formatPrice(
                                        order.totalAmount,
                                        order.currency,
                                    )}
                                </span>
                            </div>

                            {/* Order meta */}

                            <div className="mt-6 space-y-3 rounded-2xl bg-[#fff8f2] p-4 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-500">
                                        Order Status
                                    </span>

                                    <span className="font-semibold capitalize text-[#3b2419]">
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-500">
                                        Payment Method
                                    </span>

                                    <span className="font-semibold uppercase text-[#3b2419]">
                                        {
                                            order.paymentMethod
                                        }
                                    </span>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-gray-500">
                                        Payment Status
                                    </span>

                                    <span className="font-semibold capitalize text-[#3b2419]">
                                        {
                                            order.paymentStatus
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Continue shopping */}

                            <Link
                                href="/products"
                                className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Continue Shopping
                            </Link>

                            {/* Track order */}

                            <Link
                                href="/order-status"
                                className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-[#3b2419] transition hover:border-orange-300 hover:bg-orange-50"
                            >
                                Track Order
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}