'use client';

import { Check, Clock3 } from 'lucide-react';

import {
    SiApplepay,
    SiGooglepay,
    SiPaypal,
    SiVenmo,
} from '@icons-pack/react-simple-icons';

/* *------------------------------------------------------------------* */
/* *Types                                                             * */
/* *------------------------------------------------------------------* */

export type PaymentMethodValue =
    | 'paypal'
    | 'paylater'
    | 'venmo'
    | 'applepay'
    | 'googlepay';

interface PaymentMethodProps {
    value: PaymentMethodValue;

    onChange: (value: PaymentMethodValue) => void;

    error?: string;
}

interface PaymentOption {
    value: PaymentMethodValue;
    title: string;
    description: string;

    /**
     * Brand/payment icon.
     *
     * `color` is provided by the individual icon,
     * while the surrounding card keeps the UI consistent.
     */
    icon: React.ComponentType<{
        size?: number;
        className?: string;
        title?: string;
        color?: string;
    }>;

    iconClassName: string;
    iconBackgroundClassName: string;
}

/* *------------------------------------------------------------------* */
/* *Payment options                                                   * */
/* *------------------------------------------------------------------* */

const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        value: 'paypal',
        title: 'PayPal',
        description: 'Pay securely with PayPal.',
        icon: SiPaypal,
        iconClassName: 'text-[#003087]',
        iconBackgroundClassName: 'bg-[#f2f7ff]',
    },
    {
        value: 'paylater',
        title: 'Pay Later',
        description: 'Split your payment with PayPal.',
        icon: SiPaypal,
        iconClassName: 'text-[#003087]',
        iconBackgroundClassName: 'bg-[#f2f7ff]',
    },
    {
        value: 'venmo',
        title: 'Venmo',
        description: 'Pay quickly with Venmo.',
        icon: SiVenmo,
        iconClassName: 'text-[#008CFF]',
        iconBackgroundClassName: 'bg-[#eef8ff]',
    },
    {
        value: 'applepay',
        title: 'Apple Pay',
        description: 'Pay fast with Apple Pay.',
        icon: SiApplepay,
        iconClassName: 'text-black',
        iconBackgroundClassName: 'bg-gray-50',
    },
    {
        value: 'googlepay',
        title: 'Google Pay',
        description: 'Pay fast with Google Pay.',
        icon: SiGooglepay,
        iconClassName: 'text-[#1a73e8]',
        iconBackgroundClassName: 'bg-[#f5f8ff]',
    },
];

/* *------------------------------------------------------------------* */
/* *Component                                                         * */
/* *------------------------------------------------------------------* */

export function PaymentMethod({
    value,
    onChange,
    error,
}: PaymentMethodProps) {
    return (
        <section className="w-full rounded-3xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50 sm:p-6">
            {/* *=========================================================*
             * Header
             *=========================================================* */}

            <div className="mb-5 sm:mb-6">
                <h2 className="font-serif text-xl font-bold text-[#3b2419] sm:text-2xl">
                    Payment Method
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                    Choose how you&apos;d like to pay.
                </p>
            </div>

            {/* *=========================================================*
             * Payment options
             *=========================================================* */}

            <div
                className="space-y-3"
                role="radiogroup"
                aria-label="Payment method"
            >
                {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;

                    const selected =
                        value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                onChange(
                                    option.value,
                                )
                            }
                            aria-pressed={selected}
                            className={`
                                group flex w-full min-w-0 cursor-pointer
                                items-center gap-3 rounded-2xl border
                                p-3.5 text-left
                                transition-all duration-200
                                sm:gap-4 sm:p-4
                                ${
                                    selected
                                        ? 'border-orange-300 bg-white shadow-lg shadow-orange-100/70 ring-4 ring-orange-50'
                                        : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-md hover:shadow-orange-50'
                                }
                            `}
                        >
                            {/* *-------------------------------------------------*
                             * Payment icon
                             *-------------------------------------------------* */}

                            <div
                                className={`
                                    flex h-11 w-11 shrink-0
                                    items-center justify-center
                                    rounded-2xl border
                                    transition-all duration-200
                                    sm:h-12 sm:w-12
                                    ${
                                        selected
                                            ? 'border-orange-100 shadow-sm'
                                            : 'border-gray-100 group-hover:border-orange-100'
                                    }
                                    ${option.iconBackgroundClassName}
                                `}
                            >
                                <Icon
                                    size={24}
                                    className={`h-6 w-6 ${option.iconClassName}`}
                                    aria-hidden="true"
                                />
                            </div>

                            {/* *-------------------------------------------------*
                             * Content
                             *-------------------------------------------------* */}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold leading-5 text-[#3b2419] sm:text-base">
                                        {option.title}
                                    </p>

                                    {option.value ===
                                        'paylater' && (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                            Flexible
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                    {
                                        option.description
                                    }
                                </p>
                            </div>

                            {/* *-------------------------------------------------*
                             * Selected indicator
                             *-------------------------------------------------* */}

                            <div
                                className={`
                                    flex h-6 w-6 shrink-0
                                    items-center justify-center
                                    rounded-full border
                                    transition-all duration-200
                                    ${
                                        selected
                                            ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200'
                                            : 'border-gray-200 bg-white text-transparent group-hover:border-orange-300'
                                    }
                                `}
                                aria-hidden="true"
                            >
                                <Check className="h-4 w-4" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* *=========================================================*
             * Validation error
             *=========================================================* */}

            {error && (
                <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3"
                >
                    <p className="text-xs leading-5 text-red-600 sm:text-sm">
                        {error}
                    </p>
                </div>
            )}
        </section>
    );
}