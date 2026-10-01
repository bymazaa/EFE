'use client';

import { useEffect, useState } from 'react';

import type { ProductVariantDTO } from '@/services/product.service';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';



type ProductInventoryProps = {
    variants: ProductVariantDTO[];
};

function getStockStatus(stock: number) {
    if (stock === 0) {
        return {
            label: 'Out of stock',
            textClass: 'text-red-600',
            valueClass: 'text-red-600',
        };
    }

    if (stock < LOW_STOCK_THRESHOLD) {
        return {
            label: 'Low stock',
            textClass: 'text-amber-600',
            valueClass: 'text-amber-700',
        };
    }

    return {
        label: 'In stock',
        textClass: 'text-emerald-600',
        valueClass: 'text-slate-900',
    };
}

export function ProductInventory({
    variants,
}: ProductInventoryProps) {
    const [isOpen, setIsOpen] = useState(false);

    const normalizedVariants = variants ?? [];

    const totalStock = normalizedVariants.reduce(
        (total, variant) => total + variant.stock,
        0,
    );

    const totalSizes = normalizedVariants.length;

    const isLowStock =
        totalStock > 0 &&
        totalStock < LOW_STOCK_THRESHOLD;

    const isOutOfStock =
        totalStock === 0 && totalSizes > 0;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [isOpen]);

    let summaryTextClass = 'text-slate-900';

    if (isOutOfStock) {
        summaryTextClass = 'text-red-600';
    } else if (isLowStock) {
        summaryTextClass = 'text-amber-700';
    }

    return (
        <>
            {/* Inventory Summary */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={`View inventory details. ${totalStock} total units across ${totalSizes} sizes.`}
                className="group w-full cursor-pointer text-left"
            >
                <div className="min-w-[130px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-slate-300 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p
                                className={`text-sm font-bold ${summaryTextClass}`}
                            >
                                {totalStock} units
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {totalSizes}{' '}
                                {totalSizes === 1
                                    ? 'size'
                                    : 'sizes'}
                            </p>
                        </div>

                        {(isLowStock ||
                            isOutOfStock) && (
                            <span
                                className={`pt-0.5 text-[11px] font-semibold ${
                                    isOutOfStock
                                        ? 'text-red-600'
                                        : 'text-amber-600'
                                }`}
                            >
                                {isOutOfStock
                                    ? 'Out'
                                    : 'Low'}
                            </span>
                        )}
                    </div>
                </div>
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inventory-modal-title"
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Inventory
                                </p>

                                <h2
                                    id="inventory-modal-title"
                                    className="mt-1 text-lg font-bold text-slate-900"
                                >
                                    Stock by size
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Current available inventory for
                                    each size.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                aria-label="Close inventory details"
                                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path
                                        d="M6 6l12 12M18 6L6 18"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 border-b border-slate-200">
                            <div className="px-5 py-4">
                                <p className="text-xs font-medium text-slate-500">
                                    Total available
                                </p>

                                <p
                                    className={`mt-1 text-xl font-bold ${summaryTextClass}`}
                                >
                                    {totalStock} units
                                </p>
                            </div>

                            <div className="border-l border-slate-200 px-5 py-4">
                                <p className="text-xs font-medium text-slate-500">
                                    Sizes
                                </p>

                                <p className="mt-1 text-xl font-bold text-slate-900">
                                    {totalSizes}
                                </p>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="max-h-[380px] overflow-y-auto">
                            {normalizedVariants.length ===
                            0 ? (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        No inventory added
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Add sizes and stock from
                                        the product edit page.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {/* Table Header */}
                                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Size
                                        </p>

                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Status
                                        </p>

                                        <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                            Available
                                        </p>
                                    </div>

                                    {/* Rows */}
                                    {normalizedVariants.map(
                                        (variant) => {
                                            const status =
                                                getStockStatus(
                                                    variant.stock,
                                                );

                                            return (
                                                <div
                                                    key={
                                                        variant.size
                                                    }
                                                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-b-0"
                                                >
                                                    <p className="min-w-0 break-words text-sm font-semibold text-slate-800">
                                                        {variant.size}
                                                    </p>

                                                    <p
                                                        className={`text-xs font-semibold ${status.textClass}`}
                                                    >
                                                        {
                                                            status.label
                                                        }
                                                    </p>

                                                    <p
                                                        className={`min-w-[45px] text-right text-sm font-bold ${status.valueClass}`}
                                                    >
                                                        {
                                                            variant.stock
                                                        }
                                                    </p>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
                            <div>
                                {isOutOfStock ? (
                                    <p className="text-xs font-semibold text-red-600">
                                        All sizes are currently out
                                        of stock.
                                    </p>
                                ) : isLowStock ? (
                                    <p className="text-xs font-semibold text-amber-600">
                                        Total inventory is below 10
                                        units.
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        Inventory is managed
                                        separately for each size.
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                className="shrink-0 cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}