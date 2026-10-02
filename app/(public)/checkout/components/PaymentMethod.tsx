'use client';

import { Check, Clock3, CreditCard, Smartphone, WalletCards } from 'lucide-react';

export type PaymentMethodValue = 'paypal' | 'paylater' | 'venmo' | 'applepay' | 'googlepay';

interface PaymentMethodProps {
    value: PaymentMethodValue;

    onChange: (value: PaymentMethodValue) => void;

    error?: string;
}

interface PaymentOption {
    value: PaymentMethodValue;
    title: string;
    description: string;
    icon: typeof CreditCard;
    iconClassName: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        value: 'paypal',
        title: 'PayPal',
        description: 'Pay securely with PayPal.',
        icon: CreditCard,
        iconClassName: 'bg-blue-50 text-blue-600',
    },

    {
        value: 'paylater',
        title: 'Pay Later',
        description: 'Pay later with PayPal.',
        icon: Clock3,
        iconClassName: 'bg-amber-50 text-amber-600',
    },

    {
        value: 'venmo',
        title: 'Venmo',
        description: 'Pay easily with Venmo.',
        icon: WalletCards,
        iconClassName: 'bg-sky-50 text-sky-600',
    },

    {
        value: 'applepay',
        title: 'Apple Pay',
        description: 'Pay quickly with Apple Pay.',
        icon: Smartphone,
        iconClassName: 'bg-gray-100 text-gray-900',
    },

    {
        value: 'googlepay',
        title: 'Google Pay',
        description: 'Pay quickly with Google Pay.',
        icon: Smartphone,
        iconClassName: 'bg-gray-100 text-gray-700',
    },
];

export function PaymentMethod({ value, onChange, error }: PaymentMethodProps) {
    return (
        <section className="w-full rounded-3xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50 sm:p-6">
            {/* Header */}
            <div className="mb-5 sm:mb-6">
                <h2 className="font-serif text-xl font-bold text-[#3b2419] sm:text-2xl">
                    Payment Method
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                    Choose how you&apos;d like to pay.
                </p>
            </div>

            {/* Payment options */}
            <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;

                    const selected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            aria-pressed={selected}
                            className={`flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 sm:gap-4 sm:p-4 ${
                                selected
                                    ? 'border-orange-400 bg-orange-50 ring-4 ring-orange-100'
                                    : 'border-orange-100 bg-[#fffaf6] hover:border-orange-200 hover:bg-orange-50/50'
                            }`}
                        >
                            {/* Icon */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${
                                    option.iconClassName
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold leading-5 text-[#3b2419] sm:text-base">
                                    {option.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                    {option.description}
                                </p>
                            </div>

                            {/* Selected indicator */}
                            <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                                    selected
                                        ? 'bg-orange-500 text-white'
                                        : 'border border-orange-200 bg-white text-transparent'
                                }`}
                            >
                                <Check className="h-4 w-4" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Validation error */}
            {error && (
                <p role="alert" className="mt-3 text-xs leading-5 text-red-500">
                    {error}
                </p>
            )}
        </section>
    );
}
