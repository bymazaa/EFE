'use client';

import {
    useEffect,
    useMemo,
    useState,
    type MouseEvent,
} from 'react';

import { createPortal } from 'react-dom';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import {
    ShoppingBag,
    X,
    Zap,
} from 'lucide-react';

import { useCartStore } from '@/store/cart.store';

import { MAX_ITEM_QUANTITY } from '@/lib/validation/cart.schema';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/app/components/ui/Button';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductVariant {
    size: string;
    stock: number;
}

type PendingAction = 'cart' | 'buy' | null;

interface AddToCartButtonsProps {
    productId: string;
    productName: string;
    variants: ProductVariant[];
    quantity?: number;
    layout?: 'row' | 'stack';
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

export function AddToCartButtons({
    productId,
    productName,
    variants,
    quantity = 1,
    layout = 'row',
}: AddToCartButtonsProps) {
    const router = useRouter();

    const [isMounted, setIsMounted] =
        useState(false);

    const [isSizePickerOpen, setIsSizePickerOpen] =
        useState(false);

    const [selectedSize, setSelectedSize] =
        useState('');

    const [pendingAction, setPendingAction] =
        useState<PendingAction>(null);

    /* ================================================================
       Portal mount
    ================================================================= */

    useEffect(() => {
        setIsMounted(true);
    }, []);

    /* ================================================================
       Cart
    ================================================================= */

    const cartItems = useCartStore(
        (state) => state.items,
    );

    const addItem = useCartStore(
        (state) => state.addItem,
    );

    /* ================================================================
       Variants
    ================================================================= */

    const normalizedVariants = useMemo(() => {
        return variants
            .map((variant) => ({
                size: variant.size.trim(),
                stock: Math.max(
                    0,
                    variant.stock,
                ),
            }))
            .filter((variant) => variant.size);
    }, [variants]);

    const availableVariants = useMemo(
        () =>
            normalizedVariants.filter(
                (variant) => variant.stock > 0,
            ),
        [normalizedVariants],
    );

    const hasAnyStock =
        availableVariants.length > 0;

    const hasMultipleSizes =
        normalizedVariants.length > 1;

    const isStack = layout === 'stack';

    /* ================================================================
       Selected variant
    ================================================================= */

    const selectedVariant =
        normalizedVariants.find(
            (variant) =>
                normalizeSize(variant.size) ===
                normalizeSize(selectedSize),
        ) ?? null;

    /* ================================================================
       Current selected item quantity
    ================================================================= */

    const selectedCartItemQuantity =
        selectedSize
            ? (cartItems.find(
                  (item) =>
                      item.productId ===
                          productId &&
                      normalizeSize(item.size) ===
                          normalizeSize(
                              selectedSize,
                          ),
              )?.quantity ?? 0)
            : 0;

    /* ================================================================
       Close modal
    ================================================================= */

    const closeSizePicker = () => {
        setIsSizePickerOpen(false);
        setPendingAction(null);
    };

    /* ================================================================
       Perform action
    ================================================================= */

    const handleAction = (
        action: Exclude<PendingAction, null>,
        size: string,
    ) => {
        const variant =
            normalizedVariants.find(
                (item) =>
                    normalizeSize(item.size) ===
                    normalizeSize(size),
            );

        if (!variant) {
            toast.error('Please select a valid size.');
            return;
        }

        if (variant.stock <= 0) {
            toast.error(
                `${variant.size} is currently out of stock.`,
            );
            return;
        }

        const safeQuantity = Math.max(
            1,
            Math.floor(quantity),
        );

        if (safeQuantity > MAX_ITEM_QUANTITY) {
            toast.info(
                `You can add up to ${MAX_ITEM_QUANTITY} items.`,
            );
            return;
        }

        const existingQuantity =
            cartItems.find(
                (item) =>
                    item.productId ===
                        productId &&
                    normalizeSize(item.size) ===
                        normalizeSize(variant.size),
            )?.quantity ?? 0;

        const maximumQuantity = Math.min(
            variant.stock,
            MAX_ITEM_QUANTITY,
        );

        /* ------------------------------------------------------------
           Add to Cart
        ------------------------------------------------------------ */

        if (action === 'cart') {
            const nextQuantity =
                existingQuantity + safeQuantity;

            if (
                nextQuantity >
                maximumQuantity
            ) {
                const remaining =
                    maximumQuantity -
                    existingQuantity;

                if (remaining <= 0) {
                    toast.info(
                        `You already have the maximum available quantity of size ${variant.size} in your cart.`,
                    );
                } else {
                    toast.info(
                        `Only ${remaining} more available for size ${variant.size}.`,
                    );
                }

                return;
            }

            addItem(
                productId,
                variant.size,
                safeQuantity,
            );

            toast.success(
                `${productName} (${variant.size}) added to cart.`,
            );

            closeSizePicker();

            return;
        }

        /* ------------------------------------------------------------
           Buy Now
        ------------------------------------------------------------ */

        /*
         * Preserve the existing behavior:
         * If the exact product + size is already in cart,
         * don't unexpectedly increase it.
         */
        if (existingQuantity === 0) {
            if (safeQuantity > maximumQuantity) {
                toast.info(
                    `Only ${maximumQuantity} available for size ${variant.size}.`,
                );
                return;
            }

            addItem(
                productId,
                variant.size,
                safeQuantity,
            );
        }

        closeSizePicker();

        router.push('/cart');
    };

    /* ================================================================
       Open size picker
    ================================================================= */

    const openSizePicker = (
        action: Exclude<PendingAction, null>,
    ) => {
        if (!normalizedVariants.length) {
            toast.error(
                'Size information is currently unavailable.',
            );
            return;
        }

        if (!hasAnyStock) {
            toast.error(
                `${productName} is currently out of stock.`,
            );
            return;
        }

        /*
         * One-size product:
         * no modal needed.
         */
        if (!hasMultipleSizes) {
            const onlyVariant =
                availableVariants[0];

            if (!onlyVariant) {
                toast.error(
                    `${productName} is currently out of stock.`,
                );
                return;
            }

            handleAction(
                action,
                onlyVariant.size,
            );

            return;
        }

        /*
         * Multiple sizes:
         * open portal modal.
         */
        const firstAvailable =
            availableVariants[0];

        setSelectedSize(
            firstAvailable?.size ??
                normalizedVariants[0]?.size ??
                '',
        );

        setPendingAction(action);

        setIsSizePickerOpen(true);
    };

    /* ================================================================
       Modal confirm
    ================================================================= */

    const handleConfirmSelection = () => {
        if (!pendingAction) {
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size.');
            return;
        }

        handleAction(
            pendingAction,
            selectedSize,
        );
    };

    /* ================================================================
       Button handlers
    ================================================================= */

    const handleAddToCart = (
        event: MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        openSizePicker('cart');
    };

    const handleBuyNow = (
        event: MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        openSizePicker('buy');
    };

    /* ================================================================
       Lock body scroll while modal is open
    ================================================================= */

    useEffect(() => {
        if (!isSizePickerOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        const handleEscape = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'Escape') {
                closeSizePicker();
            }
        };

        document.addEventListener(
            'keydown',
            handleEscape,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                'keydown',
                handleEscape,
            );
        };
    }, [isSizePickerOpen]);

    /* ================================================================
       Modal
    ================================================================= */

    const sizePickerModal =
        isSizePickerOpen && isMounted
            ? createPortal(
                  <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="product-size-picker-title"
                      onMouseDown={(event) => {
                          if (
                              event.target ===
                              event.currentTarget
                          ) {
                              closeSizePicker();
                          }
                      }}
                  >
                      <div
                          className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl"
                          onMouseDown={(event) =>
                              event.stopPropagation()
                          }
                      >
                          {/* =================================================
                              Header
                          ================================================= */}

                          <div className="flex items-start justify-between gap-4 border-b border-orange-100 px-5 py-4 sm:px-6">
                              <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">
                                      Select Size
                                  </p>

                                  <h2
                                      id="product-size-picker-title"
                                      className="mt-1.5 line-clamp-2 font-serif text-xl leading-tight text-chocolate"
                                  >
                                      {productName}
                                  </h2>
                              </div>

                              <button
                                  type="button"
                                  onClick={
                                      closeSizePicker
                                  }
                                  aria-label="Close size selector"
                                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-orange-50 hover:text-chocolate"
                              >
                                  <X className="h-4 w-4" />
                              </button>
                          </div>

                          {/* =================================================
                              Body
                          ================================================= */}

                          <div className="px-5 py-5 sm:px-6">
                              <p className="mb-3 text-xs font-medium text-chocolate-soft">
                                  Choose your preferred
                                  size.
                              </p>

                              {/* Sizes */}

                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  {normalizedVariants.map(
                                      (variant) => {
                                          const isSelected =
                                              normalizeSize(
                                                  variant.size,
                                              ) ===
                                              normalizeSize(
                                                  selectedSize,
                                              );

                                          const isOutOfStock =
                                              variant.stock <=
                                              0;

                                          return (
                                              <button
                                                  key={
                                                      variant.size
                                                  }
                                                  type="button"
                                                  disabled={
                                                      isOutOfStock
                                                  }
                                                  onClick={() =>
                                                      setSelectedSize(
                                                          variant.size,
                                                      )
                                                  }
                                                  aria-pressed={
                                                      isSelected
                                                  }
                                                  className={cn(
                                                      'flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 transition active:scale-[0.98]',
                                                      isSelected
                                                          ? 'border-orange-500 bg-orange-500 text-white'
                                                          : isOutOfStock
                                                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                                            : 'border-orange-100 bg-white text-chocolate hover:border-orange-300 hover:bg-orange-50',
                                                  )}
                                              >
                                                  <span className="text-sm font-bold">
                                                      {
                                                          variant.size
                                                      }
                                                  </span>

                                                  <span
                                                      className={cn(
                                                          'mt-0.5 text-[10px]',
                                                          isSelected
                                                              ? 'text-white/80'
                                                              : isOutOfStock
                                                                ? 'text-slate-400'
                                                                : variant.stock <=
                                                                    9
                                                                  ? 'text-orange-600'
                                                                  : 'text-emerald-600',
                                                      )}
                                                  >
                                                      {isOutOfStock
                                                          ? 'Out of stock'
                                                          : variant.stock <=
                                                              9
                                                            ? `${variant.stock} left`
                                                            : 'In stock'}
                                                  </span>
                                              </button>
                                          );
                                      },
                                  )}
                              </div>

                              {/* Selected information */}

                              {selectedVariant ? (
                                  <div className="mt-4 rounded-xl bg-[#fff8f2] px-4 py-3.5">
                                      <div className="flex items-center justify-between gap-4">
                                          <div>
                                              <p className="text-[11px] text-chocolate-soft">
                                                  Selected
                                              </p>

                                              <p className="mt-0.5 text-sm font-bold text-chocolate">
                                                  {
                                                      selectedVariant.size
                                                  }
                                              </p>
                                          </div>

                                          <div className="text-right">
                                              <p
                                                  className={cn(
                                                      'text-xs font-bold',
                                                      selectedVariant.stock <=
                                                          0
                                                          ? 'text-red-500'
                                                          : selectedVariant.stock <=
                                                              9
                                                            ? 'text-orange-600'
                                                            : 'text-emerald-600',
                                                  )}
                                              >
                                                  {selectedVariant.stock <=
                                                  0
                                                      ? 'Out of stock'
                                                      : `${selectedVariant.stock} available`}
                                              </p>

                                              {selectedCartItemQuantity >
                                                  0 && (
                                                  <p className="mt-0.5 text-[10px] text-chocolate-soft">
                                                      {
                                                          selectedCartItemQuantity
                                                      }{' '}
                                                      already
                                                      in cart
                                                  </p>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ) : null}

                              {/* Confirm */}

                              <button
                                  type="button"
                                  onClick={
                                      handleConfirmSelection
                                  }
                                  disabled={
                                      !selectedVariant ||
                                      selectedVariant.stock <=
                                          0
                                  }
                                  className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                              >
                                  {pendingAction ===
                                  'buy' ? (
                                      <>
                                          <Zap
                                              className="h-4 w-4"
                                              fill="currentColor"
                                              strokeWidth={
                                                  1.6
                                              }
                                          />
                                          Buy Now
                                      </>
                                  ) : (
                                      <>
                                          <ShoppingBag
                                              className="h-4 w-4"
                                              strokeWidth={
                                                  1.75
                                              }
                                          />
                                          Add to Cart
                                      </>
                                  )}
                              </button>

                              <button
                                  type="button"
                                  onClick={
                                      closeSizePicker
                                  }
                                  className="mt-2 h-10 w-full cursor-pointer rounded-xl text-xs font-semibold text-chocolate-soft transition hover:bg-slate-50 hover:text-chocolate"
                              >
                                  Cancel
                              </button>
                          </div>
                      </div>
                  </div>,
                  document.body,
              )
            : null;

    /* ================================================================
       Render
    ================================================================= */

    return (
        <>
            <div
                className={cn(
                    'flex w-full gap-2',
                    isStack
                        ? 'flex-col'
                        : 'flex-col sm:flex-row',
                )}
            >
                {/* Add to Cart */}

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!hasAnyStock}
                    className={buttonVariants({
                        variant: 'secondary',
                        size: isStack
                            ? 'lg'
                            : 'sm',
                        className:
                            'w-full cursor-pointer gap-1 border-orange-200 bg-white shadow-2xl shadow-gray-50 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50',
                    })}
                >
                    <ShoppingBag
                        className="h-4 w-4 shrink-0"
                        strokeWidth={1.75}
                    />

                    {hasAnyStock
                        ? 'Add to Cart'
                        : 'Out of Stock'}
                </button>

                {/* Buy Now */}

                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!hasAnyStock}
                    className={buttonVariants({
                        size: isStack
                            ? 'lg'
                            : 'sm',
                        className:
                            'w-full cursor-pointer gap-1.5 bg-orange-500 shadow-lg shadow-orange-100 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none',
                    })}
                >
                    <Zap
                        className="h-4 w-4 shrink-0"
                        fill="currentColor"
                        strokeWidth={1.6}
                    />

                    Buy Now
                </button>
            </div>

            {sizePickerModal}
        </>
    );
}