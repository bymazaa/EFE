import {
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    ReceiptText,
    User,
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';

import { LocalDateTime } from '@/app/components/ui/Timeformat';

import { printHeightLightPoint } from '@/lib/constants';

type PrintInvoiceProps = {
    order: {
        orderNumber: string;
        createdAt: Date | string;
        updatedAt: Date | string;
        orderStatus: string;
        paymentMethod: string;
        paymentStatus: string;

        /**
         * PayPal/provider identifiers.
         *
         * `transactionId` is intentionally removed because
         * the current payment model stores the provider order
         * and capture identifiers separately.
         */
        providerOrderId?: string | null;
        providerCaptureId?: string | null;

        currency: string;
        subtotal: number;
        discountAmount: number;
        shippingCost: number;
        totalAmount: number;

        customer: {
            name: string;
            email: string;
            phone: string;
        };

        shippingAddress: {
            address: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };

        items: Array<{
            productId: string;
            productName: string;
            productImage?: string;
            size: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }>;
    };

    business: {
        brandName: string;
        address: string;
        websiteUrl: string;
        phone: string;
        email: string;
    };
};

/* *------------------------------------------------------------------* */
/* *Helpers                                                           * */
/* *------------------------------------------------------------------* */

function formatPaymentMethod(
    method: string,
): string {
    switch (method.toLowerCase()) {
        case 'paypal':
            return 'PayPal';

        case 'paylater':
            return 'Pay Later';

        case 'venmo':
            return 'Venmo';

        case 'applepay':
            return 'Apple Pay';

        case 'googlepay':
            return 'Google Pay';

        default:
            return method
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase(),
                );
    }
}

function formatPaymentStatus(
    status: string,
): string {
    return status
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
        );
}

/* *------------------------------------------------------------------* */
/* *Component                                                         * */
/* *------------------------------------------------------------------* */

export function PrintInvoice({
    order,
    business,
}: PrintInvoiceProps) {
    const paymentMethodLabel =
        formatPaymentMethod(
            order.paymentMethod,
        );

    const paymentStatusLabel =
        formatPaymentStatus(
            order.paymentStatus,
        );

    const isPaymentSuccessful =
        order.paymentStatus.toLowerCase() ===
            'paid' ||
        order.paymentStatus.toLowerCase() ===
            'completed';

    return (
        <div className="invoice-print hidden print:block">
            <div className="mx-auto w-full max-w-[794px] bg-white px-5 py-4 text-[#2f211a]">
                {/* =====================================================
                    Header
                ===================================================== */}

                <header className="border-b-2 border-[#3b2419] pb-4">
                    <div className="flex items-start justify-between gap-6">
                        {/* Business */}

                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                    <Package className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="font-serif text-xl font-bold tracking-tight text-[#3b2419]">
                                        {
                                            business.brandName
                                        }
                                    </h1>

                                    <p className="text-[8px] uppercase tracking-[0.18em] text-gray-500">
                                        {
                                            printHeightLightPoint
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 space-y-0.5 text-[9px] leading-4 text-gray-500">
                                {business.address ? (
                                    <p>
                                        {
                                            business.address
                                        }
                                    </p>
                                ) : null}

                                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                    {business.email ? (
                                        <span>
                                            {
                                                business.email
                                            }
                                        </span>
                                    ) : null}

                                    {business.phone ? (
                                        <span>
                                            {
                                                business.phone
                                            }
                                        </span>
                                    ) : null}

                                    {business.websiteUrl ? (
                                        <span>
                                            {
                                                business.websiteUrl
                                            }
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Invoice */}

                        <div className="shrink-0 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-orange-600">
                                Invoice
                            </p>

                            <p className="mt-1 text-xl font-bold text-[#3b2419]">
                                #
                                {
                                    order.orderNumber
                                }
                            </p>

                            <p className="mt-1 text-[9px] text-gray-500">
                                Date:{' '}
                                <LocalDateTime
                                    date={
                                        order.createdAt
                                    }
                                />
                            </p>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    Customer + Shipping + Order info
                ===================================================== */}

                <section className="grid grid-cols-3 gap-5 border-b border-gray-200 py-4">
                    {/* Bill To */}

                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-orange-500" />

                            <h2 className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Bill To
                            </h2>
                        </div>

                        <div className="space-y-0.5 text-[9px] leading-4">
                            <p className="font-bold text-[#3b2419]">
                                {
                                    order.customer
                                        .name
                                }
                            </p>

                            <p className="break-all text-gray-600">
                                {
                                    order.customer
                                        .email
                                }
                            </p>

                            <p className="text-gray-600">
                                {
                                    order.customer
                                        .phone
                                }
                            </p>
                        </div>
                    </div>

                    {/* Ship To */}

                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" />

                            <h2 className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Ship To
                            </h2>
                        </div>

                        <div className="space-y-0.5 text-[9px] leading-4 text-gray-600">
                            <p className="font-semibold text-[#3b2419]">
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

                                {order
                                    .shippingAddress
                                    .country
                                    ? `, ${order.shippingAddress.country}`
                                    : ''}
                            </p>
                        </div>
                    </div>

                    {/* Order */}

                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-1.5">
                            <ReceiptText className="h-3.5 w-3.5 text-orange-500" />

                            <h2 className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Order Info
                            </h2>
                        </div>

                        <div className="space-y-1 text-[9px] leading-4">
                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">
                                    Status
                                </span>

                                <span className="font-semibold capitalize text-[#3b2419]">
                                    {
                                        order.orderStatus
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">
                                    Payment
                                </span>

                                <span className="font-semibold text-[#3b2419]">
                                    {
                                        paymentMethodLabel
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">
                                    Pay Status
                                </span>

                                <span className="font-semibold text-[#3b2419]">
                                    {
                                        paymentStatusLabel
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    Items
                ===================================================== */}

                <section className="py-4">
                    <div className="mb-2 flex items-center gap-1.5">
                        <ReceiptText className="h-3.5 w-3.5 text-orange-500" />

                        <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#3b2419]">
                            Order Items
                        </h2>
                    </div>

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-y border-gray-200 bg-gray-50">
                                <th className="px-2 py-1.5 text-left text-[8px] font-bold uppercase tracking-wider text-gray-500">
                                    Item
                                </th>

                                <th className="w-16 px-2 py-1.5 text-center text-[8px] font-bold uppercase tracking-wider text-gray-500">
                                    Size
                                </th>

                                <th className="w-16 px-2 py-1.5 text-center text-[8px] font-bold uppercase tracking-wider text-gray-500">
                                    Qty
                                </th>

                                <th className="w-28 px-2 py-1.5 text-right text-[8px] font-bold uppercase tracking-wider text-gray-500">
                                    Unit Price
                                </th>

                                <th className="w-28 px-2 py-1.5 text-right text-[8px] font-bold uppercase tracking-wider text-gray-500">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {order.items.map(
                                (
                                    item,
                                    index,
                                ) => (
                                    <tr
                                        key={`${item.productId}-${item.size}-${index}`}
                                        className="border-b border-gray-100"
                                    >
                                        {/* Item */}

                                        <td className="px-2 py-1.5 text-[9px] font-semibold text-[#3b2419]">
                                            <span className="break-words">
                                                {
                                                    item.productName
                                                }
                                            </span>
                                        </td>

                                        {/* Size */}

                                        <td className="px-2 py-1.5 text-center text-[9px] font-semibold text-gray-700">
                                            {item.size ||
                                                '—'}
                                        </td>

                                        {/* Quantity */}

                                        <td className="px-2 py-1.5 text-center text-[9px] text-gray-600">
                                            {
                                                item.quantity
                                            }
                                        </td>

                                        {/* Unit Price */}

                                        <td className="px-2 py-1.5 text-right text-[9px] text-gray-600">
                                            {formatPrice(
                                                item.unitPrice,
                                                order.currency,
                                            )}
                                        </td>

                                        {/* Amount */}

                                        <td className="px-2 py-1.5 text-right text-[9px] font-semibold text-[#3b2419]">
                                            {formatPrice(
                                                item.totalPrice,
                                                order.currency,
                                            )}
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </section>

                {/* =====================================================
                    Bottom
                ===================================================== */}

                <section className="grid grid-cols-[1fr_250px] gap-8 border-t border-gray-200 pt-4">
                    {/* Payment */}

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-orange-500" />

                            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                Payment Details
                            </p>
                        </div>

                        {/* Method + Status */}

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-[9px] text-[#3b2419]">
                                {
                                    paymentMethodLabel
                                }
                            </span>

                            <span className="text-[8px] text-gray-300">
                                •
                            </span>

                            <span
                                className={`
                                    inline-flex items-center gap-1 rounded-full
                                    px-2 py-0.5 text-[8px] font-semibold
                                    ${
                                        isPaymentSuccessful
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-orange-50 text-orange-700'
                                    }
                                `}
                            >
                                {isPaymentSuccessful ? (
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                ) : null}

                                {
                                    paymentStatusLabel
                                }
                            </span>
                        </div>

                    

                        {/* Provider Capture ID */}

                        <div className="mt-2  px-2.5 py-2">
                            <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-gray-500">
                                Provider Capture ID
                            </p>

                            <p className="mt-0.5 break-all font-mono text-[8px] leading-4 text-gray-700">
                                {
                                    order.providerCaptureId ??
                                    'Not available'
                                }
                            </p>
                        </div>

                        <p className="mt-2 max-w-[430px] text-[7px] leading-3.5 text-gray-400">
                            Payment references are
                            provided by the payment
                            provider for order
                            verification and support.
                        </p>
                    </div>

                    {/* Totals */}

                    <div>
                        <div className="space-y-1.5 text-[9px]">
                            {/* Subtotal */}

                            <div className="flex items-center justify-between gap-5">
                                <span className="text-gray-500">
                                    Subtotal
                                </span>

                                <span className="font-semibold text-[#3b2419]">
                                    {formatPrice(
                                        order.subtotal,
                                        order.currency,
                                    )}
                                </span>
                            </div>

                            {/* Discount */}

                            {/* {order.discountAmount >
                            0 ? (
                                <div className="flex items-center justify-between gap-5">
                                    <span className="text-gray-500">
                                        Discount
                                    </span>

                                    <span className="font-semibold text-green-600">
                                        -
                                        {formatPrice(
                                            order.discountAmount,
                                            order.currency,
                                        )}
                                    </span>
                                </div>
                            ) : null} */}

                            {/* Shipping */}

                            <div className="flex items-center justify-between gap-5">
                                <span className="text-gray-500">
                                    Shipping
                                </span>

                                <span className="font-semibold text-[#3b2419]">
                                    {order.shippingCost ===
                                    0
                                        ? 'Free'
                                        : formatPrice(
                                              order.shippingCost,
                                              order.currency,
                                          )}
                                </span>
                            </div>
                        </div>

                        {/* Total */}

                        <div className="mt-2 border-t-2 border-[#3b2419] pt-2">
                            <div className="flex items-end justify-between gap-5">
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                        Total
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-[#3b2419]">
                                        {formatPrice(
                                            order.totalAmount,
                                            order.currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    Footer
                ===================================================== */}

                <footer className="mt-4 border-t border-gray-200 pt-3 text-center">
                    <p className="font-serif text-sm font-bold text-[#3b2419]">
                        Thank you for your purchase.
                    </p>

                    <p className="mt-0.5 text-[8px] text-gray-500">
                        We appreciate your business.
                    </p>

                    <p className="mt-1 text-[7px] text-gray-400">
                        Invoice #
                        {
                            order.orderNumber
                        }
                        {' • '}
                        {
                            business.brandName
                        }
                    </p>
                </footer>
            </div>
        </div>
    );
}