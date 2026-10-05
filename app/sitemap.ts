import type { MetadataRoute } from 'next';

import { getActiveProducts } from '@/services/product.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const products = await getActiveProducts();

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },

        {
            url: `${siteUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },

        {
            url: `${siteUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },

        {
            url: `${siteUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },

        {
            url: `${siteUrl}/size-guide`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,

        lastModified: product.updatedAt ?? product.createdAt ?? new Date(),

        changeFrequency: 'weekly',

        priority: 0.8,
    }));

    return [...staticPages, ...productPages];
}
