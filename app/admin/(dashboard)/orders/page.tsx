import type { Metadata } from 'next';

import { ClipboardList } from 'lucide-react';

import { getAdminOrders } from '@/services/order.service';

import { OrderTable } from '@/app/components/admin/OrderTable';

import { OrdersToolbar } from '@/app/components/admin/OrdersToolbar';

import { Pagination } from '@/app/components/admin/Pagination';

import { Card } from '@/app/components/ui/Card';

import { OrdersSummary } from '@/app/components/admin/OrdersSummary';

export const metadata: Metadata = {
    title: 'Orders',
};

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
        orderStatus?: string;
        paymentStatus?: string;
        sort?: string;
    }>;
}) {
    const params = await searchParams;

    const result = await getAdminOrders(params);

    const data = result.success ? result.data : undefined;

    const orders = data?.orders ?? [];

    const hasFilters = Boolean(params.search || params.orderStatus || params.paymentStatus);

    return (
        <div className="w-full max-w-7xl space-y-5 sm:space-y-6">
            {/* =====================================================
                Header
            ===================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-700">
                            <ClipboardList className="h-5 w-5" strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="font-serif text-2xl font-bold text-chocolate sm:text-3xl">
                                Orders
                            </h1>

                            <p className="mt-1 text-sm text-chocolate-soft">
                                {data
                                    ? `${data.total} order${data.total === 1 ? '' : 's'}`
                                    : 'Manage customer orders'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                Summary
            ===================================================== */}

            {data ? <OrdersSummary summary={data.summary} /> : null}

            {/* =====================================================
                Toolbar
            ===================================================== */}

            <OrdersToolbar basePath="/admin/orders" />

            {/* =====================================================
                Orders Table
            ===================================================== */}

            <Card>
                {orders.length > 0 ? (
                    <div className="overflow-hidden">
                        <OrderTable orders={orders} />

                        {data ? (
                            <Pagination
                                basePath="/admin/orders"
                                page={data.page}
                                totalPages={data.totalPages}
                                searchParams={{
                                    search: params.search,
                                    orderStatus: params.orderStatus,
                                    paymentStatus: params.paymentStatus,
                                    sort: params.sort,
                                }}
                            />
                        ) : null}
                    </div>
                ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[320px]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 text-amber-700">
                            <ClipboardList className="h-5 w-5" strokeWidth={1.6} />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-700">
                            {hasFilters
                                ? 'No orders match your search.'
                                : 'No orders have been placed yet.'}
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                            {hasFilters
                                ? 'Try adjusting your search or filters to find the order you are looking for.'
                                : 'New customer orders will appear here once they are placed.'}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
