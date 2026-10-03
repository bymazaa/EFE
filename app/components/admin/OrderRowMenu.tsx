'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Eye, MoreVertical } from 'lucide-react';

import { cn } from '@/lib/utils';

import { updateOrderStatusAction } from '@/app/admin/(dashboard)/orders/actions';

import { type OrderStatus, type PaymentStatus } from '@/lib/constants';

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
};

/*
 * Keep this in sync with the server-side
 * order transition rules.
 *
 * pending    -> confirmed | cancelled
 * confirmed  -> delivered | cancelled
 * delivered  -> none
 * cancelled  -> none
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};

const MENU_WIDTH = 224;
const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;

interface MenuPosition {
    top: number;
    left: number;
}

const STATUS_DOT_CLASS: Record<OrderStatus, string> = {
    pending: 'bg-gray-400',
    confirmed: 'bg-orange-500',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-red-500',
};

const PAYMENT_DOT_CLASS: Record<PaymentStatus, string> = {
    pending: 'bg-amber-500',
    paid: 'bg-emerald-500',
    failed: 'bg-red-500',
    refunded: 'bg-purple-500',
};

export function OrderRowMenu({
    orderId,
    currentStatus,
    currentPaymentStatus,
}: {
    orderId: string;
    currentStatus: OrderStatus;
    currentPaymentStatus: PaymentStatus;
}) {
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);

    const [isPending, startTransition] = useTransition();

    const [position, setPosition] = useState<MenuPosition>({
        top: 0,
        left: 0,
    });

    const triggerRef = useRef<HTMLButtonElement>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    /*
     * ============================================================
     * Menu position
     * ============================================================
     */
    const updateMenuPosition = useCallback(() => {
        const trigger = triggerRef.current;

        if (!trigger) {
            return;
        }

        const rect = trigger.getBoundingClientRect();

        const menu = menuRef.current;

        const menuHeight = menu?.getBoundingClientRect().height ?? 0;

        const maxLeft = Math.max(
            VIEWPORT_PADDING,
            window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING,
        );

        let left = rect.right - MENU_WIDTH;

        left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));

        let top = rect.bottom + MENU_GAP;

        /*
         * Open above the trigger when there
         * is not enough room below.
         */
        if (menuHeight > 0 && top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
            top = rect.top - menuHeight - MENU_GAP;
        }

        top = Math.max(VIEWPORT_PADDING, top);

        setPosition({
            top,
            left,
        });
    }, []);

    function openMenu() {
        setIsOpen(true);

        window.requestAnimationFrame(() => {
            updateMenuPosition();
        });
    }

    function closeMenu() {
        setIsOpen(false);
    }

    function toggleMenu() {
        if (isPending) {
            return;
        }

        if (isOpen) {
            closeMenu();
            return;
        }

        openMenu();
    }

    /*
     * ============================================================
     * Available order status transitions
     * ============================================================
     *
     * Delivered is only available when payment is paid.
     */
    const availableStatuses = ORDER_STATUS_TRANSITIONS[currentStatus].filter((status) => {
        if (status === 'delivered' && currentPaymentStatus !== 'paid') {
            return false;
        }

        return true;
    });

    /*
     * ============================================================
     * Outside click + Escape + scroll + resize
     * ============================================================
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            const clickedTrigger = triggerRef.current?.contains(target);

            const clickedMenu = menuRef.current?.contains(target);

            if (!clickedTrigger && !clickedMenu) {
                closeMenu();
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') {
                return;
            }

            closeMenu();
            triggerRef.current?.focus();
        }

        function handleViewportChange() {
            updateMenuPosition();
        }

        document.addEventListener('mousedown', handleClickOutside);

        document.addEventListener('keydown', handleEscape);

        window.addEventListener('resize', handleViewportChange);

        /*
         * Capture scroll events from the window
         * and table overflow containers.
         */
        document.addEventListener('scroll', handleViewportChange, true);

        /*
         * Recalculate after portal rendering.
         */
        const frame = window.requestAnimationFrame(updateMenuPosition);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);

            document.removeEventListener('keydown', handleEscape);

            window.removeEventListener('resize', handleViewportChange);

            document.removeEventListener('scroll', handleViewportChange, true);

            window.cancelAnimationFrame(frame);
        };
    }, [isOpen, updateMenuPosition]);

    /*
     * ============================================================
     * Update order status
     * ============================================================
     */
    function handleOrderStatusChange(status: OrderStatus) {
        if (status === currentStatus || isPending) {
            return;
        }

        /*
         * Extra client-side guard.
         * The server remains the final authority.
         */
        const allowed = ORDER_STATUS_TRANSITIONS[currentStatus].includes(status);

        if (!allowed) {
            return;
        }

        /*
         * Delivered requires a paid order.
         */
        if (status === 'delivered' && currentPaymentStatus !== 'paid') {
            toast.error('Order cannot be delivered.', {
                description: 'Payment must be paid before the order can be delivered.',
            });

            return;
        }

        closeMenu();

        startTransition(async () => {
            const result = await updateOrderStatusAction(orderId, status);

            if (!result.success) {
                toast.error('Could not update order status.', {
                    description: result.error ?? 'Please try again.',
                });

                return;
            }

            toast.success(result.message ?? 'Order status updated successfully.');

            router.refresh();
        });
    }

    return (
        <>
            {/* ========================================================
                Trigger
            ======================================================== */}
            <div className="inline-block text-left">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={toggleMenu}
                    disabled={isPending}
                    aria-label="Order actions"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className="
                        cursor-pointer
                        rounded-md
                        p-1.5
                        text-chocolate-soft
                        outline-none
                        transition-colors
                        hover:bg-surface-muted
                        hover:text-chocolate
                        focus:outline-none
                        focus:ring-0
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                </button>
            </div>

            {/* ========================================================
                Portal Menu
            ======================================================== */}
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        aria-label="Order actions menu"
                        style={{
                            position: 'fixed',
                            top: position.top,
                            left: position.left,
                            width: MENU_WIDTH,
                        }}
                        className="
                            z-[99999]
                            max-h-[calc(100vh-16px)]
                            overflow-y-auto
                            overflow-x-hidden
                            rounded-xl
                            border
                            border-border
                            bg-surface
                            p-1.5
                            shadow-2xl
                            shadow-black/10
                        "
                    >
                        {/* ==================================================
                            View order
                        ================================================== */}
                        <Link
                            href={`/admin/orders/${orderId}`}
                            role="menuitem"
                            onClick={closeMenu}
                            className="
                                flex
                                cursor-pointer
                                items-center
                                gap-2.5
                                rounded-md
                                px-3
                                py-2.5
                                text-[13px]
                                font-medium
                                text-chocolate-soft
                                outline-none
                                transition-colors
                                hover:bg-surface-muted
                                hover:text-chocolate
                                focus:bg-surface-muted
                                focus:text-chocolate
                            "
                        >
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />

                            <span>View order</span>
                        </Link>

                        <div className="my-1.5 border-t border-border" />

                        {/* ==================================================
                            Order status
                        ================================================== */}
                        <div className="px-2 pb-1.5 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-chocolate-muted">
                                Order status
                            </p>
                        </div>

                        {/* Current status */}
                        <div
                            className="
                                mb-1.5
                                flex
                                items-center
                                justify-between
                                rounded-md
                                border
                                border-border
                                bg-surface-muted/50
                                px-3
                                py-2.5
                            "
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={cn(
                                        'h-2 w-2 shrink-0 rounded-full',
                                        STATUS_DOT_CLASS[currentStatus],
                                    )}
                                />

                                <span className="text-[13px] font-semibold text-chocolate">
                                    {STATUS_LABEL[currentStatus]}
                                </span>
                            </div>

                            <Check className="h-3.5 w-3.5 text-chocolate-muted" strokeWidth={2} />
                        </div>

                        {/* Available status actions */}
                        <div className="space-y-1">
                            {availableStatuses.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => handleOrderStatusChange(status)}
                                    disabled={isPending}
                                    className="
                                            flex
                                            w-full
                                            cursor-pointer
                                            items-center
                                            gap-2.5
                                            rounded-md
                                            border
                                            border-transparent
                                            bg-white
                                            px-3
                                            py-2.5
                                            text-left
                                            text-[13px]
                                            font-medium
                                            text-chocolate-soft
                                            outline-none
                                            transition-all
                                            duration-150
                                            hover:border-orange-200
                                            hover:bg-orange-50/60
                                            hover:text-chocolate
                                            focus:border-orange-300
                                            focus:bg-orange-50/60
                                            focus:ring-2
                                            focus:ring-orange-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                >
                                    <span
                                        className={cn(
                                            'h-2 w-2 shrink-0 rounded-full',
                                            STATUS_DOT_CLASS[status],
                                        )}
                                    />

                                    <span className="flex-1">{STATUS_LABEL[status]}</span>
                                </button>
                            ))}
                        </div>

                        {availableStatuses.length === 0 && (
                            <div className="px-3 py-2.5">
                                <p className="text-[12px] leading-5 text-chocolate-muted">
                                    No further status changes are available.
                                </p>
                            </div>
                        )}

                        <div className="my-1.5 border-t border-border" />

                        {/* ==================================================
                            Payment status - read only
                        ================================================== */}
                        <div className="px-2 pb-1.5 pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-chocolate-muted">
                                Payment status
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-md px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={cn(
                                        'h-2 w-2 shrink-0 rounded-full',
                                        PAYMENT_DOT_CLASS[currentPaymentStatus],
                                    )}
                                />

                                <span className="text-[13px] font-medium text-chocolate-soft">
                                    {PAYMENT_STATUS_LABEL[currentPaymentStatus]}
                                </span>
                            </div>

                            <span className="text-[10px] font-semibold uppercase tracking-wide text-chocolate-muted">
                                Automatic
                            </span>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
