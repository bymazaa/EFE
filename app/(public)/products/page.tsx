export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import { getActiveProducts } from '@/services/product.service';
import { ProductGrid } from '@/app/components/products/productGrid';

export const metadata: Metadata = {
    title: 'Shop Streetwear',
    description:
        'Browse EFE luxury streetwear, including premium unisex wool jackets and graphic sweatshirts crafted in limited batches for everyday style.',

    alternates: {
        canonical: '/products',
    },

    openGraph: {
        title: 'Shop Streetwear | EFE',
        description:
            'Explore premium wool jackets, graphic sweatshirts, and everyday essentials from EFE, crafted in limited batches with quality fabrics.',
        url: '/products',
        images: [
            {
                url: '/EFE Heritage Wool Jacket new.webp',
                width: 1200,
                height: 630,
                alt: 'EFE luxury streetwear collection',
            },
        ],
    },
};

export default async function ProductsPage() {
    const products = await getActiveProducts();

    return (
        <div className="mx-auto max-w-7xl px-2 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl text-chocolate sm:text-4xl">
                    Our Streetwear
                </h1>

                <p className="mt-2 text-sm text-chocolate-soft">
                    Crafted in limited batches, one piece at a time.
                </p>
            </div>

            <ProductGrid products={products} />
        </div>
    );
}