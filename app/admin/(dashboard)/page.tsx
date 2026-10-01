import type { Metadata } from 'next';

import {
    CircleCheck,
    Clock,
    DollarSign,
    Package,
    ShoppingBag,
    Timer,
    Truck,
    XCircle,
} from 'lucide-react';

import {
    getDashboardSummary,
    getInventoryAlertProducts,
    type DashboardRange,
} from '@/services/dashboard.service';

import { StatCard } from '@/app/components/admin/StatCard';

import {
    DashboardDateFilter,
} from '@/app/components/admin/DashboardDateFilter';

import {
    InventoryAlerts,
} from '@/app/components/admin/InventoryAlerts';

import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Dashboard',
};

interface DashboardPageProps {
    searchParams: Promise<
        Record<string, string | string[] | undefined>
    >;
}

/* ============================================================
   Search Param Helpers
============================================================ */

function getParam(
    value:
        | string
        | string[]
        | undefined,
): string {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value ?? '';
}

function getValidRange(
    value: string,
): DashboardRange {
    switch (value) {
        case 'today':
        case '3d':
        case '7d':
        case '1m':
        case 'custom':
            return value;

        default:
            return '7d';
    }
}

function getRangeDescription(
    range: DashboardRange,
): string {
    switch (range) {
        case 'today':
            return 'Showing order and payment activity from today.';

        case '3d':
            return 'Showing order and payment activity from the last 3 days.';

        case '7d':
            return 'Showing order and payment activity from the last 7 days.';

        case '1m':
            return 'Showing order and payment activity from the last 30 days.';

        case 'custom':
            return 'Showing order and payment activity for your selected date range.';

        default:
            return 'Showing order and payment activity from the last 7 days.';
    }
}

/* ============================================================
   Dashboard Page
============================================================ */

export default async function AdminDashboardPage({
    searchParams,
}: DashboardPageProps) {
    const params = await searchParams;

    const range = getValidRange(
        getParam(params.range),
    );

    const fromDate = getParam(
        params.fromDate,
    );

    const toDate = getParam(
        params.toDate,
    );

    /* ==========================================================
       Dashboard Data

       Summary and inventory alerts are loaded in parallel.
    ========================================================== */

    const [
        summary,
        inventoryProducts,
    ] = await Promise.all([
        getDashboardSummary({
            range,
            fromDate:
                range === 'custom'
                    ? fromDate
                    : undefined,
            toDate:
                range === 'custom'
                    ? toDate
                    : undefined,
        }),

        getInventoryAlertProducts(),
    ]);

    return (
        <div className="w-full max-w-7xl space-y-7">
            {/* =====================================================
                Header
            ===================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                        Store Overview
                    </div>

                    <h1 className="font-serif text-3xl font-bold tracking-tight text-chocolate sm:text-4xl">
                        Dashboard
                    </h1>

                    <p className="mt-1.5 max-w-xl text-sm text-chocolate-soft">
                        Monitor orders, revenue, payments,
                        and products from one place.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full border border-orange-100 bg-white px-3.5 py-2 shadow-sm sm:self-auto">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs font-medium text-chocolate-soft">
                        Store activity
                    </span>
                </div>
            </div>

            {/* =====================================================
                Date Filter
            ===================================================== */}

            <DashboardDateFilter
                range={range}
                fromDate={
                    range === 'custom'
                        ? fromDate
                        : ''
                }
                toDate={
                    range === 'custom'
                        ? toDate
                        : ''
                }
            />

            {/* =====================================================
                Active Period
            ===================================================== */}

            <div className="rounded-xl border border-orange-100 bg-[#fffaf6] px-4 py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-chocolate-soft">
                        Showing metrics for{' '}
                        <span className="font-semibold text-chocolate">
                            {summary.range.label}
                        </span>
                    </p>

                    <p className="text-[11px] text-chocolate-muted">
                        {getRangeDescription(
                            range,
                        )}
                    </p>
                </div>
            </div>

            {/* =====================================================
                Inventory Alerts
            ===================================================== */}

        
            {/* =====================================================
                Orders
            ===================================================== */}

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                        <ShoppingBag
                            className="h-4.5 w-4.5"
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                            Orders
                        </h2>

                        <p className="text-xs text-chocolate-muted">
                            Track your current order activity.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        label="Total orders"
                        value={
                            summary.totalOrders
                        }
                        icon={
                            <ShoppingBag
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Pending"
                        value={
                            summary.pendingOrders
                        }
                        accent="var(--color-status-pending)"
                        icon={
                            <Timer
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Confirmed"
                        value={
                            summary.confirmedOrders
                        }
                        accent="var(--color-status-confirmed)"
                        icon={
                            <CircleCheck
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Delivered"
                        value={
                            summary.deliveredOrders
                        }
                        accent="var(--color-status-delivered)"
                        icon={
                            <Truck
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Cancelled"
                        value={
                            summary.cancelledOrders
                        }
                        accent="var(--color-status-cancelled)"
                        icon={
                            <XCircle
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />
                </div>
            </section>

            {/* =====================================================
                Revenue & Payments
            ===================================================== */}

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <DollarSign
                            className="h-4.5 w-4.5"
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                            Revenue &amp; Payments
                        </h2>

                        <p className="text-xs text-chocolate-muted">
                            Monitor revenue and outstanding payments.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <StatCard
                        label="Total revenue"
                        value={formatPrice(
                            summary.totalRevenue,
                        )}
                        sublabel="From paid orders"
                        icon={
                            <DollarSign
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Pending payments"
                        value={
                            summary
                                .pendingPayments
                                .count
                        }
                        sublabel={`${formatPrice(
                            summary
                                .pendingPayments
                                .amount,
                        )} awaiting payment`}
                        accent="var(--color-status-pending)"
                        icon={
                            <Clock
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />
                </div>
            </section>

            {/* =====================================================
                Products
            ===================================================== */}

            <section className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Package
                            className="h-4.5 w-4.5"
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                            Products
                        </h2>

                        <p className="text-xs text-chocolate-muted">
                            Current product catalog overview.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:max-w-2xl">
                    <StatCard
                        label="Total products"
                        value={
                            summary.totalProducts
                        }
                        icon={
                            <Package
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />

                    <StatCard
                        label="Active products"
                        value={
                            summary.activeProducts
                        }
                        accent="var(--color-status-delivered)"
                        icon={
                            <CircleCheck
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        }
                    />
                </div>
            </section>

                <InventoryAlerts
                products={inventoryProducts}
            />

        </div>
    );
}