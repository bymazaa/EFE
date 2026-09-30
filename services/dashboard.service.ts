import { connectDB } from '@/lib/mongodb';

import { Product } from '@/models/Product';
import { Order } from '@/models/Order';

import { roundMoney } from '@/lib/utils';

/* ============================================================
   Types
============================================================ */

export type DashboardRange =
    | 'today'
    | '3d'
    | '7d'
    | '1m'
    | 'custom';

export interface DashboardDateFilter {
    range: DashboardRange;
    fromDate?: string;
    toDate?: string;
}

export interface DashboardSummaryDTO {
    totalProducts: number;
    activeProducts: number;

    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;

    totalRevenue: number;

    pendingPayments: {
        count: number;
        amount: number;
    };

    range: {
        from: Date | null;
        to: Date | null;
        label: string;
    };
}

/* ============================================================
   Date helpers
============================================================ */

function startOfUtcDay(date: Date): Date {
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0,
            0,
            0,
            0,
        ),
    );
}

function startOfNextUtcDay(date: Date): Date {
    const result = startOfUtcDay(date);

    result.setUTCDate(
        result.getUTCDate() + 1,
    );

    return result;
}

function subtractUtcDays(
    date: Date,
    days: number,
): Date {
    const result = new Date(date);

    result.setUTCDate(
        result.getUTCDate() - days,
    );

    return result;
}

function parseDateInput(
    value?: string,
): Date | null {
    if (!value) {
        return null;
    }

    const match =
        /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (!match) {
        return null;
    }

    const date = new Date(
        `${value}T00:00:00.000Z`,
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

/* ============================================================
   Dashboard range
============================================================ */

function getDashboardDateRange(
    filter?: DashboardDateFilter,
): {
    from: Date | null;
    to: Date | null;
    label: string;
} {
    const now = new Date();

    const today = startOfUtcDay(now);

    const range = filter?.range ?? '7d';

    switch (range) {
        case 'today':
            return {
                from: today,
                to: startOfNextUtcDay(today),
                label: 'Today',
            };

        case '3d': {
            const from = subtractUtcDays(
                today,
                2,
            );

            return {
                from,
                to: startOfNextUtcDay(today),
                label: 'Last 3 days',
            };
        }

        case '7d': {
            const from = subtractUtcDays(
                today,
                6,
            );

            return {
                from,
                to: startOfNextUtcDay(today),
                label: 'Last 7 days',
            };
        }

        case '1m': {
            /*
             * Rolling 30-day period including today.
             */
            const from = subtractUtcDays(
                today,
                29,
            );

            return {
                from,
                to: startOfNextUtcDay(today),
                label: 'Last 1 month',
            };
        }

        case 'custom': {
            const customFrom =
                parseDateInput(
                    filter?.fromDate,
                );

            const customTo =
                parseDateInput(
                    filter?.toDate,
                );

            /*
             * Invalid/incomplete custom range
             * falls back to 7 days.
             */
            if (
                !customFrom ||
                !customTo ||
                customFrom > customTo
            ) {
                const from =
                    subtractUtcDays(
                        today,
                        6,
                    );

                return {
                    from,
                    to: startOfNextUtcDay(today),
                    label: 'Last 7 days',
                };
            }

            return {
                from: customFrom,
                to: startOfNextUtcDay(
                    customTo,
                ),
                label: 'Custom range',
            };
        }

        default:
            return {
                from: subtractUtcDays(
                    today,
                    6,
                ),
                to: startOfNextUtcDay(today),
                label: 'Last 7 days',
            };
    }
}

/* ============================================================
   Order filter
============================================================ */

function buildOrderDateFilter(
    dateRange: {
        from: Date | null;
        to: Date | null;
    },
) {
    if (
        !dateRange.from ||
        !dateRange.to
    ) {
        return {};
    }

    return {
        createdAt: {
            $gte: dateRange.from,
            $lt: dateRange.to,
        },
    };
}

/* ============================================================
   Revenue
============================================================ */

async function sumAmountByPaymentStatus(
    paymentStatus: string,
    orderDateFilter: Record<
        string,
        unknown
    >,
): Promise<number> {
    const result =
        await Order.aggregate<{
            total: number;
        }>([
            {
                $match: {
                    paymentStatus,
                    ...orderDateFilter,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalAmount',
                    },
                },
            },
        ]);

    return result[0]?.total ?? 0;
}

/* ============================================================
   Dashboard summary
============================================================ */

export async function getDashboardSummary(
    filter?: DashboardDateFilter,
): Promise<DashboardSummaryDTO> {
    await connectDB();

    const dateRange =
        getDashboardDateRange(filter);

    const orderDateFilter =
        buildOrderDateFilter(
            dateRange,
        );

    const [
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        pendingPaymentsCount,
        pendingPaymentsAmount,
    ] = await Promise.all([
        /* Products are catalog-wide. */

        Product.countDocuments({
            deletedAt: null,
        }),

        Product.countDocuments({
            deletedAt: null,
            isActive: true,
        }),

        /* Orders */

        Order.countDocuments(
            orderDateFilter,
        ),

        Order.countDocuments({
            ...orderDateFilter,
            orderStatus: 'pending',
        }),

        Order.countDocuments({
            ...orderDateFilter,
            orderStatus: 'confirmed',
        }),

        Order.countDocuments({
            ...orderDateFilter,
            orderStatus: 'delivered',
        }),

        Order.countDocuments({
            ...orderDateFilter,
            orderStatus: 'cancelled',
        }),

        /* Revenue */

        sumAmountByPaymentStatus(
            'paid',
            orderDateFilter,
        ),

        /* Pending payments */

        Order.countDocuments({
            ...orderDateFilter,
            paymentStatus: 'pending',
        }),

        sumAmountByPaymentStatus(
            'pending',
            orderDateFilter,
        ),
    ]);

    return {
        totalProducts,
        activeProducts,

        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,

        totalRevenue:
            roundMoney(totalRevenue),

        pendingPayments: {
            count: pendingPaymentsCount,
            amount: roundMoney(
                pendingPaymentsAmount,
            ),
        },

        range: {
            from: dateRange.from,
            to: dateRange.to,
            label: dateRange.label,
        },
    };
}