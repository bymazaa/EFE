'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import {
    Minus,
    Plus,
    ShoppingBag,
    Zap,
} from 'lucide-react';

import { useCartStore } from '@/store/cart.store';
import { MAX_ITEM_QUANTITY } from '@/lib/validation/cart.schema';

interface ProductVariant {
    size: string;
    stock: number;
}

interface ProductDetailsActionsProps {
    productId: string;
    productName: string;
    variants: ProductVariant[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeSize(size: string) {
    return size.trim().toLowerCase();
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function ProductDetailsActions({
    productId,
    productName,
    variants,
}: ProductDetailsActionsProps) {
    const router = useRouter();

    /*
     * Prefer the first size that actually has stock.
     * If every size is out of stock, use the first variant so the
     * user can still see which size is unavailable.
     */
    const initialSize = useMemo(() => {
        const firstAvailable = variants.find(
            (variant) => variant.stock > 0,
        );

        return (
            firstAvailable?.size ??
            variants[0]?.size ??
            ''
        );
    }, [variants]);

    const [selectedSize, setSelectedSize] =
        useState(initialSize);

    /*
     * Keep selected size valid if the product data changes.
     */
    useEffect(() => {
        if (variants.length === 0) {
            setSelectedSize('');
            return;
        }

        const selectedStillExists = variants.some(
            (variant) =>
                normalizeSize(variant.size) ===
                normalizeSize(selectedSize),
        );

        if (!selectedStillExists) {
            const firstAvailable = variants.find(
                (variant) => variant.stock > 0,
            );

            setSelectedSize(
                firstAvailable?.size ??
                    variants[0]?.size ??
                    '',
            );
        }
    }, [variants, selectedSize]);

    const cartItem = useCartStore((state) =>
        state.items.find(
            (item) =>
                item.productId === productId &&
                normalizeSize(item.size) ===
                    normalizeSize(selectedSize),
        ),
    );

    const addItem = useCartStore(
        (state) => state.addItem,
    );

    const setQuantity = useCartStore(
        (state) => state.setQuantity,
    );

    const selectedVariant =
        variants.find(
            (variant) =>
                normalizeSize(variant.size) ===
                normalizeSize(selectedSize),
        ) ?? null;

    const stock = selectedVariant?.stock ?? 0;

    const quantity = cartItem?.quantity ?? 0;

    const isInCart = quantity > 0;

    const isOutOfStock =
        !selectedVariant || stock <= 0;

    /*
     * The maximum quantity must respect both:
     *
     * 1. Global cart limit
     * 2. Current size stock
     */
    const maxAllowedQuantity = Math.min(
        MAX_ITEM_QUANTITY,
        Math.max(stock, 0),
    );

    const canIncrease =
        !isOutOfStock &&
        quantity < maxAllowedQuantity;

    const availableSizes = variants.length > 0;

    /* ================================================================
       Size selection
    ================================================================= */

    const handleSelectSize = (size: string) => {
        setSelectedSize(size);
    };

    /* ================================================================
       Add to cart
    ================================================================= */

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error('Please select a size.');
            return;
        }

        if (stock <= 0) {
            toast.error(
                `${selectedVariant.size} is currently out of stock.`,
            );
            return;
        }

        if (quantity >= maxAllowedQuantity) {
            toast.info(
                `You can add up to ${maxAllowedQuantity} of size ${selectedVariant.size}.`,
            );
            return;
        }

        /*
         * If the item already exists with this size,
         * increase by one.
         *
         * Otherwise add one new cart item.
         */
        if (isInCart) {
            setQuantity(
                productId,
                selectedVariant.size,
                quantity + 1,
            );
        } else {
            addItem(
                productId,
                selectedVariant.size,
                1,
            );
        }

        toast.success(
            `${productName} (${selectedVariant.size}) added to cart.`,
        );
    };

    /* ================================================================
       Increase quantity
    ================================================================= */

    const handleIncrease = () => {
        if (!selectedVariant || stock <= 0) {
            toast.error('This size is out of stock.');
            return;
        }

        if (quantity >= maxAllowedQuantity) {
            toast.info(
                `You can add up to ${maxAllowedQuantity} of size ${selectedVariant.size}.`,
            );
            return;
        }

        setQuantity(
            productId,
            selectedVariant.size,
            quantity + 1,
        );
    };

    /* ================================================================
       Decrease quantity
    ================================================================= */

    const handleDecrease = () => {
        if (!selectedVariant) {
            return;
        }

        if (quantity <= 1) {
            setQuantity(
                productId,
                selectedVariant.size,
                0,
            );

            toast.success(
                `${productName} (${selectedVariant.size}) removed from cart.`,
            );

            return;
        }

        setQuantity(
            productId,
            selectedVariant.size,
            quantity - 1,
        );
    };

    /* ================================================================
       Buy now
    ================================================================= */

    const handleBuyNow = () => {
        if (!selectedVariant) {
            toast.error('Please select a size.');
            return;
        }

        if (stock <= 0) {
            toast.error(
                `${selectedVariant.size} is currently out of stock.`,
            );
            return;
        }

        /*
         * If this product + size is not already in the cart,
         * add exactly one item.
         *
         * If it already exists, keep the current quantity.
         * This preserves your previous Buy Now behavior.
         */
        if (!isInCart) {
            addItem(
                productId,
                selectedVariant.size,
                1,
            );
        }

        router.push('/cart');
    };

    return (
        <div className="mx-auto mt-7 w-full max-w-lg">
            {/* ========================================================
                Size Selection
            ========================================================= */}

            {availableSizes ? (
                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-chocolate">
                                Size
                            </p>

                            {selectedVariant &&
                                !isOutOfStock && (
                                    <p className="mt-1 text-xs text-chocolate-soft">
                                        {stock <= 9
                                            ? `Only ${stock} left`
                                            : `${stock} available`}
                                    </p>
                                )}

                            {selectedVariant &&
                                isOutOfStock && (
                                    <p className="mt-1 text-xs font-medium text-red-500">
                                        Out of stock
                                    </p>
                                )}
                        </div>

                        <a
                            href="/size-guide"
                            className="cursor-pointer text-xs font-semibold text-orange-600 underline underline-offset-4 transition hover:text-orange-700"
                        >
                            Size Guide
                        </a>
                    </div>

                    <div
                        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                        role="group"
                        aria-label="Select product size"
                    >
                        {variants.map((variant) => {
                            const isSelected =
                                normalizeSize(
                                    variant.size,
                                ) ===
                                normalizeSize(
                                    selectedSize,
                                );

                            const variantOutOfStock =
                                variant.stock <= 0;

                            return (
                                <button
                                    key={variant.size}
                                    type="button"
                                    onClick={() =>
                                        handleSelectSize(
                                            variant.size,
                                        )
                                    }
                                    aria-pressed={
                                        isSelected
                                    }
                                    aria-label={`${variant.size}${variantOutOfStock ? ' - out of stock' : ''}`}
                                    className={`flex h-11 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-bold transition active:scale-[0.98] ${
                                        isSelected
                                            ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                                            : variantOutOfStock
                                              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                                              : 'border-orange-100 bg-white text-chocolate hover:border-orange-300 hover:bg-orange-50'
                                    }`}
                                >
                                    {variant.size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Size information is currently unavailable.
                </div>
            )}

            {/* ========================================================
                Current selected size status
            ========================================================= */}

            {selectedVariant && (
                <div className="mt-3 flex items-center justify-between gap-3">
                    <p
                        className={`text-xs font-medium ${
                            isOutOfStock
                                ? 'text-red-500'
                                : stock <= 9
                                  ? 'text-orange-600'
                                  : 'text-emerald-600'
                        }`}
                    >
                        {isOutOfStock
                            ? `${selectedVariant.size} is out of stock`
                            : stock <= 9
                              ? `Only ${stock} left in ${selectedVariant.size}`
                              : `${stock} units available in ${selectedVariant.size}`}
                    </p>

                    {isInCart && (
                        <p className="text-xs font-semibold text-chocolate-soft">
                            {quantity} in your cart
                        </p>
                    )}
                </div>
            )}

            {/* ========================================================
                Cart + Buy Now
            ========================================================= */}

            <div className="mt-5 flex w-full flex-col gap-3 lg:flex-row">
                {/* ----------------------------------------------------
                    Cart action
                ---------------------------------------------------- */}

                {isInCart ? (
                    <div
                        className={`flex h-12 w-full items-center justify-between rounded-2xl border bg-white px-1.5 shadow-sm lg:flex-1 ${
                            isOutOfStock
                                ? 'border-red-100'
                                : 'border-orange-200'
                        }`}
                    >
                        {/* Minus */}

                        <button
                            type="button"
                            onClick={handleDecrease}
                            aria-label={`Decrease ${productName} size ${selectedSize} quantity`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95"
                        >
                            <Minus
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </button>

                        {/* Quantity */}

                        <div className="text-center">
                            <span
                                aria-live="polite"
                                className="block min-w-8 text-sm font-bold text-chocolate"
                            >
                                {quantity}
                            </span>

                            <span className="text-[10px] text-chocolate-soft">
                                {selectedVariant?.size ??
                                    selectedSize}
                            </span>
                        </div>

                        {/* Plus */}

                        <button
                            type="button"
                            onClick={handleIncrease}
                            disabled={!canIncrease}
                            aria-label={`Increase ${productName} size ${selectedSize} quantity`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Plus
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </button>
                    </div>
                ) : (
                    /* -------------------------------------------------
                       Add to Cart
                    ------------------------------------------------- */
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={
                            !selectedVariant ||
                            isOutOfStock
                        }
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 text-sm font-bold text-chocolate shadow-sm transition hover:border-orange-300 hover:bg-orange-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 lg:flex-1"
                    >
                        <ShoppingBag
                            className="h-5 w-5 shrink-0"
                            strokeWidth={1.75}
                        />

                        {isOutOfStock
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                    </button>
                )}

                {/* ----------------------------------------------------
                    Buy Now
                ------------------------------------------------- */}

                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={
                        !selectedVariant ||
                        isOutOfStock
                    }
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none lg:flex-1"
                >
                    <Zap
                        className="h-5 w-5 shrink-0"
                        fill="currentColor"
                        strokeWidth={1.6}
                    />

                    Buy Now
                </button>
            </div>

            {/* ========================================================
                Cart quantity information
            ========================================================= */}

            {isInCart && selectedVariant && (
                <p className="mt-2 text-center text-[11px] text-chocolate-soft">
                    {maxAllowedQuantity < MAX_ITEM_QUANTITY
                        ? `Maximum ${maxAllowedQuantity} available for size ${selectedVariant.size}.`
                        : `Maximum ${MAX_ITEM_QUANTITY} items allowed.`}
                </p>
            )}
        </div>
    );
}