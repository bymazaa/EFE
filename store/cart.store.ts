import { create } from 'zustand';

import { persist } from 'zustand/middleware';

import {
    MAX_ITEM_QUANTITY,
    MAX_CART_ITEMS,
} from '@/lib/validation/cart.schema';

export interface CartItem {
    productId: string;
    size: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];

    addItem: (
        productId: string,
        size: string,
        quantity?: number,
    ) => void;

    removeItem: (
        productId: string,
        size: string,
    ) => void;

    setQuantity: (
        productId: string,
        size: string,
        quantity: number,
    ) => void;

    clear: () => void;
}

function normalizeSize(size: string): string {
    return size.trim();
}

function isSameCartItem(
    item: CartItem,
    productId: string,
    size: string,
): boolean {
    return (
        item.productId === productId &&
        item.size === size
    );
}

/**
 * Client-only cart.
 *
 * Stores only:
 * - productId
 * - size
 * - quantity
 *
 * Never stores price or product name.
 * The server re-validates the cart against the database
 * before checkout and money calculations.
 */
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (
                productId,
                size,
                quantity = 1,
            ) => {
                const normalizedSize =
                    normalizeSize(size);

                if (!normalizedSize) {
                    return;
                }

                const items = get().items;

                const existing = items.find(
                    (item) =>
                        isSameCartItem(
                            item,
                            productId,
                            normalizedSize,
                        ),
                );

                if (existing) {
                    set({
                        items: items.map((item) =>
                            isSameCartItem(
                                item,
                                productId,
                                normalizedSize,
                            )
                                ? {
                                      ...item,
                                      quantity: Math.min(
                                          item.quantity +
                                              quantity,
                                          MAX_ITEM_QUANTITY,
                                      ),
                                  }
                                : item,
                        ),
                    });

                    return;
                }

                /*
                 * MAX_CART_ITEMS limits the number of
                 * separate product + size lines.
                 */
                if (
                    items.length >=
                    MAX_CART_ITEMS
                ) {
                    return;
                }

                set({
                    items: [
                        ...items,
                        {
                            productId,
                            size: normalizedSize,
                            quantity: Math.min(
                                quantity,
                                MAX_ITEM_QUANTITY,
                            ),
                        },
                    ],
                });
            },

            removeItem: (
                productId,
                size,
            ) => {
                const normalizedSize =
                    normalizeSize(size);

                set({
                    items: get().items.filter(
                        (item) =>
                            !isSameCartItem(
                                item,
                                productId,
                                normalizedSize,
                            ),
                    ),
                });
            },

            setQuantity: (
                productId,
                size,
                quantity,
            ) => {
                const normalizedSize =
                    normalizeSize(size);

                if (quantity <= 0) {
                    get().removeItem(
                        productId,
                        normalizedSize,
                    );

                    return;
                }

                set({
                    items: get().items.map(
                        (item) =>
                            isSameCartItem(
                                item,
                                productId,
                                normalizedSize,
                            )
                                ? {
                                      ...item,
                                      quantity: Math.min(
                                          quantity,
                                          MAX_ITEM_QUANTITY,
                                      ),
                                  }
                                : item,
                    ),
                });
            },

            clear: () =>
                set({
                    items: [],
                }),
        }),
        {
            name: 'quiet-flame-cart',

            /*
             * Cart structure changed from:
             * { productId, quantity }
             *
             * to:
             * { productId, size, quantity }
             *
             * Old persisted carts cannot safely be reused
             * because their size is unknown.
             */
            version: 2,

            migrate: (
                persistedState,
                version,
            ) => {
                if (version < 2) {
                    return {
                        items: [],
                    };
                }

                return persistedState as CartState;
            },
        },
    ),
);

/**
 * Total item count for the header badge.
 *
 * Example:
 * M × 2
 * L × 1
 *
 * Result = 3
 */
export function useCartCount(): number {
    return useCartStore((state) =>
        state.items.reduce(
            (sum, item) =>
                sum + item.quantity,
            0,
        ),
    );
}