import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { truncate } from '@/lib/utils';
import type { ProductDTO } from '@/services/product.service';

import { AddToCartButtons } from './AddToCartButtons';
import { PriceTag } from './PriceTag';

export function ProductCard({
    product,
}: {
    product: ProductDTO;
}) {
    const hasDiscount =
        product.compareAtPrice !== null &&
        product.compareAtPrice > product.price;

    const productHref = `/products/${product.slug}`;

    return (
        <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl shadow-gray-50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
            {/* =========================================================
                Product Image
            ========================================================= */}

            <Link
                href={productHref}
                className="block min-w-0"
            >
                <div className="relative aspect-square w-full overflow-hidden bg-[#fff7f0]">
                    {product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="
                                (min-width: 1280px) 25vw,
                                (min-width: 1024px) 33.33vw,
                                (min-width: 640px) 50vw,
                                50vw
                            "
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Sparkles
                                className="h-8 w-8 text-orange-300"
                                strokeWidth={1.5}
                            />
                        </div>
                    )}

                    {/* Soft overlay */}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Sale badge */}

                    {hasDiscount ? (
                        <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-200 sm:left-4 sm:top-4">
                            Sale
                        </span>
                    ) : null}
                </div>
            </Link>

            {/* =========================================================
                Product Content
            ========================================================= */}

            <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
                {/* =====================================================
                    Product Information
                ===================================================== */}

                <div className="min-w-0 flex-1">
                    {/* Product Name */}

                    <Link
                        href={productHref}
                        className="block min-w-0"
                    >
                        <h3 className="line-clamp-2 font-serif text-base leading-tight text-chocolate transition-colors duration-200 group-hover:text-orange-600 sm:text-lg">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Description */}

                    {product.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-chocolate-soft sm:text-[13px]">
                            {truncate(
                                product.description,
                                90,
                            )}
                        </p>
                    ) : (
                        <div className="h-10" />
                    )}

                    {/* Price */}

                    <div className="mt-3 sm:mt-4">
                        <PriceTag
                            price={product.price}
                            compareAtPrice={
                                product.compareAtPrice
                            }
                            currency={product.currency}
                        />
                    </div>
                </div>

                {/* =====================================================
                    Actions
                ===================================================== */}

                <div className="mt-4 min-w-0 border-t border-orange-100 pt-3 sm:mt-5 sm:pt-4">
                    <div className="w-full min-w-0 overflow-hidden">
                        <AddToCartButtons
                            productId={product.id}
                            productName={product.name}
                            variants={product.variants}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}