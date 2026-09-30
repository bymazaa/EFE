'use client';

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

export function ProductDetailsActions({
    productId,
    productName,
}: {
    productId: string;
    productName: string;
}) {
    const router = useRouter();

    const cartItem = useCartStore(
        (state) =>
            state.items.find(
                (item) =>
                    item.productId === productId,
            ),
    );

    const addItem = useCartStore(
        (state) => state.addItem,
    );

    const setQuantity = useCartStore(
        (state) => state.setQuantity,
    );

    const quantity = cartItem?.quantity ?? 0;

    const isInCart = quantity > 0;

    /* =========================================================
       Add to cart
    ========================================================= */

    const handleAddToCart = () => {
        addItem(productId, 1);

        toast.success(
            `${productName} added to cart.`,
        );
    };

    /* =========================================================
       Increase quantity
    ========================================================= */

    const handleIncrease = () => {
        if (quantity >= MAX_ITEM_QUANTITY) {
            toast.info(
                `You can add up to ${MAX_ITEM_QUANTITY} of this item.`,
            );

            return;
        }

        setQuantity(
            productId,
            quantity + 1,
        );
    };

    /* =========================================================
       Decrease quantity
    ========================================================= */

    const handleDecrease = () => {
        if (quantity <= 1) {
            setQuantity(productId, 0);

            toast.success(
                `${productName} removed from cart.`,
            );

            return;
        }

        setQuantity(
            productId,
            quantity - 1,
        );
    };

    /* =========================================================
       Buy now
    ========================================================= */

    const handleBuyNow = () => {
        /*
         * If the product is not already in the cart,
         * add one item. If it already exists, don't
         * increase its quantity unexpectedly.
         */
        if (!isInCart) {
            addItem(productId, 1);
        }

        router.push('/cart');
    };

    return (
        <div className="mx-auto mt-7 flex w-full max-w-lg flex-col gap-3 lg:flex-row">
            {/* =====================================================
                Cart action
            ===================================================== */}

            {isInCart ? (
                <div className="flex h-12 w-full items-center justify-between rounded-2xl border border-orange-200 bg-white px-1.5 shadow-sm lg:flex-1">
                    {/* Minus */}

                    <button
                        type="button"
                        onClick={handleDecrease}
                        aria-label={`Decrease ${productName} quantity`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95"
                    >
                        <Minus
                            className="h-4 w-4"
                            strokeWidth={2}
                        />
                    </button>

                    {/* Quantity */}

                    <span
                        aria-live="polite"
                        className="min-w-8 text-center text-sm font-bold text-chocolate"
                    >
                        {quantity}
                    </span>

                    {/* Plus */}

                    <button
                        type="button"
                        onClick={handleIncrease}
                        aria-label={`Increase ${productName} quantity`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-chocolate-soft transition hover:bg-orange-50 hover:text-chocolate active:scale-95"
                    >
                        <Plus
                            className="h-4 w-4"
                            strokeWidth={2}
                        />
                    </button>
                </div>
            ) : (
                /* =================================================
                   Add to Cart
                ================================================= */

                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 text-sm font-bold text-chocolate shadow-sm transition hover:border-orange-300 hover:bg-orange-50 active:scale-[0.99] lg:flex-1"
                >
                    <ShoppingBag
                        className="h-5 w-5 shrink-0"
                        strokeWidth={1.75}
                    />

                    Add to Cart
                </button>
            )}

            {/* =====================================================
                Buy Now
            ===================================================== */}

            <button
                type="button"
                onClick={handleBuyNow}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 active:scale-[0.99] lg:flex-1"
            >
                <Zap
                    className="h-5 w-5 shrink-0"
                    fill="currentColor"
                    strokeWidth={1.6}
                />

                Buy Now
            </button>
        </div>
    );
}