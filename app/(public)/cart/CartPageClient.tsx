'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Minus,
    Plus,
    RefreshCw,
    ShoppingBag,
    Trash2,
} from 'lucide-react';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { toast } from 'sonner';

import { useCartStore } from '@/store/cart.store';

import {
    formatPrice,
    hasDiscount,
} from '@/lib/utils';

import type {
    CartValidationDTO,
    CartValidationItemDTO,
} from '@/services/order.service';

import { validateCartAction } from './action';

import {
    MAX_ITEM_QUANTITY,
} from '@/lib/validation/cart.schema';

import { categoryName } from '@/lib/constants';

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

type ValidationState = {
    data: CartValidationDTO | null;
    loading: boolean;
    error: string | null;
};

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

/**
 * A cart line is uniquely identified by:
 *
 * productId + size
 *
 * The same product can therefore exist in the cart
 * with different sizes.
 */
function getCartItemKey(
    productId: string,
    size: string,
): string {
    return `${productId}:${size
        .trim()
        .toLowerCase()}`;
}

/**
 * Maximum quantity allowed for a cart line.
 *
 * Both product stock and global cart limit matter.
 */
function getMaxQuantity(
    availableStock: number,
): number {
    return Math.min(
        Math.max(availableStock, 0),
        MAX_ITEM_QUANTITY,
    );
}

/* ========================================================================== */
/* Main Component                                                             */
/* ========================================================================== */

export default function CartPageClient() {
    /* ======================================================================
       Zustand Cart State
    ====================================================================== */

    const items = useCartStore(
        (state) => state.items,
    );

    const removeItem = useCartStore(
        (state) => state.removeItem,
    );

    const setQuantity = useCartStore(
        (state) => state.setQuantity,
    );

    const clear = useCartStore(
        (state) => state.clear,
    );

    /*
     * Zustand/localStorage stores only:
     *
     * - productId
     * - size
     * - quantity
     *
     * Product name, price, image, stock and availability
     * come from the server validation response.
     */

    /* ======================================================================
       Server Validation State
    ====================================================================== */

    const [validation, setValidation] =
        useState<ValidationState>({
            data: null,
            loading: true,
            error: null,
        });

    /* ======================================================================
       Cart Items Key
    ====================================================================== */

    /*
     * Server validation runs when product + size combinations change.
     *
     * Quantity-only changes do NOT trigger another server request.
     */
    const cartItemsKey = useMemo(() => {
        return items
            .map((item) =>
                getCartItemKey(
                    item.productId,
                    item.size,
                ),
            )
            .sort()
            .join(',');
    }, [items]);

    /* ======================================================================
       Validate Cart
    ====================================================================== */

    useEffect(() => {
        let cancelled = false;

        async function validate() {
            const currentItems =
                useCartStore.getState().items;

            /* ----------------------------------------------------------------
               Empty cart
            ---------------------------------------------------------------- */

            if (currentItems.length === 0) {
                setValidation({
                    data: null,
                    loading: false,
                    error: null,
                });

                return;
            }

            /* ----------------------------------------------------------------
               Show validation loading
            ---------------------------------------------------------------- */

            setValidation((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));

            /* ----------------------------------------------------------------
               Server validation
            ---------------------------------------------------------------- */

            const result =
                await validateCartAction(
                    currentItems,
                );

            /* ----------------------------------------------------------------
               Ignore outdated request
            ---------------------------------------------------------------- */

            if (cancelled) {
                return;
            }

            /* ----------------------------------------------------------------
               Action failed
            ---------------------------------------------------------------- */

            if (!result.success) {
                setValidation({
                    data: null,
                    loading: false,
                    error: result.error,
                });

                return;
            }

            const data = result.data;

            /* ----------------------------------------------------------------
               ActionResult data can be optional
            ---------------------------------------------------------------- */

            if (!data) {
                setValidation({
                    data: null,
                    loading: false,
                    error:
                        'Unable to validate your cart.',
                });

                return;
            }

            /* ----------------------------------------------------------------
               Remove products that no longer exist
            ---------------------------------------------------------------- */

            if (
                data.removedProductIds.length > 0
            ) {
                const latestCart =
                    useCartStore
                        .getState()
                        .items;

                for (const productId of
                    data.removedProductIds) {
                    const productItems =
                        latestCart.filter(
                            (item) =>
                                item.productId ===
                                productId,
                        );

                    for (const item of
                        productItems) {
                        useCartStore
                            .getState()
                            .removeItem(
                                item.productId,
                                item.size,
                            );
                    }
                }

                toast.error(
                    data.removedProductIds
                        .length === 1
                        ? 'A product was removed from your cart because it is no longer available.'
                        : 'Some products were removed from your cart because they are no longer available.',
                );
            }

            /* ----------------------------------------------------------------
               Store validation result
            ---------------------------------------------------------------- */

            setValidation({
                data,
                loading: false,
                error: null,
            });
        }

        validate();

        return () => {
            cancelled = true;
        };

        /*
         * Intentionally depend only on cartItemsKey.
         *
         * Quantity changes stay local and do not trigger
         * another validation request.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartItemsKey]);

    /* ======================================================================
       Server Validated Items
    ====================================================================== */

    const validatedItems =
        validation.data?.items ?? [];

    /* ======================================================================
       Merge Server Data + Local Quantity + Size
    ====================================================================== */

    const currentValidatedItems =
        useMemo(() => {
            /*
             * Fast lookup map:
             *
             * productId + size -> quantity
             */
            const localCartMap =
                new Map(
                    items.map((item) => [
                        getCartItemKey(
                            item.productId,
                            item.size,
                        ),
                        item.quantity,
                    ]),
                );

            /*
             * Keep only product + size combinations
             * that still exist in local Zustand cart.
             */
            return validatedItems
                .filter((item) =>
                    localCartMap.has(
                        getCartItemKey(
                            item.productId,
                            item.size,
                        ),
                    ),
                )
                .map((item) => {
                    const key =
                        getCartItemKey(
                            item.productId,
                            item.size,
                        );

                    const quantity =
                        localCartMap.get(key) ??
                        item.quantity;

                    return {
                        ...item,
                        quantity,
                        lineTotal:
                            item.price *
                            quantity,
                    };
                });
        }, [
            validatedItems,
            items,
        ]);

    /* ======================================================================
       Active Products
    ====================================================================== */

    /*
     * An item is active only when:
     *
     * 1. Product/size itself is available
     * 2. Current local quantity does not exceed stock
     *
     * This is important because quantity changes are local and do not
     * trigger another server validation request.
     */
    const activeItems = useMemo(
        () =>
            currentValidatedItems.filter(
                (item) =>
                    item.isActive &&
                    item.availableStock >=
                        item.quantity,
            ),
        [currentValidatedItems],
    );

    /* ======================================================================
       Unavailable Products
    ====================================================================== */

    /*
     * An item becomes unavailable if:
     *
     * - Product/size is unavailable
     * OR
     * - Current local quantity exceeds available stock
     */
    const unavailableItems = useMemo(
        () =>
            currentValidatedItems.filter(
                (item) =>
                    !item.isActive ||
                    item.quantity >
                        item.availableStock,
            ),
        [currentValidatedItems],
    );

    /* ======================================================================
       Item Count
    ====================================================================== */

    const itemCount = useMemo(
        () =>
            activeItems.reduce(
                (total, item) =>
                    total + item.quantity,
                0,
            ),
        [activeItems],
    );

    /* ======================================================================
       Subtotal
    ====================================================================== */

    const subtotal = useMemo(
        () =>
            activeItems.reduce(
                (total, item) =>
                    total + item.lineTotal,
                0,
            ),
        [activeItems],
    );

    /* ======================================================================
       Checkout Permission
    ====================================================================== */

    const canCheckout =
        !validation.loading &&
        activeItems.length > 0 &&
        unavailableItems.length === 0;

    /* ======================================================================
       Increase Quantity
    ====================================================================== */

    const handleIncrease = (
        productId: string,
        size: string,
        quantity: number,
        availableStock: number,
    ) => {
        const maxQuantity =
            getMaxQuantity(
                availableStock,
            );

        /* ------------------------------------------------------------------
           No stock
        ------------------------------------------------------------------ */

        if (availableStock <= 0) {
            toast.warning(
                `Size ${size} is currently out of stock.`,
            );

            return;
        }

        /* ------------------------------------------------------------------
           Stock / global limit reached
        ------------------------------------------------------------------ */

        if (quantity >= maxQuantity) {
            toast.warning(
                `Only ${maxQuantity} available for size ${size}.`,
            );

            return;
        }

        /* ------------------------------------------------------------------
           Local Zustand update
        ------------------------------------------------------------------ */

        setQuantity(
            productId,
            size,
            quantity + 1,
        );
    };

    /* ======================================================================
       Decrease Quantity
    ====================================================================== */

    const handleDecrease = (
        productId: string,
        size: string,
        quantity: number,
    ) => {
        /*
         * Quantity must never go below 1.
         */
        if (quantity <= 1) {
            return;
        }

        setQuantity(
            productId,
            size,
            quantity - 1,
        );
    };

    /* ======================================================================
       Remove Item
    ====================================================================== */

    const handleRemove = (
        productId: string,
        size: string,
        productName: string,
    ) => {
        removeItem(
            productId,
            size,
        );

        toast.success(
            `${productName} (${size}) removed from cart.`,
        );
    };

    /* ======================================================================
       Clear Cart
    ====================================================================== */

    const handleClear = () => {
        clear();

        toast.success(
            'Your cart has been cleared.',
        );
    };

    /* ======================================================================
       Empty Cart
    ====================================================================== */

    if (
        !validation.loading &&
        items.length === 0
    ) {
        return (
            <main className="min-h-[70vh]">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
                    <div className="w-full rounded-[2rem] border border-orange-100 bg-white px-6 py-14 text-center shadow-2xl shadow-gray-50 sm:px-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                            <ShoppingBag
                                className="h-7 w-7"
                                strokeWidth={1.6}
                            />
                        </div>

                        <h1 className="mt-6 font-serif text-3xl text-chocolate">
                            Your cart is empty
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-chocolate-soft">
                            Looks like you haven&apos;t
                            added anything yet.
                            Explore our{' '}
                            {categoryName} and find
                            something you love.
                        </p>

                        <Link
                            href="/products"
                            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                        >
                            Explore {categoryName}

                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ======================================================================
       Main Cart Page
    ====================================================================== */

    return (
        <main className="min-h-screen bg-[#fff8f2] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* ==========================================================
                    Header
                ========================================================== */}

                <div className="mb-8">
                    <Link
                        href="/products"
                        className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-chocolate-soft transition hover:text-orange-600"
                    >
                        <ArrowLeft className="h-4 w-4" />

                        Continue Shopping
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                                Shopping Cart
                            </p>

                            <h1 className="mt-2 font-serif text-3xl text-chocolate sm:text-4xl">
                                Your Cart
                            </h1>

                            <p className="mt-2 text-sm text-chocolate-soft">
                                {validation.loading
                                    ? 'Checking your cart...'
                                    : `${itemCount} ${
                                          itemCount ===
                                          1
                                              ? 'item'
                                              : 'items'
                                      } ready for checkout`}
                            </p>
                        </div>

                        {items.length > 0 ? (
                            <button
                                type="button"
                                onClick={
                                    handleClear
                                }
                                disabled={
                                    validation.loading
                                }
                                className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-red-100 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                            >
                                <Trash2 className="h-3.5 w-3.5" />

                                Clear Cart
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* ==========================================================
                    Validation Error
                ========================================================== */}

                {validation.error ? (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="text-sm font-semibold">
                                Couldn&apos;t validate
                                your cart
                            </p>

                            <p className="mt-1 text-xs leading-5">
                                {
                                    validation.error
                                }
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* ==========================================================
                    Validation Loading
                ========================================================== */}

                {validation.loading ? (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-4 text-sm text-chocolate-soft shadow-2xl shadow-gray-50">
                        <RefreshCw className="h-4 w-4 animate-spin text-orange-500" />

                        Checking latest product
                        prices and availability...
                    </div>
                ) : null}

                {/* ==========================================================
                    Main Grid
                ========================================================== */}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    {/* ======================================================
                        Cart Items
                    ====================================================== */}

                    <section className="space-y-4">
                        {/* ==================================================
                            Unavailable Products
                        ================================================== */}

                        {unavailableItems.map(
                            (item) => (
                                <CartItemCard
                                    key={`${item.productId}-${item.size}`}
                                    item={item}
                                    unavailable
                                    onRemove={() =>
                                        handleRemove(
                                            item.productId,
                                            item.size,
                                            item.name,
                                        )
                                    }
                                    onIncrease={() =>
                                        handleIncrease(
                                            item.productId,
                                            item.size,
                                            item.quantity,
                                            item.availableStock,
                                        )
                                    }
                                    onDecrease={() =>
                                        handleDecrease(
                                            item.productId,
                                            item.size,
                                            item.quantity,
                                        )
                                    }
                                />
                            ),
                        )}

                        {/* ==================================================
                            Active Products
                        ================================================== */}

                        {activeItems.map(
                            (item) => (
                                <CartItemCard
                                    key={`${item.productId}-${item.size}`}
                                    item={item}
                                    onRemove={() =>
                                        handleRemove(
                                            item.productId,
                                            item.size,
                                            item.name,
                                        )
                                    }
                                    onIncrease={() =>
                                        handleIncrease(
                                            item.productId,
                                            item.size,
                                            item.quantity,
                                            item.availableStock,
                                        )
                                    }
                                    onDecrease={() =>
                                        handleDecrease(
                                            item.productId,
                                            item.size,
                                            item.quantity,
                                        )
                                    }
                                />
                            ),
                        )}

                        {/* ==================================================
                            Nothing Available
                        ================================================== */}

                        {!validation.loading &&
                        currentValidatedItems.length ===
                            0 &&
                        items.length > 0 ? (
                            <div className="rounded-3xl border border-orange-100 bg-white px-6 py-16 text-center shadow-2xl shadow-gray-50">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>

                                <h2 className="mt-5 font-serif text-xl text-chocolate">
                                    Nothing available
                                </h2>

                                <p className="mt-2 text-sm text-chocolate-soft">
                                    The products in
                                    your cart are
                                    no longer
                                    available.
                                </p>

                                <Link
                                    href="/products"
                                    className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                                >
                                    Shop {categoryName}

                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : null}
                    </section>

                    {/* ======================================================
                        Summary
                    ====================================================== */}

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            {/* ------------------------------------------------
                                Summary Header
                            ------------------------------------------------ */}

                            <div className="mb-6">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                    Order Summary
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-chocolate">
                                    Cart Total
                                </h2>
                            </div>

                            {/* ------------------------------------------------
                                Summary Values
                            ------------------------------------------------ */}

                            <div className="space-y-4">
                                {/* Items */}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-chocolate-soft">
                                        Items
                                    </span>

                                    <span className="font-semibold text-chocolate">
                                        {itemCount}
                                    </span>
                                </div>

                                {/* Subtotal */}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-chocolate-soft">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold text-chocolate">
                                        {validation.data
                                            ? formatPrice(
                                                  subtotal,
                                              )
                                            : '--'}
                                    </span>
                                </div>

                                {/* Total */}

                                <div className="border-t border-orange-100 pt-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
                                                Total
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-chocolate">
                                                {validation.data
                                                    ? formatPrice(
                                                          subtotal,
                                                      )
                                                    : '--'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ------------------------------------------------
                                Unavailable Warning
                            ------------------------------------------------ */}

                            {unavailableItems.length >
                            0 ? (
                                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                                        <p className="text-xs leading-5 text-amber-700">
                                            Remove
                                            unavailable
                                            products or
                                            reduce their
                                            quantities
                                            before
                                            proceeding to
                                            checkout.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {/* ------------------------------------------------
                                Checkout
                            ------------------------------------------------ */}

                            <Link
                                href={
                                    canCheckout
                                        ? '/checkout'
                                        : '#'
                                }
                                aria-disabled={
                                    !canCheckout
                                }
                                onClick={(event) => {
                                    if (
                                        !canCheckout
                                    ) {
                                        event.preventDefault();
                                    }
                                }}
                                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-lg transition ${
                                    canCheckout
                                        ? 'cursor-pointer bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600'
                                        : 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none'
                                }`}
                            >
                                Proceed to Checkout

                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <p className="mt-4 text-center text-[11px] leading-5 text-chocolate-muted">
                                Shipping and final
                                order totals are
                                calculated again
                                during checkout.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

/* ========================================================================== */
/* Cart Item Card                                                             */
/* ========================================================================== */

function CartItemCard({
    item,
    unavailable = false,
    onRemove,
    onIncrease,
    onDecrease,
}: {
    item: CartValidationItemDTO;
    unavailable?: boolean;
    onRemove: () => void;
    onIncrease: () => void;
    onDecrease: () => void;
}) {
    const discounted = hasDiscount(
        item.price,
        item.compareAtPrice,
    );

    /*
     * Maximum quantity allowed for THIS product size.
     *
     * Example:
     *
     * availableStock = 4
     * MAX_ITEM_QUANTITY = 10
     *
     * => maxQuantity = 4
     */
    const maxQuantity =
        getMaxQuantity(
            item.availableStock,
        );

    const stockLimitReached =
        item.quantity >= maxQuantity;

    const quantityExceedsStock =
        item.quantity >
        item.availableStock;

    const showLowStock =
        item.availableStock > 0 &&
        item.availableStock <= 9;

    return (
        <article
            className={`rounded-3xl border bg-white p-4 shadow-2xl shadow-gray-50 sm:p-5 ${
                unavailable
                    ? 'border-amber-200'
                    : 'border-orange-100'
            }`}
        >
            {/* ==========================================================
                Unavailable Banner
            ========================================================== */}

            {unavailable ? (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />

                    {quantityExceedsStock &&
                    item.availableStock >
                        0 ? (
                        <>
                            Only{' '}
                            {
                                item.availableStock
                            }{' '}
                            available for
                            size{' '}
                            {item.size}. Reduce
                            the quantity.
                        </>
                    ) : item.availableStock <=
                      0 ? (
                        <>
                            Size {item.size} is
                            currently out of
                            stock.
                        </>
                    ) : (
                        <>
                            This product is
                            currently
                            unavailable.
                        </>
                    )}
                </div>
            ) : null}

            {/* ==========================================================
                Main Item Row
            ========================================================== */}

            <div className="flex gap-4">
                {/* ======================================================
                    Product Image
                ====================================================== */}

                <Link
                    href={`/products/${item.slug}`}
                    className="shrink-0 cursor-pointer"
                >
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-orange-100 bg-[#fff7f0] sm:h-28 sm:w-28">
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="112px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-chocolate-muted">
                                No image
                            </div>
                        )}
                    </div>
                </Link>

                {/* ======================================================
                    Content
                ====================================================== */}

                <div className="min-w-0 flex-1">
                    {/* --------------------------------------------------
                        Name + Remove
                    -------------------------------------------------- */}

                    <div className="flex items-start justify-between gap-2">
                        <Link
                            href={`/products/${item.slug}`}
                            className="min-w-0 cursor-pointer"
                        >
                            <h2 className="line-clamp-2 font-serif text-base leading-6 text-chocolate sm:text-lg">
                                {item.name}
                            </h2>
                        </Link>

                        <button
                            type="button"
                            onClick={onRemove}
                            aria-label={`Remove ${item.name}, size ${item.size}`}
                            className="shrink-0 cursor-pointer rounded-xl p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    {/* --------------------------------------------------
                        Size
                    -------------------------------------------------- */}

                    <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs font-medium text-chocolate-muted">
                            Size
                        </span>

                        <span className="text-xs font-semibold text-chocolate">
                            {item.size}
                        </span>
                    </div>

                    {/* --------------------------------------------------
                        Stock
                    -------------------------------------------------- */}

                    {item.isActive ? (
                        <div className="mt-1.5">
                            <span
                                className={`text-[11px] font-medium ${
                                    showLowStock
                                        ? 'text-orange-600'
                                        : 'text-emerald-600'
                                }`}
                            >
                                {showLowStock
                                    ? `Only ${item.availableStock} left`
                                    : `${item.availableStock} available`}
                            </span>
                        </div>
                    ) : null}

                    {/* --------------------------------------------------
                        Price
                    -------------------------------------------------- */}

                    {discounted ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-chocolate">
                                {formatPrice(
                                    item.price,
                                )}
                            </span>

                            <span className="text-xs text-chocolate-muted line-through">
                                {formatPrice(
                                    item.compareAtPrice as number,
                                )}
                            </span>

                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                                Sale
                            </span>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm font-bold text-chocolate">
                            {formatPrice(
                                item.price,
                            )}
                        </p>
                    )}

                    {/* --------------------------------------------------
                        Quantity + Total
                    -------------------------------------------------- */}

                    <div className="mt-5 flex items-end justify-between gap-3">
                        {/* Quantity */}

                        <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-chocolate-muted">
                                Quantity
                            </p>

                            <div className="inline-flex items-center rounded-xl border border-orange-100 bg-[#fffaf6]">
                                {/* Decrease */}

                                <button
                                    type="button"
                                    onClick={
                                        onDecrease
                                    }
                                    disabled={
                                        item.quantity <=
                                        1
                                    }
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-chocolate-soft transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>

                                {/* Quantity Value */}

                                <span className="flex h-8 min-w-9 items-center justify-center border-x border-orange-100 px-2 text-sm font-bold text-chocolate">
                                    {item.quantity}
                                </span>

                                {/* Increase */}

                                <button
                                    type="button"
                                    onClick={
                                        onIncrease
                                    }
                                    disabled={
                                        stockLimitReached ||
                                        maxQuantity <= 0
                                    }
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-chocolate-soft transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={
                                        maxQuantity <=
                                        0
                                            ? 'Product out of stock'
                                            : stockLimitReached
                                              ? `Maximum available quantity reached for size ${item.size}`
                                              : 'Increase quantity'
                                    }
                                    title={
                                        maxQuantity <=
                                        0
                                            ? 'Out of stock'
                                            : stockLimitReached
                                              ? `Only ${maxQuantity} available`
                                              : `Add one more ${item.size}`
                                    }
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Maximum quantity info */}

                            {item.availableStock >
                                0 &&
                            maxQuantity <=
                                MAX_ITEM_QUANTITY ? (
                                <p
                                    className={`mt-1.5 text-[10px] ${
                                        stockLimitReached
                                            ? 'font-semibold text-orange-600'
                                            : 'text-chocolate-muted'
                                    }`}
                                >
                                    Max{' '}
                                    {
                                        maxQuantity
                                    }{' '}
                                    for size{' '}
                                    {item.size}
                                </p>
                            ) : null}
                        </div>

                        {/* Line Total */}

                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-chocolate-muted">
                                Total
                            </p>

                            <p className="mt-1 text-lg font-bold text-chocolate">
                                {formatPrice(
                                    item.lineTotal,
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}