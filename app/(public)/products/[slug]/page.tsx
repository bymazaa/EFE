import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import {
    Check,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

import { getProductBySlug } from '@/services/product.service';

import { ProductGallery } from '@/app/components/products/ProductGallery';

import { PriceTag } from '@/app/components/products/PriceTag';

import { ProductDetailsActions } from './ProductDetailsActions';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const product =
        await getProductBySlug(slug);

    if (!product) {
        return {
            title: 'Product not found',
        };
    }

    return {
        title: product.name,

        description:
            product.description ||
            `${product.name} - premium streetwear piece.`,

        alternates: {
            canonical: `/products/${product.slug}`,
        },

        openGraph: {
            title: product.name,

            description:
                product.description ||
                `${product.name} - premium streetwear piece.`,

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

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const product =
        await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">

                {/* =====================================================
                    Main Product
                ===================================================== */}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

                    {/* =================================================
                        Product Gallery
                    ================================================= */}

                    <div className="min-w-0">
                        <ProductGallery
                            images={
                                product.images
                            }
                            productName={
                                product.name
                            }
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
                                price={
                                    product.price
                                }
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
                            Product Actions
                        ================================================= */}

                        <ProductDetailsActions
                            productId={
                                product.id
                            }
                            productName={
                                product.name
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

            </div>
        </main>
    );
}