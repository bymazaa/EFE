import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
    Check,
    ChevronRight,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import { getProductBySlug } from '@/services/product.service';

import { ProductGallery } from '@/app/components/products/ProductGallery';
import { PriceTag } from '@/app/components/products/PriceTag';

import { ProductDetailsActions } from './ProductDetailsActions';

/* ------------------------------------------------------------------ */
/* Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Product not found',
        };
    }

    const description =
        product.description ||
        `${product.name} - premium streetwear piece.`;

    return {
        title: product.name,

        description,

        alternates: {
            canonical: `/products/${product.slug}`,
        },

        openGraph: {
            title: product.name,

            description,

            images: product.images[0]
                ? [
                      {
                          url: product.images[0],
                      },
                  ]
                : undefined,
        },
    };
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    /*
     * Total inventory across all sizes.
     *
     * This is informational only. Actual purchase validation
     * still happens server-side using the selected size.
     */
    const totalStock = product.variants.reduce(
        (total, variant) =>
            total + Math.max(variant.stock, 0),
        0,
    );

    const hasVariants =
        product.variants.length > 0;

    const hasStock = product.variants.some(
        (variant) => variant.stock > 0,
    );

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {/* =====================================================
                    Breadcrumb
                ===================================================== */}

                <nav
                    aria-label="Breadcrumb"
                    className="mb-6 flex items-center gap-1.5 overflow-hidden text-xs text-chocolate-soft sm:mb-8"
                >
                    <Link
                        href="/"
                        className="shrink-0 cursor-pointer transition hover:text-chocolate"
                    >
                        Home
                    </Link>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                    <Link
                        href="/products"
                        className="shrink-0 cursor-pointer transition hover:text-chocolate"
                    >
                        Products
                    </Link>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                    <span className="truncate font-medium text-chocolate">
                        {product.name}
                    </span>
                </nav>

                {/* =====================================================
                    Main Product
                ===================================================== */}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* =================================================
                        Product Gallery
                    ================================================= */}

                    <div className="min-w-0">
                        <ProductGallery
                            images={product.images}
                            productName={product.name}
                        />
                    </div>

                    {/* =================================================
                        Product Information
                    ================================================= */}

                    <div className="min-w-0 lg:pt-2">
                        {/* Small Label */}

                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                            <Sparkles className="h-3.5 w-3.5" />

                            Premium streetwear
                        </div>

                        {/* Title */}

                        <h1 className="max-w-xl font-serif text-3xl leading-tight text-chocolate sm:text-4xl lg:text-[2.6rem]">
                            {product.name}
                        </h1>

                        {/* Price */}

                        <div className="mt-4">
                            <PriceTag
                                price={product.price}
                                compareAtPrice={
                                    product.compareAtPrice
                                }
                                currency={
                                    product.currency
                                }
                                size="lg"
                            />
                        </div>

                        {/* Short Description */}

                        {product.description ? (
                            <p className="mt-5 max-w-xl line-clamp-4 whitespace-pre-line text-sm leading-7 text-chocolate-soft sm:text-[15px]">
                                {
                                    product.description
                                }
                            </p>
                        ) : null}

                        {/* =================================================
                            Stock Summary
                        ================================================= */}

                        <div className="mt-5">
                            {!hasVariants ? (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-red-600">
                                        Size information is
                                        currently unavailable.
                                    </p>
                                </div>
                            ) : !hasStock ? (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-red-600">
                                        This product is
                                        currently out of
                                        stock.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                    {totalStock} total units
                                    available
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            Product Actions
                        ================================================= */}

                        <ProductDetailsActions
                            productId={product.id}
                            productName={product.name}
                            variants={
                                product.variants
                            }
                        />

                        {/* =================================================
                            Product Benefits
                        ================================================= */}

                        <div className="mt-7 grid max-w-lg grid-cols-1 gap-3 border-y border-orange-100 py-5 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 shrink-0 text-orange-500" />

                                <span className="text-xs font-medium text-chocolate-soft">
                                    Quality made
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-orange-500" />

                                <span className="text-xs font-medium text-chocolate-soft">
                                    Secure checkout
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 shrink-0 text-orange-500" />

                                <span className="text-xs font-medium text-chocolate-soft">
                                    Premium fabric
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    Full Description
                ===================================================== */}

                {product.description ? (
                    <section className="mt-12 border-t border-orange-100 pt-10 sm:mt-16 sm:pt-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                Product Details
                            </p>

                            <h2 className="mt-2 font-serif text-2xl text-chocolate sm:text-3xl">
                                About this piece
                            </h2>

                            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-chocolate-soft sm:text-[15px] sm:leading-8">
                                {
                                    product.description
                                }
                            </p>
                        </div>
                    </section>
                ) : null}

                {/* =====================================================
                    Size Availability
                ===================================================== */}

                {hasVariants ? (
                    <section className="mt-12 border-t border-orange-100 pt-10 sm:mt-16 sm:pt-12">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                Available Sizes
                            </p>

                            <h2 className="mt-2 font-serif text-2xl text-chocolate sm:text-3xl">
                                Choose your fit
                            </h2>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {product.variants.map(
                                    (variant) => {
                                        const outOfStock =
                                            variant.stock <=
                                            0;

                                        return (
                                            <div
                                                key={
                                                    variant.size
                                                }
                                                className={`rounded-xl border bg-white px-4 py-4 ${
                                                    outOfStock
                                                        ? 'border-slate-200'
                                                        : 'border-orange-100'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-bold text-chocolate">
                                                        {
                                                            variant.size
                                                        }
                                                    </span>

                                                    <span
                                                        className={`h-2 w-2 rounded-full ${
                                                            outOfStock
                                                                ? 'bg-slate-300'
                                                                : variant.stock <=
                                                                    9
                                                                  ? 'bg-orange-400'
                                                                  : 'bg-emerald-500'
                                                        }`}
                                                    />
                                                </div>

                                                <p className="mt-2 text-xs text-chocolate-soft">
                                                    {outOfStock
                                                        ? 'Out of stock'
                                                        : variant.stock <=
                                                            9
                                                          ? `Only ${variant.stock} left`
                                                          : `${variant.stock} available`}
                                                </p>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </section>
                ) : null}
            </div>
        </main>
    );
}