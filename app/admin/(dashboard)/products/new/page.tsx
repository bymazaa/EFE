'use client';

import {
    useMemo,
    useState,
    useTransition,
} from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import {
    productInputSchema,
    type ProductInput,
} from '@/lib/validation/product.schema';

import { createProductAction } from './action';

type VariantState = {
    size: string;
    stock: string;
};

type FormState = {
    name: string;
    description: string;
    price: string;
    compareAtPrice: string;
    currency: string;
    images: string[];
    variants: VariantState[];
    isActive: boolean;
};

const initialForm: FormState = {
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    currency: 'USD',
    images: [''],
    variants: [],
    isActive: true,
};

function createSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function ProductCreateForm() {
    const router = useRouter();

    const [isPending, startTransition] =
        useTransition();

    const [form, setForm] =
        useState<FormState>(initialForm);

    const [errors, setErrors] =
        useState<Record<string, string[]>>({});

    const generatedSlug = useMemo(
        () => createSlug(form.name),
        [form.name],
    );

    const discount = useMemo(() => {
        const price = Number(form.price);
        const originalPrice = Number(
            form.compareAtPrice,
        );

        if (
            !price ||
            !originalPrice ||
            originalPrice <= price
        ) {
            return null;
        }

        return Math.round(
            ((originalPrice - price) /
                originalPrice) *
                100,
        );
    }, [
        form.price,
        form.compareAtPrice,
    ]);

    const savings = useMemo(() => {
        const price = Number(form.price);
        const originalPrice = Number(
            form.compareAtPrice,
        );

        if (
            !price ||
            !originalPrice ||
            originalPrice <= price
        ) {
            return null;
        }

        return originalPrice - price;
    }, [
        form.price,
        form.compareAtPrice,
    ]);

    const updateField = <
        K extends keyof FormState
    >(
        field: K,
        value: FormState[K],
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const updateImage = (
        index: number,
        value: string,
    ) => {
        setForm((prev) => {
            const images = [...prev.images];

            images[index] = value;

            return {
                ...prev,
                images,
            };
        });

        setErrors((prev) => {
            const next = { ...prev };
            delete next.images;
            return next;
        });
    };

    const addImage = () => {
        if (form.images.length >= 8) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    const removeImage = (index: number) => {
        if (form.images.length === 1) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            images: prev.images.filter(
                (_, imageIndex) =>
                    imageIndex !== index,
            ),
        }));
    };

    const totalStock = useMemo(
        () =>
            form.variants.reduce((total, variant) => {
                const stock = Number(variant.stock);
                return total + (Number.isFinite(stock) && stock >= 0 ? stock : 0);
            }, 0),
        [form.variants],
    );

    const addVariant = () => {
        if (form.variants.length >= 20 || isPending) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: '', stock: '' }],
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next.variants;
            return next;
        });
    };

    const updateVariant = (
        index: number,
        field: keyof VariantState,
        value: string,
    ) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((variant, variantIndex) =>
                variantIndex === index
                    ? { ...variant, [field]: value }
                    : variant,
            ),
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next.variants;
            delete next[`variants.${index}.${field}`];
            return next;
        });
    };

    const removeVariant = (index: number) => {
        if (isPending) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            variants: prev.variants.filter(
                (_, variantIndex) => variantIndex !== index,
            ),
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next.variants;
            return next;
        });
    };

    const getFieldError = (field: string) =>
        errors[field]?.[0];

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setErrors({});

        const payload: ProductInput = {
            name: form.name,
            slug: generatedSlug,
            description: form.description,
            price: Number(form.price),
            compareAtPrice:
                form.compareAtPrice.trim() === ''
                    ? null
                    : Number(form.compareAtPrice),
            currency:
                form.currency.toUpperCase(),
            images: form.images
                .map((image) => image.trim())
                .filter(Boolean),
            variants: form.variants.map((variant) => ({
                size: variant.size.trim(),
                stock: Number(variant.stock),
            })),
            isActive: form.isActive,
        };

        const parsed =
            productInputSchema.safeParse(
                payload,
            );

        if (!parsed.success) {
            setErrors(
                parsed.error.flatten()
                    .fieldErrors,
            );

            toast.error(
                'Please fix the highlighted fields.',
            );

            return;
        }

        startTransition(async () => {
            const result =
                await createProductAction(
                    parsed.data,
                );

            if (result.success) {
                toast.success(result.message);

                router.push(
                    '/admin/products',
                );

                router.refresh();

                return;
            }

            toast.error(result.error);

            if (result.fieldErrors) {
                setErrors(
                    result.fieldErrors,
                );
            }
        });
    };

    return (
        <div className="w-full">
            <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2 inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Product Management
                        </div>

                        <h1 className="font-serif text-2xl font-bold tracking-tight text-chocolate sm:text-3xl">
                            Create Product
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-chocolate-soft">
                            Add product information, pricing
                            and images to publish a new item.
                        </p>
                    </div>

                    <div className="w-full rounded-xl border border-orange-100 bg-[#fffaf6] px-4 py-3 sm:w-fit">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-chocolate-muted">
                            Status
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                    form.isActive
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300'
                                }`}
                            />

                            <span className="text-sm font-semibold text-chocolate">
                                {form.isActive
                                    ? 'Active'
                                    : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
                    {/* Left Content */}
                    <div className="min-w-0 space-y-5">
                        {/* Basic Information */}
                        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                                    Basic Information
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-chocolate-muted sm:text-sm">
                                    Keep the product information clear
                                    and easy to understand.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Product Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-semibold text-chocolate"
                                    >
                                        Product Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateField(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Vanilla Bean Candle"
                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                                            getFieldError(
                                                'name',
                                            )
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-slate-200 focus:border-orange-400'
                                        }`}
                                    />

                                    {getFieldError(
                                        'name',
                                    ) && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {getFieldError(
                                                'name',
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <label className="block text-sm font-semibold text-chocolate">
                                            URL Slug
                                        </label>

                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                                            Auto generated
                                        </span>
                                    </div>

                                    <div className="flex min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="shrink-0 border-r border-slate-200 px-3 py-3 text-xs text-slate-400 sm:px-4 sm:text-sm">
                                            /products/
                                        </div>

                                        <div className="min-w-0 flex-1 overflow-x-auto px-3 py-3 text-sm font-medium text-slate-700 sm:px-4">
                                            {generatedSlug ||
                                                'product-slug'}
                                        </div>
                                    </div>

                                    {getFieldError(
                                        'slug',
                                    ) && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {getFieldError(
                                                'slug',
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label
                                            htmlFor="description"
                                            className="block text-sm font-semibold text-chocolate"
                                        >
                                            Description
                                        </label>

                                        <span className="shrink-0 text-[11px] text-slate-400">
                                            {
                                                form
                                                    .description
                                                    .length
                                            }
                                            /5000
                                        </span>
                                    </div>

                                    <textarea
                                        id="description"
                                        rows={6}
                                        value={
                                            form.description
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                'description',
                                                e.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Write a clear description about this product..."
                                        className={`w-full resize-y rounded-xl border bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                                            getFieldError(
                                                'description',
                                            )
                                                ? 'border-red-400 focus:border-red-500'
                                                : 'border-slate-200 focus:border-orange-400'
                                        }`}
                                    />

                                    {getFieldError(
                                        'description',
                                    ) && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {getFieldError(
                                                'description',
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Pricing */}
                        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                                    Pricing
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-chocolate-muted sm:text-sm">
                                    Set the selling price and optional
                                    original price.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Selling Price */}
                                <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 sm:p-5">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                                                Selling Price
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Current price
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-orange-600 shadow-sm">
                                            {
                                                form.currency
                                            }
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">
                                            $
                                        </span>

                                        <input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            inputMode="decimal"
                                            value={
                                                form.price
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'price',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`w-full rounded-xl border bg-white py-3.5 pl-8 pr-3 text-lg font-bold text-slate-900 outline-none ${
                                                getFieldError(
                                                    'price',
                                                )
                                                    ? 'border-red-400'
                                                    : 'border-orange-200 focus:border-orange-400'
                                            }`}
                                        />
                                    </div>

                                    {getFieldError(
                                        'price',
                                    ) && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {getFieldError(
                                                'price',
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Original Price */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Original Price
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Price before discount
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                                            Optional
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">
                                            $
                                        </span>

                                        <input
                                            id="compareAtPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            inputMode="decimal"
                                            value={
                                                form.compareAtPrice
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                updateField(
                                                    'compareAtPrice',
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`w-full rounded-xl border bg-white py-3.5 pl-8 pr-3 text-lg font-bold text-slate-900 outline-none ${
                                                getFieldError(
                                                    'compareAtPrice',
                                                )
                                                    ? 'border-red-400'
                                                    : 'border-slate-200 focus:border-orange-400'
                                            }`}
                                        />
                                    </div>

                                    {getFieldError(
                                        'compareAtPrice',
                                    ) && (
                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                            {getFieldError(
                                                'compareAtPrice',
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Discount Preview */}
                            {discount !== null &&
                                savings !== null && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                                                        {discount}% OFF
                                                    </span>

                                                    <span className="text-sm font-semibold text-emerald-700">
                                                        Special Discount
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-emerald-700">
                                                    Customers save{' '}
                                                    <span className="font-bold">
                                                        $
                                                        {savings.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 sm:block sm:text-right">
                                                <span className="text-xs text-slate-400">
                                                    Original
                                                </span>

                                                <p className="text-sm font-medium text-slate-500 line-through">
                                                    $
                                                    {Number(
                                                        form.compareAtPrice,
                                                    ).toFixed(2)}
                                                </p>

                                                <p className="text-lg font-bold text-slate-900">
                                                    $
                                                    {Number(
                                                        form.price,
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </section>

                        {/* Inventory */}
                        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                                        Inventory
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-chocolate-muted sm:text-sm">
                                        Set the available stock for each size.
                                    </p>
                                </div>

                                <div className="w-fit rounded-lg bg-slate-50 px-3 py-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        Total Stock
                                    </p>
                                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                                        {totalStock}
                                    </p>
                                </div>
                            </div>

                            {form.variants.length > 0 && (
                                <div className="space-y-3">
                                    {form.variants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                        >
                                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto] sm:items-end">
                                                <div>
                                                    <label
                                                        htmlFor={`variant-size-${index}`}
                                                        className="mb-2 block text-xs font-semibold text-slate-700"
                                                    >
                                                        Size
                                                    </label>
                                                    <input
                                                        id={`variant-size-${index}`}
                                                        type="text"
                                                        value={variant.size}
                                                        onChange={(e) =>
                                                            updateVariant(index, 'size', e.target.value)
                                                        }
                                                        disabled={isPending}
                                                        placeholder="e.g. M"
                                                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 ${
                                                            getFieldError(`variants.${index}.size`)
                                                                ? 'border-red-400'
                                                                : 'border-slate-200'
                                                        } disabled:cursor-not-allowed disabled:bg-slate-50`}
                                                    />
                                                    {getFieldError(`variants.${index}.size`) && (
                                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                                            {getFieldError(`variants.${index}.size`)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor={`variant-stock-${index}`}
                                                        className="mb-2 block text-xs font-semibold text-slate-700"
                                                    >
                                                        Stock
                                                    </label>
                                                    <input
                                                        id={`variant-stock-${index}`}
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        inputMode="numeric"
                                                        value={variant.stock}
                                                        onChange={(e) =>
                                                            updateVariant(index, 'stock', e.target.value)
                                                        }
                                                        disabled={isPending}
                                                        placeholder="0"
                                                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 ${
                                                            getFieldError(`variants.${index}.stock`)
                                                                ? 'border-red-400'
                                                                : 'border-slate-200'
                                                        } disabled:cursor-not-allowed disabled:bg-slate-50`}
                                                    />
                                                    {getFieldError(`variants.${index}.stock`) && (
                                                        <p className="mt-1.5 text-xs font-medium text-red-500">
                                                            {getFieldError(`variants.${index}.stock`)}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    disabled={isPending}
                                                    className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {getFieldError('variants') && (
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    {getFieldError('variants')}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={addVariant}
                                disabled={form.variants.length >= 20 || isPending}
                                className="mt-4 w-full cursor-pointer rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                                + Add size
                            </button>
                        </section>

                        {/* Images */}
                        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-chocolate sm:text-lg">
                                        Product Images
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-chocolate-muted sm:text-sm">
                                        Add one or more image URLs for
                                        the product.
                                    </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">
                                    {form.images.length}/8
                                </span>
                            </div>

                            <div className="space-y-3">
                                {form.images.map(
                                    (
                                        image,
                                        index,
                                    ) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-500">
                                                    {index +
                                                        1}
                                                </div>

                                                <input
                                                    type="url"
                                                    value={
                                                        image
                                                    }
                                                    onChange={(
                                                        e,
                                                    ) =>
                                                        updateImage(
                                                            index,
                                                            e.target
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="https://example.com/product-image.jpg"
                                                    className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 ${
                                                        getFieldError(
                                                            'images',
                                                        )
                                                            ? 'border-red-400'
                                                            : 'border-slate-200'
                                                    }`}
                                                />
                                            </div>

                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(
                                                            index,
                                                        )
                                                    }
                                                    disabled={
                                                        form
                                                            .images
                                                            .length ===
                                                            1 ||
                                                        isPending
                                                    }
                                                    className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {getFieldError(
                                'images',
                            ) && (
                                <p className="mt-2 text-xs font-medium text-red-500">
                                    {getFieldError(
                                        'images',
                                    )}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={addImage}
                                disabled={
                                    form.images.length >=
                                        8 ||
                                    isPending
                                }
                                className="mt-4 w-full cursor-pointer rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                                + Add another image
                            </button>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="min-w-0 space-y-5">
                        {/* Preview */}
                        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                            <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 p-4 sm:p-5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                                    Product Preview
                                </p>

                                <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                                    <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg bg-slate-100 sm:h-52">
                                        {form.images[0] ? (
                                            <img
                                                src={
                                                    form.images[0]
                                                }
                                                alt="Product preview"
                                                className="h-full w-full object-cover"
                                                onError={(
                                                    e,
                                                ) => {
                                                    e.currentTarget.style.display =
                                                        'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-orange-400 shadow-sm">
                                                    +
                                                </div>

                                                <p className="text-xs text-slate-400">
                                                    Product image
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="line-clamp-2 text-sm font-bold text-slate-900 sm:text-base">
                                            {form.name ||
                                                'Your Product Name'}
                                        </h3>

                                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                                            <span className="text-lg font-bold text-slate-900">
                                                $
                                                {form.price
                                                    ? Number(
                                                          form.price,
                                                      ).toFixed(
                                                          2,
                                                      )
                                                    : '0.00'}
                                            </span>

                                            {form.compareAtPrice && (
                                                <span className="text-xs text-slate-400 line-through">
                                                    $
                                                    {Number(
                                                        form.compareAtPrice,
                                                    ).toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            )}

                                            {discount !==
                                                null && (
                                                <span className="ml-auto rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                                    -{discount}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Publish Settings */}
                  <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
    <h2 className="text-base font-semibold text-chocolate">
        Publish Settings
    </h2>

    <p className="mt-1 text-xs leading-5 text-chocolate-muted">
        Control product visibility.
    </p>

    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
        <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
                Product visibility
            </p>

            <p className="mt-1 text-xs text-slate-500">
                {form.isActive
                    ? 'Visible to customers'
                    : 'Hidden from customers'}
            </p>
        </div>

        <button
            type="button"
            disabled={isPending}
            onClick={() =>
                updateField(
                    'isActive',
                    !form.isActive,
                )
            }
            aria-label={
                form.isActive
                    ? 'Disable product'
                    : 'Enable product'
            }
            aria-pressed={form.isActive}
            className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${
                form.isActive
                    ? 'bg-orange-500'
                    : 'bg-slate-300'
            } disabled:cursor-not-allowed disabled:opacity-60`}
        >
            <span
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.isActive
                        ? 'translate-x-6'
                        : 'translate-x-0'
                }`}
            />
        </button>
    </div>
</section>
                    </aside>
                </div>

                {/* Bottom Actions */}
                <div className="rounded-2xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                                router.push(
                                    '/admin/products',
                                )
                            }
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full cursor-pointer rounded-xl bg-orange-500 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            {isPending
                                ? 'Creating Product...'
                                : 'Create Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}