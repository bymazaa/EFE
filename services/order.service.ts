import { startSession, Types } from 'mongoose';

import { connectDB } from '@/lib/mongodb';

import { Order, type OrderDB } from '@/models/Order';

import { Product } from '@/models/Product';

import { generateOrderNumber } from '@/lib/order-number';

import { getManyByIds } from '@/services/product.service';

import { getSettings } from '@/services/settings.service';

import { cartItemsSchema, type CartItemInput } from '@/lib/validation/cart.schema';

import {
    placeOrderSchema,
    updateOrderStatusSchema,
    orderListQuerySchema,
    orderNumberSchema,
} from '@/lib/validation/order.schema';

import { objectIdSchema } from '@/lib/validation/common.schema';

import { escapeRegex, fromCents, getPagination, getTotalPages, toCents } from '@/lib/utils';

import { ok, fail, validationFail, handleError, type ActionResult } from '@/lib/action-result';

import {
    DEFAULT_CURRENCY,
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    type OrderStatus,
} from '@/lib/constants';

import { generateConfirmationToken, hashConfirmationToken } from '@/lib/token';
import { sendOrderDeliveredEmail, sendOrderPlacedEmail } from '@/lib/mail';

const ADMIN_PAGE_SIZE = 10;

const ADMIN_ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;

const ADMIN_PAYMENT_STATUSES = PAYMENT_STATUSES;

type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

type AdminPaymentStatus = (typeof ADMIN_PAYMENT_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* DTOs                                                               */
/* ------------------------------------------------------------------ */

export interface OrderDTO {
    id: string;

    orderNumber: string;

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

    items: {
        productId: string;
        productName: string;
        productImage: string;
        size: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];

    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;

    orderStatus: OrderStatus;

    paymentStatus: (typeof PAYMENT_STATUSES)[number];

    paymentMethod: (typeof PAYMENT_METHODS)[number];

    /**
     * Payment provider order ID.
     *
     * For the current PayPal-based checkout,
     * this is the PayPal order ID.
     */
    providerOrderId: string | null;

    /**
     * Payment provider capture ID.
     *
     * For the current PayPal-based checkout,
     * this is the PayPal capture ID.
     */
    providerCaptureId: string | null;

    createdAt: Date;
    updatedAt: Date;
}

type LeanOrder = OrderDB & {
    _id: Types.ObjectId;
};

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}

interface ShippingAddressInfo {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

/**
 * Payment must be verified before placeOrder()
 * is called.
 *
 * The payment verification logic itself belongs
 * to the payment service/API layer.
 */
export interface VerifiedPayment {
    providerOrderId: string;
    providerCaptureId: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Normalizes size only for comparison.
 *
 * Example:
 * M       -> m
 *  M      -> m
 * Medium  -> medium
 *
 * The original database size label is still preserved
 * for order snapshots.
 */
function normalizeSize(size: string): string {
    return size.trim().toLowerCase();
}

/**
 * Finds a product variant using a case-insensitive
 * size comparison.
 */
function findVariant(product: LeanProduct, size: string) {
    const normalizedSize = normalizeSize(size);

    return (
        product.variants?.find((variant) => normalizeSize(variant.size) === normalizedSize) ?? null
    );
}

/* ------------------------------------------------------------------ */
/* Product lean type                                                  */
/* ------------------------------------------------------------------ */

type LeanProduct = import('@/models/Product').ProductDB & {
    _id: Types.ObjectId;
};

/* ------------------------------------------------------------------ */
/* Order DTO mapper                                                   */
/* ------------------------------------------------------------------ */

function toOrderDTO(doc: LeanOrder): OrderDTO {
    return {
        id: doc._id.toString(),

        orderNumber: doc.orderNumber,

        customer: doc.customer as CustomerInfo,

        shippingAddress: doc.shippingAddress as ShippingAddressInfo,

        items: doc.items.map((item) => ({
            productId: item.productId.toString(),

            productName: item.productName,

            productImage: item.productImage ?? '',

            /**
             * Old orders created before the
             * size feature may not have a size.
             */
            size: item.size ?? '',

            quantity: item.quantity,

            unitPrice: item.unitPrice,

            totalPrice: item.totalPrice,
        })),

        subtotal: doc.subtotal,

        discountAmount: doc.discountAmount ?? 0,

        shippingCost: doc.shippingCost ?? 0,

        totalAmount: doc.totalAmount,

        currency: doc.currency,

        orderStatus: doc.orderStatus as OrderStatus,

        paymentStatus: doc.paymentStatus as (typeof PAYMENT_STATUSES)[number],

        paymentMethod: doc.paymentMethod as (typeof PAYMENT_METHODS)[number],

        providerOrderId: doc.providerOrderId ?? null,

        providerCaptureId: doc.providerCaptureId ?? null,

        createdAt: doc.createdAt as Date,

        updatedAt: doc.updatedAt as Date,
    };
}

/* ------------------------------------------------------------------ */
/* Cart validation                                                    */
/* ------------------------------------------------------------------ */

/**
 * Customer-facing cart validation DTO.
 */
export interface CartValidationItemDTO {
    productId: string;

    name: string;

    slug: string;

    image: string;

    size: string;

    price: number;

    compareAtPrice: number | null;

    quantity: number;

    lineTotal: number;

    /**
     * True only when the selected product + size
     * can currently be purchased.
     */
    isActive: boolean;

    /**
     * Current stock for the selected size.
     */
    availableStock: number;

    /**
     * Human-readable availability information.
     */
    availabilityMessage: string | null;
}

export interface CartValidationDTO {
    items: CartValidationItemDTO[];

    subtotal: number;

    /**
     * Product IDs that no longer exist.
     *
     * Client should remove all cart lines
     * for these products.
     */
    removedProductIds: string[];
}

/**
 * Re-checks the client's cart against the database.
 *
 * Checks:
 * - product existence
 * - active state
 * - selected size
 * - current stock
 * - current price
 * - current discount
 *
 * Client-supplied price is never trusted.
 *
 * Does NOT create an order.
 */
export async function validateCart(items: unknown): Promise<ActionResult<CartValidationDTO>> {
    const parsed = cartItemsSchema.safeParse(items);

    if (!parsed.success) {
        return validationFail(parsed.error);
    }

    try {
        const products = await getManyByIds(parsed.data.map((item) => item.productId));

        const productMap = new Map(products.map((product) => [product._id.toString(), product]));

        const validatedItems: CartValidationItemDTO[] = [];

        const removedProductIds: string[] = [];

        let subtotalCents = 0;

        for (const item of parsed.data) {
            const product = productMap.get(item.productId);

            /**
             * Product no longer exists.
             */
            if (!product) {
                removedProductIds.push(item.productId);

                continue;
            }

            const variant = findVariant(product, item.size);

            const currentSize = variant?.size ?? item.size.trim();

            const availableStock = variant?.stock ?? 0;

            let availabilityMessage: string | null = null;

            let lineAvailable =
                product.isActive && Boolean(variant) && availableStock >= item.quantity;

            /**
             * Product inactive.
             */
            if (!product.isActive) {
                availabilityMessage = 'This product is currently unavailable.';
            } else if (!variant) {
                /**
                 * Size no longer exists.
                 */
                availabilityMessage = `Size ${currentSize} is no longer available.`;

                lineAvailable = false;
            } else if (availableStock < item.quantity) {
                /**
                 * Selected size exists but does not
                 * have enough stock.
                 */
                availabilityMessage =
                    availableStock === 0
                        ? `Size ${currentSize} is currently out of stock.`
                        : `Only ${availableStock} unit${
                              availableStock === 1 ? '' : 's'
                          } available in size ${currentSize}.`;

                lineAvailable = false;
            }

            const lineTotalCents = toCents(product.price) * item.quantity;

            /**
             * Only currently purchasable lines
             * contribute to cart subtotal.
             */
            if (lineAvailable) {
                subtotalCents += lineTotalCents;
            }

            validatedItems.push({
                productId: item.productId,

                name: product.name,

                slug: product.slug,

                image: product.images?.[0] ?? '',

                size: currentSize,

                price: product.price,

                compareAtPrice: product.compareAtPrice ?? null,

                quantity: item.quantity,

                lineTotal: fromCents(lineTotalCents),

                isActive: lineAvailable,

                availableStock,

                availabilityMessage,
            });
        }

        return ok(undefined, {
            items: validatedItems,

            subtotal: fromCents(subtotalCents),

            removedProductIds,
        });
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Order totals                                                       */
/* ------------------------------------------------------------------ */

/**
 * Represents a fully recalculated order item.
 */
interface OrderItemCalculated {
    productId: string;
    productName: string;
    productImage: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

type TotalsResult =
    | {
          success: true;

          items: OrderItemCalculated[];

          subtotalCents: number;

          discountCents: number;
      }
    | {
          success: false;

          error: string;
      };

/**
 * Recalculates order totals purely from the database.
 *
 * Checks:
 * - product exists
 * - product active
 * - selected size exists
 * - selected size has enough stock
 *
 * Client-supplied prices are never used.
 *
 * Optional session allows this calculation
 * to participate in the order transaction.
 */
async function calculateOrderTotals(
    cartItems: CartItemInput[],
    session?: import('mongoose').ClientSession,
): Promise<TotalsResult> {
    const productIds = cartItems.map((item) => item.productId);

    let productQuery = Product.find({
        _id: {
            $in: productIds,
        },

        deletedAt: null,
    });

    if (session) {
        productQuery = productQuery.session(session);
    }

    const products = await productQuery.lean<LeanProduct[]>();

    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const unavailable: string[] = [];

    const items: OrderItemCalculated[] = [];

    let subtotalCents = 0;

    let discountCents = 0;

    for (const item of cartItems) {
        const product = productMap.get(item.productId);

        /**
         * Product deleted/missing.
         */
        if (!product) {
            unavailable.push('An item in your cart');

            continue;
        }

        /**
         * Product inactive.
         */
        if (!product.isActive) {
            unavailable.push(`${product.name} (${item.size})`);

            continue;
        }

        const variant = findVariant(product, item.size);

        /**
         * Selected size no longer exists.
         */
        if (!variant) {
            unavailable.push(`${product.name} (${item.size})`);

            continue;
        }

        /**
         * Not enough stock.
         */
        if (variant.stock < item.quantity) {
            unavailable.push(
                variant.stock === 0
                    ? `${product.name} (${variant.size}) is out of stock`
                    : `${product.name} (${variant.size}) only has ${variant.stock} available`,
            );

            continue;
        }

        const unitPriceCents = toCents(product.price);

        const lineTotalCents = unitPriceCents * item.quantity;

        subtotalCents += lineTotalCents;

        /**
         * Discount snapshot.
         */
        if (product.compareAtPrice && product.compareAtPrice > product.price) {
            discountCents += (toCents(product.compareAtPrice) - unitPriceCents) * item.quantity;
        }

        items.push({
            productId: item.productId,

            productName: product.name,

            productImage: product.images?.[0] ?? '',

            /**
             * Save the actual variant label
             * from the database.
             */
            size: variant.size,

            quantity: item.quantity,

            unitPrice: fromCents(unitPriceCents),

            totalPrice: fromCents(lineTotalCents),
        });
    }

    if (unavailable.length > 0) {
        return {
            success: false,

            error: `${unavailable.join(', ')} ${
                unavailable.length > 1 ? 'are' : 'is'
            } no longer available. Please update your cart.`,
        };
    }

    return {
        success: true,

        items,

        subtotalCents,

        discountCents,
    };
}

/* ------------------------------------------------------------------ */
/* Place order                                                        */
/* ------------------------------------------------------------------ */

class OrderValidationError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'OrderValidationError';
    }
}

class StockConflictError extends Error {
    constructor() {
        super('Stock changed while placing your order. Please review your cart and try again.');

        this.name = 'StockConflictError';
    }
}

/**
 * Creates a paid order after payment has already
 * been verified server-side.
 *
 * Important:
 *
 * 1. Cart is revalidated from database.
 * 2. Prices are recalculated from database.
 * 3. Every selected size is checked.
 * 4. Stock is decremented atomically.
 * 5. Order creation + stock decrement happen
 *    inside one MongoDB transaction.
 *
 * Payment creation/capture/verification does NOT
 * happen inside this MongoDB transaction.
 *
 * Order confirmation email is sent only after
 * the MongoDB transaction has successfully committed.
 */
export async function placeOrder(
    data: unknown,
    payment: VerifiedPayment,
): Promise<
    ActionResult<{
        orderNumber: string;
        confirmationToken: string;
    }>
> {
    const parsed = placeOrderSchema.safeParse(data);

    if (!parsed.success) {
        return validationFail(parsed.error);
    }

    /**
     * Payment IDs must exist because this
     * function is only called after successful
     * payment verification.
     */
    if (!payment || !payment.providerOrderId?.trim() || !payment.providerCaptureId?.trim()) {
        return fail('Payment verification information is missing.');
    }

    try {
        /**
         * Load settings before starting the transaction.
         */
        const settings = await getSettings();

        const shippingCostCents = toCents(settings.shippingCost);

        /**
         * The order-status link is generated from
         * the production site URL.
         */
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

        if (!baseUrl) {
            throw new Error('NEXT_PUBLIC_SITE_URL is not configured.');
        }

        await connectDB();

        const session = await startSession();

        let orderNumber = '';
        let confirmationToken = '';

        /**
         * Keep email data outside the transaction.
         *
         * The email must only be sent after the
         * MongoDB transaction has committed.
         */
        let orderEmailData: Parameters<typeof sendOrderPlacedEmail>[0] | null = null;

        try {
            await session.withTransaction(async () => {
                /**
                 * Recalculate everything
                 * from the database.
                 */
                const totals = await calculateOrderTotals(parsed.data.items, session);

                if (!totals.success) {
                    throw new OrderValidationError(totals.error);
                }

                const totalCents = totals.subtotalCents + shippingCostCents;

                /**
                 * Generate order number.
                 */
                orderNumber = await generateOrderNumber();

                /**
                 * Generate public confirmation token.
                 *
                 * Only the hash is stored in MongoDB.
                 */
                const confirmation = generateConfirmationToken();

                confirmationToken = confirmation.token;

                const { hash: confirmationTokenHash } = confirmation;

                /**
                 * Decrease stock for every
                 * product + size atomically.
                 *
                 * We first resolve the actual database
                 * variant label because the cart size may
                 * differ only by casing/whitespace.
                 */
                for (const item of parsed.data.items) {
                    const variantSize = await getProductVariantSize(
                        item.productId,
                        item.size,
                        session,
                    );

                    if (!variantSize) {
                        throw new StockConflictError();
                    }

                    /**
                     * Atomic stock decrement.
                     *
                     * Both the product and exact variant
                     * must still exist, be active, and have
                     * enough stock.
                     */
                    const decrementResult = await Product.updateOne(
                        {
                            _id: item.productId,
                            deletedAt: null,
                            isActive: true,
                            variants: {
                                $elemMatch: {
                                    size: variantSize,
                                    stock: {
                                        $gte: item.quantity,
                                    },
                                },
                            },
                        },
                        {
                            $inc: {
                                'variants.$.stock': -item.quantity,
                            },
                        },
                        {
                            session,
                        },
                    );

                    if (decrementResult.modifiedCount !== 1) {
                        throw new StockConflictError();
                    }
                }

                /**
                 * Create the order only after
                 * all stock decrements succeed.
                 *
                 * Payment has already been verified,
                 * so the order is stored as paid.
                 */
                await Order.create(
                    [
                        {
                            orderNumber,
                            confirmationTokenHash,
                            customer: parsed.data.customer,
                            shippingAddress: parsed.data.shippingAddress,
                            items: totals.items,
                            subtotal: fromCents(totals.subtotalCents),
                            discountAmount: fromCents(totals.discountCents),
                            shippingCost: fromCents(shippingCostCents),
                            totalAmount: fromCents(totalCents),
                            currency: DEFAULT_CURRENCY,
                            orderStatus: 'pending',
                            paymentStatus: 'paid',
                            paymentMethod: parsed.data.paymentMethod,
                            providerOrderId: payment.providerOrderId.trim(),
                            providerCaptureId: payment.providerCaptureId.trim(),
                        },
                    ],
                    {
                        session,
                    },
                );

                /**
                 * Generate the public order-status URL.
                 */
                const orderStatusUrl = new URL('/order-status', baseUrl);

                orderStatusUrl.searchParams.set('orderId', orderNumber);
                orderStatusUrl.searchParams.set(
                    'email',
                    parsed.data.customer.email.trim().toLowerCase(),
                );

                /**
                 * Convert the shipping address to a
                 * readable string for the email.
                 */
                const shippingAddress = Object.values(parsed.data.shippingAddress)
                    .filter(Boolean)
                    .map(String)
                    .join(', ');

                /**
                 * Prepare order + payment email data.
                 *
                 * Product names/items are intentionally
                 * not included in this email.
                 */
                orderEmailData = {
                    email: parsed.data.customer.email,

                    customerName: parsed.data.customer.name,

                    orderNumber,

                    totalAmount: fromCents(totalCents),

                    currency: DEFAULT_CURRENCY,

                    paymentMethod: parsed.data.paymentMethod,

                    providerOrderId: payment.providerOrderId.trim(),

                    providerCaptureId: payment.providerCaptureId.trim(),

                    shippingAddress,

                    orderStatusUrl: orderStatusUrl.toString(),
                };
            });
        } finally {
            await session.endSession();
        }

        /**
         * Send email only after the transaction
         * has successfully committed.
         *
         * Email failure must not undo the order.
         */
        if (orderEmailData) {
            try {
                await sendOrderPlacedEmail(orderEmailData);
            } catch (error) {
                console.error('Failed to send order confirmation email:', error);
            }
        }

        return ok('Order placed successfully.', {
            orderNumber,
            confirmationToken,
        });
    } catch (error) {
        if (error instanceof OrderValidationError) {
            return fail(error.message);
        }

        if (error instanceof StockConflictError) {
            return fail(error.message);
        }

        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Helper for transaction stock lookup                                */
/* ------------------------------------------------------------------ */

/**
 * Returns the exact database size label for a product.
 *
 * Example:
 *
 * cart sends " medium "
 * database has "Medium"
 *
 * returns "Medium"
 */
async function getProductVariantSize(
    productId: string,
    size: string,
    session: import('mongoose').ClientSession,
): Promise<string | null> {
    const product = await Product.findOne({
        _id: productId,

        deletedAt: null,

        variants: {
            $elemMatch: {
                size: {
                    $regex: `^${escapeRegex(size.trim())}$`,

                    $options: 'i',
                },
            },
        },
    })
        .session(session)
        .select('variants')
        .lean<LeanProduct | null>();

    if (!product) {
        return null;
    }

    const variant = findVariant(product, size);

    return variant?.size ?? null;
}

/* ------------------------------------------------------------------ */
/* Public read                                                        */
/* ------------------------------------------------------------------ */

/**
 * /order-confirmation/[orderNumber]
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderDTO | null> {
    const parsed = orderNumberSchema.safeParse(orderNumber);

    if (!parsed.success) {
        return null;
    }

    await connectDB();

    const order = await Order.findOne({
        orderNumber: parsed.data,
    }).lean<LeanOrder | null>();

    return order ? toOrderDTO(order) : null;
}

/* ------------------------------------------------------------------ */
/* Admin reads                                                        */
/* ------------------------------------------------------------------ */

export interface OrderSummary {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
}

export interface PaginatedOrders {
    orders: OrderDTO[];

    total: number;

    page: number;

    totalPages: number;

    summary: OrderSummary;
}

interface AdminOrderFilterQuery {
    search?: string;

    orderStatus?: string;

    paymentStatus?: string;

    fromDate?: string;

    toDate?: string;
}

/**
 * Builds MongoDB filter for:
 *
 * - admin order list
 * - summary
 * - CSV export
 */
function buildAdminOrderFilter(query: AdminOrderFilterQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    if (query.orderStatus) {
        filter.orderStatus = query.orderStatus;
    }

    if (query.paymentStatus) {
        filter.paymentStatus = query.paymentStatus;
    }

    if (query.search) {
        const regex = {
            $regex: escapeRegex(query.search),

            $options: 'i',
        };

        filter.$or = [
            {
                orderNumber: regex,
            },

            {
                'customer.name': regex,
            },

            {
                'customer.phone': regex,
            },
        ];
    }

    if (query.fromDate || query.toDate) {
        const createdAt: {
            $gte?: Date;
            $lte?: Date;
        } = {};

        if (query.fromDate) {
            const from = new Date(`${query.fromDate}T00:00:00.000Z`);

            if (!Number.isNaN(from.getTime())) {
                createdAt.$gte = from;
            }
        }

        if (query.toDate) {
            const to = new Date(`${query.toDate}T23:59:59.999Z`);

            if (!Number.isNaN(to.getTime())) {
                createdAt.$lte = to;
            }
        }

        if (createdAt.$gte || createdAt.$lte) {
            filter.createdAt = createdAt;
        }
    }

    return filter;
}

/**
 * /admin/orders table.
 */
export async function getAdminOrders(query: unknown): Promise<ActionResult<PaginatedOrders>> {
    const parsed = orderListQuerySchema.safeParse(query);

    if (!parsed.success) {
        return validationFail(parsed.error);
    }

    try {
        await connectDB();

        const rawQuery = (query ?? {}) as Record<string, unknown>;

        const { page, search, orderStatus, paymentStatus, sort } = parsed.data;

        const fromDate = typeof rawQuery.fromDate === 'string' ? rawQuery.fromDate : undefined;

        const toDate = typeof rawQuery.toDate === 'string' ? rawQuery.toDate : undefined;

        /**
         * Main table filter includes
         * orderStatus.
         */
        const filter = buildAdminOrderFilter({
            search,
            orderStatus,
            paymentStatus,
            fromDate,
            toDate,
        });

        /**
         * Summary deliberately ignores
         * the selected orderStatus.
         */
        const summaryFilter = buildAdminOrderFilter({
            search,
            paymentStatus,
            fromDate,
            toDate,
        });

        const sortMap: Record<typeof sort, Record<string, 1 | -1>> = {
            newest: {
                createdAt: -1,
            },

            oldest: {
                createdAt: 1,
            },

            amount_desc: {
                totalAmount: -1,
            },

            amount_asc: {
                totalAmount: 1,
            },
        };

        const { skip, limit } = getPagination(page, ADMIN_PAGE_SIZE);

        const [orders, total, summaryTotal, pending, confirmed, delivered, cancelled] =
            await Promise.all([
                Order.find(filter).sort(sortMap[sort]).skip(skip).limit(limit).lean<LeanOrder[]>(),

                Order.countDocuments(filter),

                Order.countDocuments(summaryFilter),

                Order.countDocuments({
                    ...summaryFilter,

                    orderStatus: 'pending',
                }),

                Order.countDocuments({
                    ...summaryFilter,

                    orderStatus: 'confirmed',
                }),

                Order.countDocuments({
                    ...summaryFilter,

                    orderStatus: 'delivered',
                }),

                Order.countDocuments({
                    ...summaryFilter,

                    orderStatus: 'cancelled',
                }),
            ]);

        return ok(
            undefined,

            {
                orders: orders.map(toOrderDTO),

                total,

                page,

                totalPages: getTotalPages(total, ADMIN_PAGE_SIZE),

                summary: {
                    total: summaryTotal,

                    pending,

                    confirmed,

                    delivered,

                    cancelled,
                },
            },
        );
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Admin order read                                                   */
/* ------------------------------------------------------------------ */

/**
 * /admin/orders/[id]
 */
export async function getOrderById(id: string): Promise<OrderDTO | null> {
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
        return null;
    }

    await connectDB();

    const order = await Order.findById(parsedId.data).lean<LeanOrder | null>();

    return order ? toOrderDTO(order) : null;
}

/* ------------------------------------------------------------------
 * Admin write - order status
 * ------------------------------------------------------------------ */

/**
 * Allowed order flow:
 *
 * pending   -> confirmed
 * confirmed -> delivered
 *
 * Cancellation:
 *
 * pending   -> cancelled
 * confirmed -> cancelled
 *
 * Direct pending -> delivered is not allowed.
 *
 * An order can only be marked as delivered when
 * paymentStatus is already paid.
 */

export async function updateOrderStatus(
    orderId: string,
    orderStatus: string,
): Promise<ActionResult> {
    const parsedId = objectIdSchema.safeParse(orderId);

    if (!parsedId.success) {
        return validationFail(parsedId.error);
    }

    if (!ORDER_STATUSES.includes(orderStatus as OrderStatus)) {
        return fail('Invalid order status.');
    }

    try {
        await connectDB();

        const order = await Order.findById(parsedId.data);

        if (!order) {
            return fail('Order not found.');
        }

        const currentStatus = order.orderStatus;

        /**
         * Already in this status.
         */
        if (currentStatus === orderStatus) {
            return fail(`Order is already ${currentStatus}.`);
        }

        /**
         * Allowed status transitions.
         */
        const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
            pending: ['confirmed', 'cancelled'],

            confirmed: ['delivered', 'cancelled'],

            delivered: [],

            cancelled: [],
        };

        const allowedNextStatuses = allowedTransitions[currentStatus];

        if (!allowedNextStatuses.includes(orderStatus as OrderStatus)) {
            return fail(`Order cannot be changed from ${currentStatus} to ${orderStatus}.`);
        }

        /**
         * Delivered requires paid payment.
         */
        if (orderStatus === 'delivered' && order.paymentStatus !== 'paid') {
            return fail('Order can only be marked as delivered after payment is completed.');
        }

        /**
         * Update order status.
         */
        order.orderStatus = orderStatus as OrderStatus;

        await order.save();

        /**
         * Send delivered email only when:
         *
         * confirmed -> delivered
         *
         * and payment is already paid.
         */
        if (
            currentStatus === 'confirmed' &&
            orderStatus === 'delivered' &&
            order.paymentStatus === 'paid'
        ) {
            const customerEmail =
                typeof order.customer?.email === 'string' ? order.customer.email.trim() : '';

            const customerName =
                typeof order.customer?.name === 'string' ? order.customer.name.trim() : '';

            if (!customerEmail) {
                console.warn('Order delivered but customer email is missing. Skipping email.', {
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber,
                    paymentStatus: order.paymentStatus,
                    currentStatus,
                    orderStatus,
                });
            } else {
                try {
                    await sendOrderDeliveredEmail({
                        email: customerEmail,

                        customerName: customerName || 'Customer',

                        orderNumber: order.orderNumber,
                    });
                } catch (error) {
                    console.error('Failed to send order delivered email:', error, {
                        orderId: order._id.toString(),
                        orderNumber: order.orderNumber,
                        email: customerEmail,
                    });
                }
            }
        }

        return ok('Order status updated successfully.');
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Admin write - payment status                                       */
/* ------------------------------------------------------------------ */

/**
 * Admin manually changes payment status.
 *
 * Allowed states:
 *
 * pending | paid | failed | refunded
 *
 * In the normal online-payment flow,
 * payment status should be updated from the
 * payment verification flow rather than manually.
 */
export async function updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
): Promise<ActionResult> {
    const parsedId = objectIdSchema.safeParse(orderId);

    if (!parsedId.success) {
        return validationFail(parsedId.error);
    }

    if (!ADMIN_PAYMENT_STATUSES.includes(paymentStatus as AdminPaymentStatus)) {
        return fail('Invalid payment status.');
    }

    try {
        await connectDB();

        const result = await Order.updateOne(
            {
                _id: parsedId.data,
            },

            {
                $set: {
                    paymentStatus,
                },
            },
        );

        if (result.matchedCount === 0) {
            return fail('Order not found.');
        }

        return ok('Payment status updated successfully.');
    } catch (error) {
        return handleError(error);
    }
}

/* ------------------------------------------------------------------ */
/* Confirmation token                                                 */
/* ------------------------------------------------------------------ */

export async function getOrderByConfirmationToken(token: string): Promise<OrderDTO | null> {
    if (!token || token.length !== 64) {
        return null;
    }

    const tokenHash = hashConfirmationToken(token);

    await connectDB();

    const order = await Order.findOne({
        confirmationTokenHash: tokenHash,
    }).lean<LeanOrder | null>();

    return order ? toOrderDTO(order) : null;
}

/* ------------------------------------------------------------------ */
/* Public order lookup by order number + email                        */
/* ------------------------------------------------------------------ */

/**
 * Looks up an order using:
 *
 * - public order number
 * - customer email
 *
 * Kept compatible with the existing
 * order-status flow.
 */
export async function getOrderByIdAndEmail(
    orderId: string,
    email: string,
): Promise<OrderDTO | null> {
    if (!orderId || !email) {
        return null;
    }

    const parsedOrderNumber = orderNumberSchema.safeParse(orderId);

    if (!parsedOrderNumber.success) {
        return null;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        return null;
    }

    await connectDB();

    const order = await Order.findOne({
        orderNumber: parsedOrderNumber.data,

        'customer.email': normalizedEmail,
    }).lean<LeanOrder | null>();

    return order ? toOrderDTO(order) : null;
}
