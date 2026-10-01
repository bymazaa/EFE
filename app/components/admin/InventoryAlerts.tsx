import Link from 'next/link';

import {
    AlertTriangle,
    ArrowRight,
    Package,
    PackageX,
} from 'lucide-react';

import type { ProductDTO } from '@/services/product.service';

const LOW_STOCK_THRESHOLD = 9;

type InventoryAlertsProps = {
    products: Pick<
        ProductDTO,
        'id' | 'name' | 'variants'
    >[];
};

export function InventoryAlerts({
    products,
}: InventoryAlertsProps) {
    const alerts = products
        .map((product) => {
            const issues = product.variants.filter(
                (variant) =>
                    variant.stock <=
                    LOW_STOCK_THRESHOLD,
            );

            return {
                ...product,
                issues,
            };
        })
        .filter(
            (product) => product.issues.length > 0,
        )
        .sort((a, b) => {
            const aHasOutOfStock =
                a.issues.some(
                    (variant) =>
                        variant.stock === 0,
                );

            const bHasOutOfStock =
                b.issues.some(
                    (variant) =>
                        variant.stock === 0,
                );

            if (
                aHasOutOfStock !==
                bHasOutOfStock
            ) {
                return aHasOutOfStock ? -1 : 1;
            }

            return (
                b.issues.length -
                a.issues.length
            );
        });

    const totalIssues = alerts.reduce(
        (total, product) =>
            total + product.issues.length,
        0,
    );

    return (
        <section className="space-y-3">
            {/* =====================================================
                Header
            ===================================================== */}

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <AlertTriangle
                            className="h-4.5 w-4.5"
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                                Inventory Alerts
                            </h2>

                            {totalIssues > 0 ? (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                    {totalIssues}
                                </span>
                            ) : null}
                        </div>

                        <p className="text-xs text-chocolate-muted">
                            Products that need stock attention.
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/products"
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-orange-100 bg-white px-3 py-2 text-xs font-semibold text-chocolate-soft transition hover:border-orange-200 hover:bg-orange-50 hover:text-chocolate"
                >
                    View products
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* =====================================================
                Content
            ===================================================== */}

            {alerts.length === 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Package
                                className="h-5 w-5"
                                strokeWidth={1.8}
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-emerald-800">
                                Inventory looks good
                            </p>

                            <p className="mt-0.5 text-xs text-emerald-700/80">
                                No active product sizes are
                                low or out of stock.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                    <div className="max-h-[420px] divide-y divide-orange-50 overflow-y-auto">
                        {alerts.map((product) => {
                            const hasOutOfStock =
                                product.issues.some(
                                    (variant) =>
                                        variant.stock ===
                                        0,
                                );

                            return (
                                <Link
                                    key={product.id}
                                    href={`/admin/products/${product.id}/edit`}
                                    className="group block cursor-pointer px-4 py-4 transition hover:bg-orange-50/40 sm:px-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Product */}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <p className="min-w-0 truncate text-sm font-semibold text-chocolate">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                {hasOutOfStock ? (
                                                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                                                        Needs attention
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Size alerts */}

                                            <div className="mt-2.5 flex flex-wrap gap-2">
                                                {product.issues.map(
                                                    (
                                                        variant,
                                                    ) => {
                                                        const isOutOfStock =
                                                            variant.stock ===
                                                            0;

                                                        return (
                                                            <span
                                                                key={`${product.id}-${variant.size}`}
                                                                className={
                                                                    isOutOfStock
                                                                        ? 'inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700'
                                                                        : 'inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700'
                                                                }
                                                            >
                                                                {isOutOfStock ? (
                                                                    <PackageX className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                                )}

                                                                <span>
                                                                    {
                                                                        variant.size
                                                                    }
                                                                </span>

                                                                <span
                                                                    className={
                                                                        isOutOfStock
                                                                            ? 'text-red-600/80'
                                                                            : 'text-amber-600/80'
                                                                    }
                                                                >
                                                                    {isOutOfStock
                                                                        ? 'Out of stock'
                                                                        : `${variant.stock} left`}
                                                                </span>
                                                            </span>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit */}

                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 transition group-hover:bg-orange-100 group-hover:text-orange-600">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}