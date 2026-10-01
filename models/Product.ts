import { Schema, model, models, Model, InferSchemaType } from 'mongoose';

import { DEFAULT_CURRENCY } from '@/lib/constants';

const productVariantSchema = new Schema(
    {
        size: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        _id: false,
    },
);

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // *Original price before discount (optional). If set and > price, UI shows "Save %".*
        compareAtPrice: {
            type: Number,
            default: null,
            min: 0,
        },

        currency: {
            type: String,
            default: DEFAULT_CURRENCY,
            uppercase: true,
        },

        images: {
            type: [String],
            default: [],
        },

        // *Per-size inventory.*
        variants: {
            type: [productVariantSchema],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // *Soft delete: keeps historical orders intact.*
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

productSchema.index({
    isActive: 1,
    deletedAt: 1,
    createdAt: -1,
});

productSchema.index({
    name: 1,
});

export type ProductDB = InferSchemaType<typeof productSchema>;

export const Product =
    (models.Product as Model<ProductDB>) ||
    model<ProductDB>('Product', productSchema);