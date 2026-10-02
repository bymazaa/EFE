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
    Check,
    ShoppingBag,
    X,
    Zap,
} from 'lucide-react';

import { useCartStore } from '@/store/cart.store';

import {
    MAX_ITEM_QUANTITY,
} from '@/lib/validation/cart.schema';

import { cn } from '@/lib/utils';

import {
    buttonVariants,
} from '@/app/components/ui/Button';

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

function normalizeSize(size: string) {
    return size.trim().toLowerCase();
}

/* ------------------------------------------------------------------
   Component
------------------------------------------------------------------ */

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

    const [
        isSizePickerOpen,
        setIsSizePickerOpen,
    ] = useState(false);

    const [
        selectedSize,
        setSelectedSize,
    ] = useState('');

    const [
        pendingAction,
        setPendingAction,
    ] = useState<PendingAction>(null);

    /* ================================================================
       Portal mount
    ================================================================ */

    useEffect(() => {
        setIsMounted(true);
    }, []);

    /* ================================================================
       Cart
    ================================================================ */

    const cartItems = useCartStore(
        (state) => state.items,
    );

    const addItem = useCartStore(
        (state) => state.addItem,
    );

    /* ================================================================
       Variants
    ================================================================ */

    const normalizedVariants = useMemo(() => {
        return variants
            .map((variant) => ({
                size: variant.size.trim(),
                stock: Math.max(
                    0,
                    variant.stock,
                ),
            }))
            .filter(
                (variant) => variant.size,
            );
    }, [variants]);

    const availableVariants = useMemo(
        () =>
            normalizedVariants.filter(
                (variant) =>
                    variant.stock > 0,
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
    ================================================================ */

    const selectedVariant =
        normalizedVariants.find(
            (variant) =>
                normalizeSize(
                    variant.size,
                ) ===
                normalizeSize(
                    selectedSize,
                ),
        ) ?? null;

    /* ================================================================
       Current selected cart quantity
    ================================================================ */

    const selectedCartItemQuantity =
        selectedSize
            ? (cartItems.find(
                  (item) =>
                      item.productId ===
                          productId &&
                      normalizeSize(
                          item.size,
                      ) ===
                          normalizeSize(
                              selectedSize,
                          ),
              )?.quantity ?? 0)
            : 0;

    /* ================================================================
       Close modal
    ================================================================ */

    const closeSizePicker = () => {
        setIsSizePickerOpen(false);
        setPendingAction(null);
    };

    /* ================================================================
       Perform action
    ================================================================ */

    const handleAction = (
        action: Exclude<
            PendingAction,
            null
        >,
        size: string,
    ) => {
        const variant =
            normalizedVariants.find(
                (item) =>
                    normalizeSize(
                        item.size,
                    ) ===
                    normalizeSize(size),
            );

        if (!variant) {
            toast.error(
                'Please select a valid size.',
            );
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

        if (
            safeQuantity >
            MAX_ITEM_QUANTITY
        ) {
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
                    normalizeSize(
                        item.size,
                    ) ===
                        normalizeSize(
                            variant.size,
                        ),
            )?.quantity ?? 0;

        const maximumQuantity =
            Math.min(
                variant.stock,
                MAX_ITEM_QUANTITY,
            );

        /* ------------------------------------------------------------
           Add to cart
        ------------------------------------------------------------ */

        if (action === 'cart') {
            const nextQuantity =
                existingQuantity +
                safeQuantity;

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
           Buy now
        ------------------------------------------------------------ */

        if (existingQuantity === 0) {
            if (
                safeQuantity >
                maximumQuantity
            ) {
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
    ================================================================ */

    const openSizePicker = (
        action: Exclude<
            PendingAction,
            null
        >,
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

        /* One size */

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

        /* Multiple sizes */

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
       Confirm
    ================================================================ */

    const handleConfirmSelection = () => {
        if (!pendingAction) {
            return;
        }

        if (!selectedSize) {
            toast.error(
                'Please select a size.',
            );
            return;
        }

        handleAction(
            pendingAction,
            selectedSize,
        );
    };

    /* ================================================================
       Button handlers
    ================================================================ */

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
       Body scroll lock + Escape
    ================================================================ */

    useEffect(() => {
        if (!isSizePickerOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

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
    ================================================================ */

    const sizePickerModal =
        isSizePickerOpen && isMounted
            ? createPortal(
                  <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[3px] sm:p-6"
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
                          className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_24px_70px_-25px_rgba(59,36,25,0.35)]"
                          onMouseDown={(event) =>
                              event.stopPropagation()
                          }
                      >
                          {/* ==================================================
                              Header
                          ================================================== */}

                          <div className="border-b border-orange-100 px-5 py-5 sm:px-6">
                              <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                                          Select size
                                      </p>

                                      <h2
                                          id="product-size-picker-title"
                                          className="mt-2 line-clamp-2 font-serif text-[25px] leading-tight tracking-[-0.01em] text-[#3b2419]"
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
                                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-orange-100 text-slate-500 transition hover:bg-orange-50 hover:text-[#3b2419]"
                                  >
                                      <X className="h-4 w-4" />
                                  </button>
                              </div>
                          </div>

                          {/* ==================================================
                              Body
                          ================================================== */}

                          <div className="px-5 py-5 sm:px-6">
                              <div className="flex items-center justify-between gap-3">
                                  <div>
                                      <p className="text-sm font-semibold text-[#3b2419]">
                                          Choose your size
                                      </p>

                                      <p className="mt-0.5 text-[11px] text-gray-400">
                                          Select one option to continue
                                      </p>
                                  </div>
                              </div>

                              {/* Size buttons */}

                              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

                                          const isLowStock =
                                              !isOutOfStock &&
                                              variant.stock <=
                                                  9;

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
                                                      'relative flex min-h-[66px] cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2.5 transition-all',
                                                      isSelected
                                                          ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-100'
                                                          : isOutOfStock
                                                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
                                                            : 'border-orange-100 bg-white text-[#3b2419] hover:border-orange-300 hover:bg-[#fffaf6]',
                                                  )}
                                              >
                                                  {isSelected ? (
                                                      <span className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/20">
                                                          <Check className="h-2.5 w-2.5" />
                                                      </span>
                                                  ) : null}

                                                  <span
                                                      className={cn(
                                                          'text-sm font-bold',
                                                          isSelected
                                                              ? 'text-white'
                                                              : isOutOfStock
                                                                ? 'text-gray-300'
                                                                : 'text-[#3b2419]',
                                                      )}
                                                  >
                                                      {
                                                          variant.size
                                                      }
                                                  </span>

                                                  <span
                                                      className={cn(
                                                          'mt-1 text-[10px]',
                                                          isSelected
                                                              ? 'text-white/80'
                                                              : isOutOfStock
                                                                ? 'text-gray-400'
                                                                : isLowStock
                                                                  ? 'text-orange-600'
                                                                  : 'text-emerald-600',
                                                      )}
                                                  >
                                                      {isOutOfStock
                                                          ? 'Out of stock'
                                                          : isLowStock
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
                                  <div className="mt-4 flex items-center justify-between gap-4 border-y border-orange-100 py-3.5">
                                      <div>
                                          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
                                              Selected
                                          </p>

                                          <p className="mt-0.5 text-sm font-semibold text-[#3b2419]">
                                              {
                                                  selectedVariant.size
                                              }
                                          </p>
                                      </div>

                                      <div className="text-right">
                                          <p
                                              className={cn(
                                                  'text-xs font-semibold',
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
                                          0 ? (
                                              <p className="mt-0.5 text-[10px] text-gray-400">
                                                  {
                                                      selectedCartItemQuantity
                                                  }{' '}
                                                  already
                                                  in cart
                                              </p>
                                          ) : null}
                                      </div>
                                  </div>
                              ) : null}

                              {/* Actions */}

                              <div className="mt-4">
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
                                      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
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
                                      className="mt-2 h-10 w-full cursor-pointer rounded-xl text-xs font-semibold text-gray-500 transition hover:bg-orange-50 hover:text-[#3b2419]"
                                  >
                                      Cancel
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>,
                  document.body,
              )
            : null;

    /* ================================================================
       Render
    ================================================================ */

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