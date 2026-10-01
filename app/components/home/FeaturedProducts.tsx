
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import { getActiveProducts } from '@/services/product.service';
import { ProductGrid } from '../products/productGrid';
import { categoryName } from '@/lib/constants';


export async function FeaturedProducts() {
    const products = await getActiveProducts();

    const featuredProducts = products.slice(0, 4);

    return (
        <section className="border-b border-orange-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                            <Sparkles className="h-3 w-3" />
                            Featured Collection
                        </span>

                        <h2 className="mt-5 font-serif text-3xl leading-tight text-chocolate sm:text-4xl">
                            {categoryName}s made for
                            <span className="text-orange-600">
                                {' '}your moments
                            </span>
                        </h2>

                        <p className="mt-4 max-w-xl text-[15px] leading-7 text-chocolate-soft">
                            Discover some of our favorite streetwear pieces, made in limited batches with premium fabrics and thoughtful design.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-chocolate shadow-2xl shadow-gray-50 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                        View All {categoryName}

                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Products */}
                <div className="mt-10">
                    <ProductGrid
                        products={featuredProducts}
                    />
                </div>

                {/* Bottom CTA */}
                {featuredProducts.length > 0 ? (
                    <div className="mt-10 flex justify-center sm:hidden">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                        >
                            Explore All Products

                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}