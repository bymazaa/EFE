'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import {
    Minus,
    Plus,
    ShoppingBag,
    Zap,
} from 'lucide-react';

import { useCartStore } from '@/store/cart.store';

import {
    MAX_ITEM_QUANTITY,
} from '@/lib/validation/cart.schema';

interface ProductVariant {
    size: string;
    stock: number;
}

interface ProductDetailsActionsProps {
    productId: string;
    productName: string;
    variants: ProductVariant[];
}

/* ============================================================
   Helpers
============================================================ */

function normalizeSize(size: string) {
    return size.trim().toLowerCase();
}

/* ============================================================
   Component
============================================================ */

export function ProductDetailsActions({
    productId,
    productName,
    variants,
}: ProductDetailsActionsProps) {
    const router = useRouter();

    /* ==========================================================
       Initial size
    ========================================================== */

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

    /* ==========================================================
       Keep selected size valid
    ========================================================== */

    useEffect(() => {
        if (variants.length === 0) {
            setSelectedSize('');
            return;
        }

        const selectedStillExists =
            variants.some(
                (variant) =>
                    normalizeSize(
                        variant.size,
                    ) ===
                    normalizeSize(
                        selectedSize,
                    ),
            );

        if (!selectedStillExists) {
            const firstAvailable =
                variants.find(
                    (variant) =>
                        variant.stock > 0,
                );

            setSelectedSize(
                firstAvailable?.size ??
                    variants[0]?.size ??
                    '',
            );
        }
    }, [variants, selectedSize]);

    /* ==========================================================
       Cart
    ========================================================== */

    const cartItem = useCartStore(
        (state) =>
            state.items.find(
                (item) =>
                    item.productId ===
                        productId &&
                    normalizeSize(
                        item.size,
                    ) ===
                        normalizeSize(
                            selectedSize,
                        ),
            ),
    );

    const addItem = useCartStore(
        (state) => state.addItem,
    );

    const setQuantity = useCartStore(
        (state) => state.setQuantity,
    );

    /* ==========================================================
       Selected variant
    ========================================================== */

    const selectedVariant =
        variants.find(
            (variant) =>
                normalizeSize(
                    variant.size,
                ) ===
                normalizeSize(
                    selectedSize,
                ),
        ) ?? null;

    const stock =
        selectedVariant?.stock ?? 0;

    const quantity =
        cartItem?.quantity ?? 0;

    const isInCart =
        quantity > 0;

    const isOutOfStock =
        !selectedVariant ||
        stock <= 0;

    /* ==========================================================
       Quantity limits
    ========================================================== */

    const maxAllowedQuantity =
        Math.min(
            MAX_ITEM_QUANTITY,
            Math.max(stock, 0),
        );

    const canIncrease =
        !isOutOfStock &&
        quantity < maxAllowedQuantity;

    /* ==========================================================
       Size selection
    ========================================================== */

    const handleSelectSize = (
        size: string,
    ) => {
        setSelectedSize(size);
    };

    /* ==========================================================
       Add to cart
    ========================================================== */

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error(
                'Please select a size.',
            );
            return;
        }

        if (stock <= 0) {
            toast.error(
                `${selectedVariant.size} is currently out of stock.`,
            );
            return;
        }

        if (
            quantity >=
            maxAllowedQuantity
        ) {
            toast.info(
                `You can add up to ${maxAllowedQuantity} of size ${selectedVariant.size}.`,
            );
            return;
        }

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

    /* ==========================================================
       Increase
    ========================================================== */

    const handleIncrease = () => {
        if (
            !selectedVariant ||
            stock <= 0
        ) {
            toast.error(
                'This size is out of stock.',
            );
            return;
        }

        if (
            quantity >=
            maxAllowedQuantity
        ) {
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

    /* ==========================================================
       Decrease
    ========================================================== */

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

    /* ==========================================================
       Buy now
    ========================================================== */

    const handleBuyNow = () => {
        if (!selectedVariant) {
            toast.error(
                'Please select a size.',
            );
            return;
        }

        if (stock <= 0) {
            toast.error(
                `${selectedVariant.size} is currently out of stock.`,
            );
            return;
        }

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
        <div className="mx-auto mt-8 w-full max-w-lg">
            {/* ======================================================
                Size Selection
            ====================================================== */}

            {variants.length > 0 ? (
                <div>
                    <div className="mb-3 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold tracking-tight text-chocolate">
                                Select Size
                            </p>

                            {selectedVariant ? (
                                <p
                                    className={`mt-1 text-xs ${
                                        isOutOfStock
                                            ? 'font-medium text-red-500'
                                            : stock <= 9
                                              ? 'font-medium text-orange-600'
                                              : 'text-chocolate-soft'
                                    }`}
                                >
                                    {isOutOfStock
                                        ? 'Out of stock'
                                        : stock <= 9
                                          ? `Only ${stock} left`
                                          : `${stock} available`}
                                </p>
                            ) : null}
                        </div>

                        <a
                            href="/size-guide"
                            className="cursor-pointer text-xs font-semibold text-orange-600 underline decoration-orange-200 underline-offset-4 transition hover:text-orange-700 hover:decoration-orange-400"
                        >
                            Size Guide
                        </a>
                    </div>

                    {/* Size buttons */}

                    <div
                        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                        role="group"
                        aria-label="Select product size"
                    >
                        {variants.map(
                            (variant) => {
                                const isSelected =
                                    normalizeSize(
                                        variant.size,
                                    ) ===
                                    normalizeSize(
                                        selectedSize,
                                    );

                                const variantOutOfStock =
                                    variant.stock <=
                                    0;

                                return (
                                    <button
                                        key={
                                            variant.size
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleSelectSize(
                                                variant.size,
                                            )
                                        }
                                        aria-pressed={
                                            isSelected
                                        }
                                        aria-label={`${variant.size}${
                                            variantOutOfStock
                                                ? ' - out of stock'
                                                : ''
                                        }`}
                                        className={`
                                            relative
                                            flex
                                            h-12
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            px-4
                                            text-sm
                                            font-bold
                                            transition-all
                                            duration-200
                                            active:scale-[0.98]
                                            ${
                                                isSelected
                                                    ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-100'
                                                    : variantOutOfStock
                                                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                                                      : 'border-orange-100 bg-white text-chocolate hover:border-orange-300 hover:bg-orange-50'
                                            }
                                        `}
                                    >
                                        {isSelected ? (
                                            <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white" />
                                        ) : null}

                                        {variant.size}
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Size information is currently unavailable.
                </div>
            )}

            {/* ======================================================
                Selected stock info
            ====================================================== */}

            {selectedVariant ? (
                <div className="mt-4 flex min-h-5 items-center justify-between gap-3">
                    <p
                        className={`text-xs ${
                            isOutOfStock
                                ? 'font-medium text-red-500'
                                : stock <= 9
                                  ? 'font-medium text-orange-600'
                                  : 'text-emerald-600'
                        }`}
                    >
                        {isOutOfStock
                            ? `${selectedVariant.size} is out of stock`
                            : stock <= 9
                              ? `Only ${stock} left in ${selectedVariant.size}`
                              : `${stock} units available in ${selectedVariant.size}`}
                    </p>

                    {isInCart ? (
                        <p className="text-xs font-semibold text-chocolate-soft">
                            {quantity}{' '}
                            in cart
                        </p>
                    ) : null}
                </div>
            ) : null}

            {/* ======================================================
                Actions
            ====================================================== */}

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* Add to Cart / Quantity */}

                {isInCart ? (
                    <div
                        className={`
                            flex
                            h-13
                            w-full
                            items-center
                            justify-between
                            rounded-xl
                            border
                            bg-white
                            px-1.5
                            shadow-sm
                            ${
                                isOutOfStock
                                    ? 'border-red-100'
                                    : 'border-orange-200'
                            }
                        `}
                    >
                        <button
                            type="button"
                            onClick={
                                handleDecrease
                            }
                            aria-label={`Decrease ${productName} size ${selectedSize} quantity`}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95"
                        >
                            <Minus
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </button>

                        <div className="text-center">
                            <span
                                aria-live="polite"
                                className="block text-base font-bold leading-none text-chocolate"
                            >
                                {quantity}
                            </span>

                            <span className="mt-1 block text-[10px] font-medium text-chocolate-soft">
                                {selectedVariant?.size ??
                                    selectedSize}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleIncrease
                            }
                            disabled={
                                !canIncrease
                            }
                            aria-label={`Increase ${productName} size ${selectedSize} quantity`}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <Plus
                                className="h-4 w-4"
                                strokeWidth={2}
                            />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={
                            handleAddToCart
                        }
                        disabled={
                            !selectedVariant ||
                            isOutOfStock
                        }
                        className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 text-sm font-bold text-chocolate shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                        <ShoppingBag
                            className="h-4.5 w-4.5"
                            strokeWidth={1.75}
                        />

                        {isOutOfStock
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                    </button>
                )}

                {/* Buy Now */}

                <button
                    type="button"
                    onClick={
                        handleBuyNow
                    }
                    disabled={
                        !selectedVariant ||
                        isOutOfStock
                    }
                    className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                    <Zap
                        className="h-4.5 w-4.5"
                        fill="currentColor"
                        strokeWidth={1.6}
                    />

                    Buy Now
                </button>
            </div>

            {/* ======================================================
                Quantity information
            ====================================================== */}

            {isInCart &&
            selectedVariant ? (
                <p className="mt-2.5 text-center text-[11px] text-chocolate-muted">
                    {maxAllowedQuantity <
                    MAX_ITEM_QUANTITY
                        ? `Maximum ${maxAllowedQuantity} available for size ${selectedVariant.size}.`
                        : `Maximum ${MAX_ITEM_QUANTITY} items allowed.`}
                </p>
            ) : null}
        </div>
    );
}