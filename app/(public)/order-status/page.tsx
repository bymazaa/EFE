import type { Metadata } from 'next';

import Image from 'next/image';
import Link from 'next/link';

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    Search,
    ShieldCheck,
    User,
    XCircle,
} from 'lucide-react';

import type { ReactNode } from 'react';

import { formatPrice } from '@/lib/utils';

import {
    getOrderByIdAndEmail,
    type OrderDTO,
} from '@/services/order.service';

export const metadata: Metadata = {
    title: 'Track Order',
    description:
        'Check your order status and details.',
    robots: {
        index: false,
        follow: false,
    },
};

interface PageProps {
    searchParams: Promise<
        Record<
            string,
            string | string[] | undefined
        >
    >;
}

/* ============================================================
   Helpers
============================================================ */

function getParam(
    value: string | string[] | undefined,
): string {
    if (Array.isArray(value)) {
        return value[0]?.trim() ?? '';
    }

    return value?.trim() ?? '';
}

function formatDate(
    date: Date | string,
): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(value);
}

function formatDateTime(
    date: Date | string,
): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(value);
}

function formatStatus(
    value: string,
): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
        );
}

/* ============================================================
   Order Status Config
============================================================ */

function getOrderStatusConfig(
    status: string,
) {
    switch (status) {
        case 'pending':
            return {
                label: 'Pending',
                icon: Clock3,
                wrapper:
                    'border-amber-200 bg-amber-50',
                iconWrapper:
                    'bg-amber-100 text-amber-700',
                text: 'text-amber-900',
                description:
                    'Your order is waiting to be processed.',
            };

        case 'confirmed':
            return {
                label: 'Confirmed',
                icon: CheckCircle2,
                wrapper:
                    'border-blue-200 bg-blue-50',
                iconWrapper:
                    'bg-blue-100 text-blue-700',
                text: 'text-blue-900',
                description:
                    'Your order has been confirmed.',
            };

        case 'delivered':
            return {
                label: 'Delivered',
                icon: PackageCheck,
                wrapper:
                    'border-emerald-200 bg-emerald-50',
                iconWrapper:
                    'bg-emerald-100 text-emerald-700',
                text: 'text-emerald-900',
                description:
                    'Your order has been delivered.',
            };

        case 'cancelled':
            return {
                label: 'Cancelled',
                icon: XCircle,
                wrapper:
                    'border-red-200 bg-red-50',
                iconWrapper:
                    'bg-red-100 text-red-700',
                text: 'text-red-900',
                description:
                    'This order has been cancelled.',
            };

        default:
            return {
                label: formatStatus(status),
                icon: Package,
                wrapper:
                    'border-orange-200 bg-orange-50',
                iconWrapper:
                    'bg-orange-100 text-orange-700',
                text: 'text-orange-900',
                description:
                    'Current order status.',
            };
    }
}

/* ============================================================
   Payment Status Config
============================================================ */

function getPaymentStatusConfig(
    status: string,
) {
    switch (status) {
        case 'paid':
            return {
                label: 'Paid',
                icon: ShieldCheck,
                wrapper:
                    'border-emerald-200 bg-emerald-50',
                iconWrapper:
                    'bg-emerald-100 text-emerald-700',
                text: 'text-emerald-900',
                description:
                    'Payment has been received.',
            };

        case 'pending':
            return {
                label: 'Pending',
                icon: Clock3,
                wrapper:
                    'border-amber-200 bg-amber-50',
                iconWrapper:
                    'bg-amber-100 text-amber-700',
                text: 'text-amber-900',
                description:
                    'Payment is still pending.',
            };

        default:
            return {
                label: formatStatus(status),
                icon: ShieldCheck,
                wrapper:
                    'border-slate-200 bg-slate-50',
                iconWrapper:
                    'bg-slate-100 text-slate-700',
                text: 'text-slate-900',
                description:
                    'Current payment status.',
            };
    }
}

/* ============================================================
   Status Card
============================================================ */

function StatusCard({
    title,
    status,
    type,
}: {
    title: string;
    status: string;
    type: 'order' | 'payment';
}) {
    const config =
        type === 'order'
            ? getOrderStatusConfig(status)
            : getPaymentStatusConfig(status);

    const Icon = config.icon;

    return (
        <div
            className={`rounded-2xl border p-4 sm:p-5 ${config.wrapper}`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconWrapper}`}
                >
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        {title}
                    </p>

                    <p
                        className={`mt-1 text-base font-semibold ${config.text}`}
                    >
                        {config.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                        {config.description}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   Section Heading
============================================================ */

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                {icon}
            </div>

            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">
                    {title}
                </h2>

                {description ? (
                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

/* ============================================================
   Info Item
============================================================ */

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-800">
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}

/* ============================================================
   Search Form
============================================================ */

function SearchForm({
    orderId,
    email,
    error,
}: {
    orderId: string;
    email: string;
    error?: string;
}) {
    return (
        <section className="mt-8 sm:mt-10">
            <form
                method="GET"
                className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="orderId"
                            className="block text-xs font-semibold text-[#3b2419]"
                        >
                            Order ID
                        </label>

                        <input
                            id="orderId"
                            name="orderId"
                            type="text"
                            defaultValue={orderId}
                            placeholder="Enter your order Number"
                            autoComplete="off"
                            className="mt-2 block w-full rounded-xl border border-orange-100 bg-[#fffaf6] px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-semibold text-[#3b2419]"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={email}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="mt-2 block w-full rounded-xl border border-orange-100 bg-[#fffaf6] px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                        />
                    </div>
                </div>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                    <Search className="h-4 w-4" />
                    Search Order
                </button>
            </form>
        </section>
    );
}

/* ============================================================
   Order Result
============================================================ */

function OrderResult({
    order,
}: {
    order: OrderDTO;
}) {
    return (
        <div className="space-y-5 sm:space-y-6">
            {/* =====================================================
                Order Header
            ===================================================== */}

            <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-gray-50">
                <div className="relative overflow-hidden bg-[#fff8f2] px-5 py-6 sm:px-7 sm:py-7">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-100/50 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600">
                                Order details
                            </p>

                            <h1 className="mt-1.5 font-serif text-2xl text-[#3b2419] sm:text-3xl">
                                #{order.orderNumber}
                            </h1>

                            <p className="mt-2 text-xs text-gray-500">
                                Placed on{' '}
                                {formatDateTime(
                                    order.createdAt,
                                )}
                            </p>
                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-white px-3.5 py-2 text-xs font-medium text-[#765b47] shadow-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-orange-500" />

                            {formatDate(
                                order.createdAt,
                            )}
                        </div>
                    </div>
                </div>

                {/* Status */}

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                    <StatusCard
                        title="Order status"
                        status={order.orderStatus}
                        type="order"
                    />

                    <StatusCard
                        title="Payment status"
                        status={order.paymentStatus}
                        type="payment"
                    />
                </div>
            </section>

            {/* =====================================================
                Customer + Shipping
            ===================================================== */}

            <section className="grid gap-5 lg:grid-cols-2">
                {/* Customer */}

                <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                    <SectionHeading
                        icon={
                            <User className="h-4 w-4" />
                        }
                        title="Customer Information"
                        description="Details associated with this order."
                    />

                    <div className="mt-6 space-y-5">
                        <InfoItem
                            icon={
                                <User className="h-4 w-4" />
                            }
                            label="Name"
                            value={
                                order.customer.name
                            }
                        />

                        <InfoItem
                            icon={
                                <Mail className="h-4 w-4" />
                            }
                            label="Email"
                            value={
                                order.customer.email
                            }
                        />

                        <InfoItem
                            icon={
                                <Phone className="h-4 w-4" />
                            }
                            label="Phone"
                            value={
                                order.customer.phone
                            }
                        />
                    </div>
                </section>

                {/* Shipping */}

                <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                    <SectionHeading
                        icon={
                            <MapPin className="h-4 w-4" />
                        }
                        title="Shipping Address"
                        description="Delivery destination for this order."
                    />

                    <div className="mt-6 flex gap-3">
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
            </section>

            {/* =====================================================
                Order Items
            ===================================================== */}

            <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl shadow-gray-50 sm:p-6">
                <SectionHeading
                    icon={
                        <Package className="h-4 w-4" />
                    }
                    title="Order Items"
                    description={`${order.items.length} ${
                        order.items.length === 1
                            ? 'item'
                            : 'items'
                    } in this order.`}
                />

                <div className="mt-5 divide-y divide-orange-100">
                    {order.items.map(
                        (item) => (
                            <div
                                key={`${item.productId}-${item.productName}`}
                                className="flex gap-4 py-4 first:pt-0 last:pb-0"
                            >
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#fff7f0] sm:h-20 sm:w-20">
                                    {item.productImage ? (
                                        <Image
                                            src={
                                                item.productImage
                                            }
                                            alt={
                                                item.productName
                                            }
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-5 w-5 text-orange-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold leading-5 text-[#3b2419]">
                                            {
                                                item.productName
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Qty:{' '}
                                            {
                                                item.quantity
                                            }
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="font-semibold text-[#3b2419]">
                                            {formatPrice(
                                                item.totalPrice,
                                                order.currency,
                                            )}
                                        </p>

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
                                </div>
                            </div>
                        ),
                    )}
                </div>

                {/* Total */}

                <div className="mt-5 border-t border-orange-100 pt-5">
                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#fff8f2] px-4 py-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                                Order total
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Including shipping
                            </p>
                        </div>

                        <p className="font-serif text-2xl font-bold text-[#3b2419]">
                            {formatPrice(
                                order.totalAmount,
                                order.currency,
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* =====================================================
                Footer Actions
            ===================================================== */}

            <div className="flex flex-col items-center justify-between gap-4 border-t border-orange-100 pt-5 pb-2 sm:flex-row">
                <p className="text-center text-[11px] leading-5 text-gray-400 sm:text-left">
                    Order information last updated{' '}
                    {formatDateTime(
                        order.updatedAt,
                    )}
                </p>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Link
                        href="/order-status"
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#3b2419] transition hover:border-orange-300 hover:bg-orange-50 sm:w-auto"
                    >
                        <Search className="h-4 w-4" />

                        Search another order
                    </Link>

                    <Link
                        href="/products"
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   Page
============================================================ */

export default async function OrderStatusPage({
    searchParams,
}: PageProps) {
    const params = await searchParams;

    const orderId = getParam(
        params.orderId,
    );

    const email = getParam(
        params.email,
    );

    const hasSearch =
        Boolean(orderId || email);

    let order: OrderDTO | null = null;

    let searchError = '';

    if (hasSearch) {
        if (!orderId || !email) {
            searchError =
                'Please enter both your order ID and email address.';
        } else {
            order =
                await getOrderByIdAndEmail(
                    orderId,
                    email,
                );

            if (!order) {
                searchError =
                    'We could not find an order matching those details.';
            }
        }
    }

    /* ==========================================================
       Result
       Search form hidden completely
    ========================================================== */

    if (order) {
        return (
            <main className="min-h-screen bg-[#fff8f2]">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
                    <OrderResult
                        order={order}
                    />
                </div>
            </main>
        );
    }

    /* ==========================================================
       Search
    ========================================================== */

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                        <Package className="h-8 w-8" />
                    </div>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                        Order lookup
                    </p>

                    <h1 className="mt-2 font-serif text-3xl font-bold text-[#3b2419] sm:text-4xl">
                        Track Your Order
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                        Enter your order ID and the email
                        address used during checkout to see
                        your order details and current status.
                    </p>
                </div>

                <SearchForm
                    orderId={orderId}
                    email={email}
                    error={searchError}
                />
            </div>
        </main>
    );
}