import {
    Schema,
    model,
    models,
    type Model,
    type InferSchemaType,
} from 'mongoose';

import {
    DEFAULT_CURRENCY,
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
} from '@/lib/constants';

/* ------------------------------------------------------------------ */
/* Order item snapshot                                                */
/* ------------------------------------------------------------------ */

/*
 * Snapshot of the product at the time of purchase.
 *
 * Editing a product later must NOT change old orders.
 *
 * Example:
 * {
 *   productId,
 *   productName,
 *   productImage,
 *   size: "M",
 *   quantity: 2,
 *   unitPrice: 29.99,
 *   totalPrice: 59.98
 * }
 */
const orderItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        productImage: {
            type: String,
            default: '',
            trim: true,
        },

        /*
         * Size is stored as part of the order snapshot.
         *
         * Product variants can later change or even be deleted,
         * but the old order must still remember which size was purchased.
         */
        size: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        /*
         * Price after product discount.
         * This is the price actually used for the order.
         */
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    },
);

/* ------------------------------------------------------------------ */
/* Order schema                                                       */
/* ------------------------------------------------------------------ */

const orderSchema = new Schema(
    {
        /*
         * Example:
         * CND-10024
         */
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        /* ---------------------------------------------------------- */
        /* Customer                                                    */
        /* ---------------------------------------------------------- */

        customer: {
            name: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },

            phone: {
                type: String,
                required: true,
                trim: true,
            },
        },

        /* ---------------------------------------------------------- */
        /* Shipping address                                            */
        /* ---------------------------------------------------------- */

        shippingAddress: {
            address: {
                type: String,
                required: true,
                trim: true,
            },

            city: {
                type: String,
                required: true,
                trim: true,
            },

            state: {
                type: String,
                required: true,
                trim: true,
            },

            postalCode: {
                type: String,
                required: true,
                trim: true,
            },

            country: {
                type: String,
                default: 'United States',
                trim: true,
            },
        },

        /* ---------------------------------------------------------- */
        /* Items                                                        */
        /* ---------------------------------------------------------- */

        items: {
            type: [orderItemSchema],

            validate: {
                validator: (items: unknown[]) =>
                    items.length > 0,

                message:
                    'Order must contain at least one item',
            },
        },

        /* ---------------------------------------------------------- */
        /* Pricing                                                      */
        /* ---------------------------------------------------------- */

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        /*
         * Total product discount.
         * Useful for reporting and analytics.
         */
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        shippingCost: {
            type: Number,
            default: 0,
            min: 0,
        },

        /*
         * subtotal + shippingCost
         */
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: DEFAULT_CURRENCY,
            uppercase: true,
            trim: true,
        },

        /* ---------------------------------------------------------- */
        /* Order status                                                 */
        /* ---------------------------------------------------------- */

        orderStatus: {
            type: String,
            enum: ORDER_STATUSES,
            default: 'pending',
        },

        /* ---------------------------------------------------------- */
        /* Payment                                                      */
        /* ---------------------------------------------------------- */

        /*
         * PayPal-ready.
         * This can later be updated after server-side payment
         * verification.
         */
        paymentStatus: {
            type: String,
            enum: PAYMENT_STATUSES,
            default: 'pending',
        },

        paymentMethod: {
            type: String,
            enum: PAYMENT_METHODS,
            default: 'cod',
        },

        /*
         * Hash of the confirmation token used by the
         * public order-confirmation page.
         */
        confirmationTokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        /*
         * PayPal transaction ID or another gateway transaction ID.
         *
         * Filled later after server-side payment verification.
         */
        transactionId: {
            type: String,
            default: null,
            trim: true,
        },
    },

    {
        timestamps: true,
    },
);

/* ------------------------------------------------------------------ */
/* Indexes                                                            */
/* ------------------------------------------------------------------ */

orderSchema.index({
    createdAt: -1,
});

orderSchema.index({
    orderStatus: 1,
    createdAt: -1,
});

orderSchema.index({
    paymentStatus: 1,
    createdAt: -1,
});

orderSchema.index({
    'customer.phone': 1,
});

orderSchema.index({
    'customer.name': 1,
});

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type OrderDB = InferSchemaType<
    typeof orderSchema
>;

/* ------------------------------------------------------------------ */
/* Model                                                              */
/* ------------------------------------------------------------------ */

export const Order =
    (models.Order as Model<OrderDB>) ||
    model<OrderDB>('Order', orderSchema);