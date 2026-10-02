'use client';

import type { MouseEvent } from 'react';

import { Copy } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { toast } from 'sonner';

import { formatDate, formatPrice } from '@/lib/utils';

import { OrderStatusBadge, PaymentStatusBadge } from '@/app/components/ui/Badge';

import { OrderRowMenu } from '@/app/components/admin/OrderRowMenu';

import type { OrderDTO } from '@/services/order.service';

import type { PaymentStatus } from '@/lib/constants';

import { LocalDateTime } from '../ui/Timeformat';

interface OrderTableProps {
    orders: OrderDTO[];
}

export function OrderTable({ orders }: OrderTableProps) {
    const router = useRouter();

    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    async function copyValue(event: MouseEvent, value: string, key: string, label: string) {
        event.stopPropagation();

        try {
            await navigator.clipboard.writeText(value);

            setCopiedKey(key);

            toast.success(`${label} copied.`);

            window.setTimeout(() => {
                setCopiedKey((current) => (current === key ? null : current));
            }, 1500);
        } catch {
            toast.error(`Could not copy ${label.toLowerCase()}.`);
        }
    }

    function openOrder(event: MouseEvent, orderId: string) {
        const target = event.target as HTMLElement;

        if (target.closest('button') || target.closest('input') || target.closest('a')) {
            return;
        }

        router.push(`/admin/orders/${orderId}`);
    }

    if (orders.length === 0) {
        return (
            <div className="px-5 py-12 text-center">
                <p className="text-sm text-chocolate-muted">No orders found.</p>
            </div>
        );
    }

    return (
        <>
            {/* =====================================================
                Desktop
            ===================================================== */}

            <div className="hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-[12px] text-chocolate-muted">
                                <th className="px-7 py-3 font-medium">Order</th>

                                <th className="px-3 py-3 font-medium">Customer</th>

                                <th className="px-3 py-3 font-medium">Product</th>

                                <th className="px-3 py-3 font-medium">Amount</th>

                                <th className="px-3 py-3 font-medium">Status</th>

                                <th className="px-3 py-3 font-medium">Payment</th>

                                <th className="px-3 py-3 font-medium">Date</th>

                                <th className="w-12 py-3 pl-3 pr-5" />
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map((order) => {
                                const firstItem = order.items[0];

                                const extraCount = Math.max(order.items.length - 1, 0);

                                const orderCopyKey = `order-${order.id}`;

                                const phoneCopyKey = `phone-${order.id}`;

                                const emailCopyKey = `email-${order.id}`;

                                return (
                                    <tr
                                        key={order.id}
                                        onClick={(event) => openOrder(event, order.id)}
                                        className="group cursor-pointer border-b border-border transition-colors duration-150 hover:bg-chocolate/[0.025] last:border-0"
                                    >
                                        {/* =================================================
                                                Order
                                            ================================================= */}

                                        <td className="px-7 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-chocolate">
                                                        {order.orderNumber}
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] text-chocolate-muted">
                                                        {order.items.length}{' '}
                                                        {order.items.length === 1
                                                            ? 'item'
                                                            : 'items'}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(event) =>
                                                        copyValue(
                                                            event,
                                                            order.orderNumber,
                                                            orderCopyKey,
                                                            'Order number',
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-md p-1 text-chocolate-muted opacity-0 transition hover:bg-amber-100 hover:text-chocolate group-hover:opacity-100"
                                                    aria-label="Copy order number"
                                                    title="Copy order number"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* =================================================
                                                Customer
                                            ================================================= */}

                                        <td className="px-3 py-3">
                                            <div className="min-w-0">
                                                <p className="max-w-[180px] truncate text-chocolate">
                                                    {order.customer.name}
                                                </p>

                                                {/* Phone */}

                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <p className="text-xs text-chocolate-muted">
                                                        {order.customer.phone}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={(event) =>
                                                            copyValue(
                                                                event,
                                                                order.customer.phone,
                                                                phoneCopyKey,
                                                                'Phone number',
                                                            )
                                                        }
                                                        className="cursor-pointer rounded p-1 text-chocolate-muted opacity-0 transition hover:bg-amber-100 hover:text-chocolate group-hover:opacity-100"
                                                        aria-label="Copy phone number"
                                                        title="Copy phone number"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                {/* Email */}

                                                <div className="mt-0.5 flex max-w-[210px] items-center gap-1.5">
                                                    <p className="min-w-0 flex-1 truncate text-xs text-chocolate-muted">
                                                        {order.customer.email}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={(event) =>
                                                            copyValue(
                                                                event,
                                                                order.customer.email,
                                                                emailCopyKey,
                                                                'Email',
                                                            )
                                                        }
                                                        className="cursor-pointer rounded p-1 text-chocolate-muted opacity-0 transition hover:bg-amber-100 hover:text-chocolate group-hover:opacity-100"
                                                        aria-label="Copy email"
                                                        title="Copy email"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* =================================================
                                                Product
                                            ================================================= */}

                                        <td className="max-w-[260px] px-3 py-3">
                                            {firstItem ? (
                                                <div className="min-w-0">
                                                    <p
                                                        className="truncate text-chocolate-soft"
                                                        title={firstItem.productName}
                                                    >
                                                        {firstItem.productName}

                                                        {extraCount > 0 ? (
                                                            <span className="text-chocolate-muted">
                                                                {' '}
                                                                +{extraCount} more
                                                            </span>
                                                        ) : null}
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-chocolate-muted">
                                                        <span>
                                                            Size:{' '}
                                                            <span className="font-semibold text-chocolate-soft">
                                                                {firstItem.size || '—'}
                                                            </span>
                                                        </span>

                                                        <span>
                                                            Qty:{' '}
                                                            <span className="font-semibold text-chocolate-soft">
                                                                {firstItem.quantity}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-chocolate-muted">—</span>
                                            )}
                                        </td>

                                        {/* =================================================
                                                Amount
                                            ================================================= */}

                                        <td className="whitespace-nowrap px-3 py-3 font-medium text-chocolate">
                                            {formatPrice(order.totalAmount, order.currency)}
                                        </td>

                                        {/* =================================================
                                                Status
                                            ================================================= */}

                                        <td className="px-3 py-3">
                                            <OrderStatusBadge status={order.orderStatus} />
                                        </td>

                                        {/* =================================================
                                                Payment
                                            ================================================= */}

                                        <td className="px-3 py-3">
                                            <PaymentStatusBadge
                                                status={order.paymentStatus as PaymentStatus}
                                            />
                                        </td>

                                        {/* =================================================
                                                Date
                                            ================================================= */}

                                        <td className="whitespace-nowrap px-3 py-3 text-chocolate-soft">
                                            <LocalDateTime date={order.createdAt} />
                                        </td>

                                        {/* =================================================
                                                Menu
                                            ================================================= */}

                                        <td
                                            className="py-3 pl-3 pr-5 text-right"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            <OrderRowMenu
                                                orderId={order.id}
                                                currentStatus={order.orderStatus}
                                                currentPaymentStatus={
                                                    order.paymentStatus as PaymentStatus
                                                }
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =====================================================
                Mobile
            ===================================================== */}

            <div className="space-y-3 p-3 md:hidden">
                {orders.map((order) => {
                    const firstItem = order.items[0];

                    const extraCount = Math.max(order.items.length - 1, 0);

                    const orderCopyKey = `mobile-order-${order.id}`;

                    const phoneCopyKey = `mobile-phone-${order.id}`;

                    const emailCopyKey = `mobile-email-${order.id}`;

                    return (
                        <article
                            key={order.id}
                            onClick={(event) => openOrder(event, order.id)}
                            className="cursor-pointer rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                        >
                            {/* =================================================
                                    Top
                                ================================================= */}

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <p className="min-w-0 break-all text-sm font-semibold text-chocolate">
                                            {order.orderNumber}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={(event) =>
                                                copyValue(
                                                    event,
                                                    order.orderNumber,
                                                    orderCopyKey,
                                                    'Order number',
                                                )
                                            }
                                            className="shrink-0 cursor-pointer rounded-md p-1 text-chocolate-muted hover:bg-amber-100 hover:text-chocolate"
                                            aria-label="Copy order number"
                                            title="Copy order number"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <p className="mt-0.5 text-[11px] text-chocolate-muted">
                                        {order.items.length}{' '}
                                        {order.items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>

                                <div onClick={(event) => event.stopPropagation()}>
                                    <OrderRowMenu
                                        orderId={order.id}
                                        currentStatus={order.orderStatus}
                                        currentPaymentStatus={order.paymentStatus as PaymentStatus}
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                    Customer
                                ================================================= */}

                            <div className="mt-4 border-t border-orange-100 pt-3">
                                <p className="text-sm font-medium text-chocolate">
                                    {order.customer.name}
                                </p>

                                {/* Phone */}

                                <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                                    <p className="min-w-0 flex-1 break-all text-xs text-chocolate-muted">
                                        {order.customer.phone}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(event) =>
                                            copyValue(
                                                event,
                                                order.customer.phone,
                                                phoneCopyKey,
                                                'Phone number',
                                            )
                                        }
                                        className="shrink-0 cursor-pointer rounded-md p-1.5 text-chocolate-muted hover:bg-amber-100 hover:text-chocolate"
                                        aria-label="Copy phone number"
                                        title="Copy phone number"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Email */}

                                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                    <p className="min-w-0 flex-1 break-all text-xs text-chocolate-muted">
                                        {order.customer.email}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(event) =>
                                            copyValue(
                                                event,
                                                order.customer.email,
                                                emailCopyKey,
                                                'Email',
                                            )
                                        }
                                        className="shrink-0 cursor-pointer rounded-md p-1.5 text-chocolate-muted hover:bg-amber-100 hover:text-chocolate"
                                        aria-label="Copy email"
                                        title="Copy email"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* =================================================
                                    Product
                                ================================================= */}

                            <div className="mt-3 rounded-xl bg-[#fffaf6] px-3 py-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-chocolate-muted">
                                    Product
                                </p>

                                {firstItem ? (
                                    <>
                                        <p
                                            className="mt-1 break-words text-sm text-chocolate-soft"
                                            title={firstItem.productName}
                                        >
                                            {firstItem.productName}

                                            {extraCount > 0 ? (
                                                <span className="text-chocolate-muted">
                                                    {' '}
                                                    +{extraCount} more
                                                </span>
                                            ) : null}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-chocolate-muted">
                                            <span>
                                                Size:{' '}
                                                <span className="font-semibold text-chocolate-soft">
                                                    {firstItem.size || '—'}
                                                </span>
                                            </span>

                                            <span>
                                                Qty:{' '}
                                                <span className="font-semibold text-chocolate-soft">
                                                    {firstItem.quantity}
                                                </span>
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm text-chocolate-muted">—</p>
                                )}
                            </div>

                            {/* =================================================
                                    Bottom
                                ================================================= */}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-chocolate-muted">
                                        Total
                                    </p>

                                    <p className="mt-0.5 text-base font-bold text-chocolate">
                                        {formatPrice(order.totalAmount, order.currency)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <OrderStatusBadge status={order.orderStatus} />

                                    <PaymentStatusBadge
                                        status={order.paymentStatus as PaymentStatus}
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                    Date
                                ================================================= */}

                            <div className="mt-3 border-t border-orange-100 pt-2.5">
                                <p className="text-[11px] text-chocolate-muted">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
}
