'use client';

import Link from 'next/link';

import {
    CalendarDays,
    RotateCcw,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import type {
    DashboardRange,
} from '@/services/dashboard.service';

interface DashboardDateFilterProps {
    range: DashboardRange;
    fromDate?: string;
    toDate?: string;
}

const PRESETS: {
    value: DashboardRange;
    label: string;
}[] = [
    {
        value: 'today',
        label: 'Today',
    },
    {
        value: '3d',
        label: 'Last 3 days',
    },
    {
        value: '7d',
        label: 'Last 7 days',
    },
    {
        value: '1m',
        label: 'Last 1 month',
    },
];

export function DashboardDateFilter({
    range,
    fromDate = '',
    toDate = '',
}: DashboardDateFilterProps) {
    const [from, setFrom] =
        useState(fromDate);

    const [to, setTo] =
        useState(toDate);

    useEffect(() => {
        setFrom(fromDate);
        setTo(toDate);
    }, [fromDate, toDate]);

    function handleFromChange(
        value: string,
    ) {
        setFrom(value);

        /*
         * If the current "To" date is before
         * the newly selected "From" date,
         * move "To" up to the same date.
         */
        if (
            value &&
            to &&
            to < value
        ) {
            setTo(value);
        }
    }

    const isCustom =
        range === 'custom';

    const canApply =
        Boolean(from && to) &&
        (!from || !to || from <= to);

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                {/* =====================================================
                    Presets
                ===================================================== */}

                <div className="min-w-0">
                    <div className="mb-2.5 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                            <CalendarDays className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-chocolate">
                                Dashboard period
                            </p>

                            <p className="text-[11px] text-chocolate-muted">
                                Filter order and payment metrics.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map(
                            (preset) => {
                                const isActive =
                                    range ===
                                    preset.value;

                                return (
                                    <Link
                                        key={
                                            preset.value
                                        }
                                        href={`?range=${preset.value}`}
                                        className={[
                                            'inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                                            isActive
                                                ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                                                : 'border-orange-100 bg-white text-chocolate-soft hover:border-orange-200 hover:bg-orange-50 hover:text-chocolate',
                                        ].join(
                                            ' ',
                                        )}
                                    >
                                        {
                                            preset.label
                                        }
                                    </Link>
                                );
                            },
                        )}
                    </div>
                </div>

                {/* =====================================================
                    Custom range
                ===================================================== */}

                <form
                    method="GET"
                    className="w-full xl:max-w-xl"
                >
                    <input
                        type="hidden"
                        name="range"
                        value="custom"
                    />

                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                        {/* =================================================
                            From
                        ================================================= */}

                        <div>
                            <label
                                htmlFor="dashboard-from"
                                className="block text-[10px] font-semibold uppercase tracking-wide text-chocolate-muted"
                            >
                                From
                            </label>

                            <input
                                id="dashboard-from"
                                name="fromDate"
                                type="date"
                                value={from}
                                onChange={(event) =>
                                    handleFromChange(
                                        event.target
                                            .value,
                                    )
                                }
                                className="mt-1.5 block h-10 w-full rounded-lg border border-orange-100 bg-[#fffaf6] px-3 text-xs text-chocolate outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                            />
                        </div>

                        {/* =================================================
                            To
                        ================================================= */}

                        <div>
                            <label
                                htmlFor="dashboard-to"
                                className="block text-[10px] font-semibold uppercase tracking-wide text-chocolate-muted"
                            >
                                To
                            </label>

                            <input
                                id="dashboard-to"
                                name="toDate"
                                type="date"
                                value={to}
                                min={from || undefined}
                                disabled={!from}
                                onChange={(event) =>
                                    setTo(
                                        event.target
                                            .value,
                                    )
                                }
                                className="mt-1.5 block h-10 w-full rounded-lg border border-orange-100 bg-[#fffaf6] px-3 text-xs text-chocolate outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-70 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                            />

                            {/* {!from ? (
                                <p className="mt-1 text-[10px] text-chocolate-muted">
                                    Select the From date first.
                                </p>
                            ) : null} */}
                        </div>

                        {/* =================================================
                            Apply
                        ================================================= */}

                        <button
                            type="submit"
                            disabled={
                                !canApply
                            }
                            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-chocolate px-4 text-xs font-semibold text-white transition hover:bg-[#4a3024] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Apply
                        </button>

                        {/* =================================================
                            Reset
                        ================================================= */}

                        <Link
                            href="?range=7d"
                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-orange-100 bg-white px-3 text-xs font-medium text-chocolate-soft transition hover:border-orange-200 hover:bg-orange-50 hover:text-chocolate"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />

                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}