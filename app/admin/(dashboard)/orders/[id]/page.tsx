import type { Metadata } from 'next';

import Link from 'next/link';

import { notFound } from 'next/navigation';

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    Truck,
    User,
    XCircle,
} from 'lucide-react';

import {
    getOrderById,
} from '@/services/order.service';

import {
    getSettings,
} from '@/services/settings.service';

import {
    formatDate,
    formatPrice,
} from '@/lib/utils';

import {
    PrintOrderButton,
} from '@/app/components/admin/PrintButton';

import {
    PrintInvoice,
} from '@/app/components/admin/PrintInvoice';

import {
    LocalDateTime,
} from '@/app/components/ui/Timeformat';

import {
    CopyButton,
} from '@/app/components/admin/CopyButton';

export const metadata: Metadata = {
    title: 'Order Details',
};

type OrderDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

/* ============================================================= */
/* Order Status Style                                             */
/* ============================================================= */

function getOrderStatusStyle(
    status: string,
) {
    switch (status) {
        case 'confirmed':
            return {
                wrapper:
                    'border-blue-100 bg-blue-50 text-blue-700',
                dot:
                    'bg-blue-500',
                icon: (
                    <CheckCircle2
                        className="h-4 w-4"
                        strokeWidth={1.8}
                    />
                ),
            };

        case 'delivered':
            return {
                wrapper:
                    'border-emerald-100 bg-emerald-50 text-emerald-700',
                dot:
                    'bg-emerald-500',
                icon: (
                    <Truck
                        className="h-4 w-4"
                        strokeWidth={1.8}
                    />
                ),
            };

        case 'cancelled':
            return {
                wrapper:
                    'border-red-100 bg-red-50 text-red-700',
                dot:
                    'bg-red-500',
                icon: (
                    <XCircle
                        className="h-4 w-4"
                        strokeWidth={1.8}
                    />
                ),
            };

        default:
            return {
                wrapper:
                    'border-amber-100 bg-amber-50 text-amber-700',
                dot:
                    'bg-amber-500',
                icon: (
                    <Clock3
                        className="h-4 w-4"
                        strokeWidth={1.8}
                    />
                ),
            };
    }
}

/* ============================================================= */
/* Payment Status Style                                           */
/* ============================================================= */

function getPaymentStatusStyle(
    status: string,
) {
    switch (status) {
        case 'paid':
            return {
                wrapper:
                    'border-emerald-100 bg-emerald-50 text-emerald-700',
                dot:
                    'bg-emerald-500',
            };

        case 'failed':
            return {
                wrapper:
                    'border-red-100 bg-red-50 text-red-700',
                dot:
                    'bg-red-500',
            };

        case 'refunded':
            return {
                wrapper:
                    'border-blue-100 bg-blue-50 text-blue-700',
                dot:
                    'bg-blue-500',
            };

        default:
            return {
                wrapper:
                    'border-amber-100 bg-amber-50 text-amber-700',
                dot:
                    'bg-amber-500',
            };
    }
}

/* ============================================================= */
/* Payment Method Label                                           */
/* ============================================================= */

function getPaymentMethodLabel(
    method: string,
) {
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
            return method;
    }
}

/* ============================================================= */
/* Page                                                            */
/* ============================================================= */

export default async function OrderDetailsPage({
    params,
}: OrderDetailsPageProps) {
    const { id } = await params;

    const [order, settings] =
        await Promise.all([
            getOrderById(id),
            getSettings(),
        ]);

    if (!order) {
        notFound();
    }

    const orderStatus =
        getOrderStatusStyle(
            order.orderStatus,
        );

    const paymentStatus =
        getPaymentStatusStyle(
            order.paymentStatus,
        );

    const paymentMethod =
        getPaymentMethodLabel(
            order.paymentMethod,
        );

    const shippingAddress = [
        order.shippingAddress.address,

        `${order.shippingAddress.city}, ${order.shippingAddress.state}`,

        `${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    ].join(', ');

    return (
        <>
            {/* =====================================================
                SCREEN / ADMIN ORDER DETAILS
            ===================================================== */}

            <main className="min-h-screen bg-[#fff8f2] p-4 print:hidden sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* =================================================
                        Header
                    ================================================= */}

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        {/* Left */}

                        <div className="min-w-0">
                            <Link
                                href="/admin/orders"
                                className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-chocolate-soft shadow-2xl shadow-gray-50 transition hover:border-orange-200 hover:bg-orange-50 hover:text-chocolate"
                            >
                                <ArrowLeft className="h-4 w-4" />

                                Back to orders
                            </Link>

                            <div className="flex min-w-0 flex-wrap items-center gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                                        Order Details
                                    </p>

                                    <div className="mt-1 flex min-w-0 items-center gap-2">
                                        <h1 className="min-w-0 break-all text-2xl font-bold tracking-tight text-chocolate sm:text-3xl">
                                            {
                                                order.orderNumber
                                            }
                                        </h1>

                                        <CopyButton
                                            value={
                                                order.orderNumber
                                            }
                                            label="Order"
                                        />
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${orderStatus.wrapper}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${orderStatus.dot}`}
                                    />

                                    {
                                        orderStatus.icon
                                    }

                                    {
                                        order.orderStatus
                                    }
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-chocolate-soft">
                                Placed on{' '}
                                <LocalDateTime
                                    date={
                                        order.createdAt
                                    }
                                />
                            </p>
                        </div>

                        {/* Right */}

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <div className="w-full sm:w-auto">
                                <PrintOrderButton />
                            </div>

                            <div className="w-full rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-2xl shadow-gray-50 sm:w-auto">
                                <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
                                    Order total
                                </p>

                                <p className="mt-1 text-2xl font-bold text-chocolate">
                                    {formatPrice(
                                        order.totalAmount,
                                        order.currency,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        Summary Cards
                    ================================================= */}

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Customer */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                        Customer
                                    </p>

                                    <p className="mt-2 break-words text-lg font-bold text-chocolate">
                                        {
                                            order
                                                .customer
                                                .name
                                        }
                                    </p>

                                    {/* Email */}

                                    <div className="mt-2 flex min-w-0 items-center gap-2">
                                        <ReceiptText className="h-4 w-4 shrink-0 text-chocolate-muted" />

                                        <p className="min-w-0 flex-1 break-all text-sm text-chocolate-soft">
                                            {
                                                order
                                                    .customer
                                                    .email
                                            }
                                        </p>

                                        <CopyButton
                                            value={
                                                order
                                                    .customer
                                                    .email
                                            }
                                            label="Email"
                                        />
                                    </div>

                                    {/* Phone */}

                                    <div className="mt-2 flex min-w-0 items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0 text-chocolate-muted" />

                                        <p className="min-w-0 flex-1 break-all text-sm text-chocolate-soft">
                                            +
                                            {
                                                order
                                                    .customer
                                                    .phone
                                            }
                                        </p>

                                        <CopyButton
                                            value={`+${order.customer.phone}`}
                                            label="Phone"
                                        />
                                    </div>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <User
                                        className="h-5 w-5"
                                        strokeWidth={
                                            1.8
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                        Payment
                                    </p>

                                    <p className="mt-2 break-words text-lg font-bold text-chocolate">
                                        {
                                            paymentMethod
                                        }
                                    </p>

                                    <span
                                        className={`mt-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatus.wrapper}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${paymentStatus.dot}`}
                                        />

                                        {
                                            order.paymentStatus
                                        }
                                    </span>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <CreditCard
                                        className="h-5 w-5"
                                        strokeWidth={
                                            1.8
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Date */}

                        <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                        Order date
                                    </p>

                                    <p className="mt-2 text-lg font-bold text-chocolate">
                                        {formatDate(
                                            order.createdAt,
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm text-chocolate-soft">
                                        Updated{' '}
                                        {formatDate(
                                            order.updatedAt,
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <CalendarDays
                                        className="h-5 w-5"
                                        strokeWidth={
                                            1.8
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        Main
                    ================================================= */}

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        {/* =================================================
                            Left
                        ================================================= */}

                        <div className="min-w-0 space-y-6">
                            {/* Order Items */}

                            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-chocolate">
                                            Order Items
                                        </h2>

                                        <p className="mt-1 text-sm text-chocolate-soft">
                                            {
                                                order
                                                    .items
                                                    .length
                                            }{' '}
                                            {order
                                                .items
                                                .length ===
                                            1
                                                ? 'product'
                                                : 'products'}{' '}
                                            in this order
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                        <Package
                                            className="h-5 w-5"
                                            strokeWidth={
                                                1.8
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <div
                                                key={`${item.productId}-${item.size}-${index}`}
                                                className="flex min-w-0 flex-col gap-4 rounded-2xl border border-orange-50 bg-[#fffaf6] p-4 sm:flex-row sm:items-center"
                                            >
                                                {/* Image */}

                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-white">
                                                    {item.productImage ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
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
                                                        <Package
                                                            className="h-6 w-6 text-orange-300"
                                                            strokeWidth={
                                                                1.6
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                {/* Product */}

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="break-words font-semibold text-chocolate">
                                                        {
                                                            item.productName
                                                        }
                                                    </h3>

                                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chocolate-muted">
                                                        {/* Size */}

                                                        <span>
                                                            Size:{' '}
                                                            <span className="font-semibold text-chocolate-soft">
                                                                {item.size ||
                                                                    '—'}
                                                            </span>
                                                        </span>

                                                        {/* Quantity */}

                                                        <span>
                                                            Qty:{' '}
                                                            <span className="font-semibold text-chocolate-soft">
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>
                                                        </span>

                                                        {/* Unit Price */}

                                                        <span>
                                                            Unit price:{' '}
                                                            <span className="font-semibold text-chocolate-soft">
                                                                {formatPrice(
                                                                    item.unitPrice,
                                                                    order.currency,
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Total */}

                                                <div className="shrink-0 sm:text-right">
                                                    <p className="text-xs text-chocolate-muted">
                                                        Total
                                                    </p>

                                                    <p className="mt-1 text-base font-bold text-chocolate">
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

                            {/* =================================================
                                Shipping Address
                            ================================================= */}

                            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-bold text-chocolate">
                                            Shipping Address
                                        </h2>

                                        <p className="mt-1 text-sm text-chocolate-soft">
                                            Delivery destination for this order.
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                        <MapPin
                                            className="h-5 w-5"
                                            strokeWidth={
                                                1.8
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-orange-100 bg-[#fffaf6] p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="break-words text-sm font-semibold leading-6 text-chocolate">
                                                {
                                                    order
                                                        .shippingAddress
                                                        .address
                                                }
                                            </p>

                                            <p className="mt-1 break-words text-sm leading-6 text-chocolate-soft">
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

                                                <br />

                                                {
                                                    order
                                                        .shippingAddress
                                                        .postalCode
                                                }

                                                {order
                                                    .shippingAddress
                                                    .country
                                                    ? `, ${order.shippingAddress.country}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <CopyButton
                                            value={
                                                shippingAddress
                                            }
                                            label="Address"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* =================================================
                            Right
                        ================================================= */}

                        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
                            {/* Order Summary */}

                            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                        <ReceiptText
                                            className="h-5 w-5"
                                            strokeWidth={
                                                1.8
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold text-chocolate">
                                            Order Summary
                                        </h2>

                                        <p className="text-xs text-chocolate-muted">
                                            Payment breakdown
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Subtotal */}

                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-chocolate-soft">
                                            Subtotal
                                        </span>

                                        <span className="font-semibold text-chocolate">
                                            {formatPrice(
                                                order.subtotal,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>

                                    {/* Discount */}

                                    {order.discountAmount >
                                        0 && (
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="text-chocolate-soft">
                                                Discount
                                            </span>

                                            <span className="font-semibold text-emerald-600">
                                                -
                                                {formatPrice(
                                                    order.discountAmount,
                                                    order.currency,
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* Shipping */}

                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-chocolate-soft">
                                            Shipping
                                        </span>

                                        <span className="font-semibold text-chocolate">
                                            {formatPrice(
                                                order.shippingCost,
                                                order.currency,
                                            )}
                                        </span>
                                    </div>

                                    {/* Total */}

                                    <div className="border-t border-orange-100 pt-4">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-2xl font-bold text-chocolate">
                                                    {formatPrice(
                                                        order.totalAmount,
                                                        order.currency,
                                                    )}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                                                {
                                                    order.currency
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* =================================================
                                Payment Details
                            ================================================= */}

                            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                                <div className="mb-5">
                                    <h2 className="text-lg font-bold text-chocolate">
                                        Payment Details
                                    </h2>

                                    <p className="mt-1 text-sm text-chocolate-soft">
                                        Payment
                                        information for
                                        this order.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Method */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-chocolate-soft">
                                            Method
                                        </span>

                                        <span className="break-words text-right text-sm font-semibold text-chocolate">
                                            {
                                                paymentMethod
                                            }
                                        </span>
                                    </div>

                                    {/* Status */}

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-chocolate-soft">
                                            Status
                                        </span>

                                        <span
                                            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatus.wrapper}`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${paymentStatus.dot}`}
                                            />

                                            {
                                                order.paymentStatus
                                            }
                                        </span>
                                    </div>

                                    {/* Provider Order ID */}

                                    <div className="border-t border-orange-100 pt-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
                                                Provider Order ID
                                            </p>

                                            {order.providerOrderId ? (
                                                <CopyButton
                                                    value={
                                                        order.providerOrderId
                                                    }
                                                    label="Provider Order ID"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2.5">
                                            <p className="break-all font-mono text-xs text-chocolate-soft">
                                                {order.providerOrderId ??
                                                    'Not available'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Provider Capture ID */}

                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
                                                Provider Capture ID
                                            </p>

                                            {order.providerCaptureId ? (
                                                <CopyButton
                                                    value={
                                                        order.providerCaptureId
                                                    }
                                                    label="Provider Capture ID"
                                                />
                                            ) : null}
                                        </div>

                                        <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2.5">
                                            <p className="break-all font-mono text-xs text-chocolate-soft">
                                                {order.providerCaptureId ??
                                                    'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* =================================================
                                Order Status
                            ================================================= */}

                            <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                                <div className="mb-5">
                                    <h2 className="text-lg font-bold text-chocolate">
                                        Order Status
                                    </h2>

                                    <p className="mt-1 text-sm text-chocolate-soft">
                                        Current status of this order.
                                    </p>
                                </div>

                                <div
                                    className={`flex items-center gap-3 rounded-2xl border p-4 ${orderStatus.wrapper}`}
                                >
                                    {
                                        orderStatus.icon
                                    }

                                    <div className="min-w-0">
                                        <p className="text-xs opacity-70">
                                            Current status
                                        </p>

                                        <p className="mt-0.5 break-words text-sm font-bold capitalize">
                                            {
                                                order.orderStatus
                                            }
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </main>

            {/* =====================================================
                PRINT ONLY
            ===================================================== */}

            <PrintInvoice
                order={order}
                business={{
                    brandName:
                        settings.brandName,

                    address:
                        settings.address,

                    websiteUrl:
                        settings.websiteUrl,

                    phone:
                        settings.phone,

                    email:
                        settings.email,
                }}
            />
        </>
    );
}