import type { Metadata } from 'next';

import Link from 'next/link';

import {
    Package,
    PackageSearch,
    Plus,
} from 'lucide-react';

import { getAdminProducts } from '@/services/product.service';

import { ProductTable } from '@/app/components/admin/ProductTable';

import { Pagination } from '@/app/components/admin/Pagination';

import { SearchBox } from '@/app/components/admin/SearchBox';

import { Card } from '@/app/components/ui/Card';

import { buttonVariants } from '@/app/components/ui/Button';

export const metadata: Metadata = {
    title: 'Products',
};

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}) {
    const params = await searchParams;

    const result = await getAdminProducts(params);

    const data = result.success
        ? result.data
        : undefined;

    const products = data?.products ?? [];

    const hasSearch = Boolean(params.search);

    return (
        <div className="w-full max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Package
                                className="h-4.5 w-4.5"
                                strokeWidth={1.8}
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="font-serif text-2xl font-bold text-chocolate sm:text-3xl">
                                Products
                            </h1>

                            <p className="mt-0.5 text-sm text-chocolate-soft">
                              Manage your clothing catalog
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/admin/products/new"
                    className={buttonVariants({
                        className:
                            'w-full shrink-0 gap-2 sm:w-auto',
                    })}
                >
                    <Plus
                        className="h-4 w-4"
                        strokeWidth={2}
                    />
                    Add product
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl   p-3  sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="w-full sm:max-w-md">
                    <SearchBox
                        basePath="/admin/products"
                        placeholder="Search products..."
                        defaultValue={params.search}
                    />
                </div>

                {data ? (
                    <div className="flex items-center gap-2 self-start rounded-lg bg-[#fffaf6] px-3 py-2 sm:self-auto">
                        <span className="text-xs text-chocolate-muted">
                            Total
                        </span>

                        <span className="text-sm font-semibold tabular-nums text-chocolate">
                            {data.total}
                        </span>
                    </div>
                ) : null}
            </div>

            {/* Product table */}
            <Card className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                {products.length > 0 ? (
                    <>
                        <ProductTable
                            products={products}
                        />

                        {data &&
                        data.totalPages > 1 ? (
                            <div className="border-t border-orange-100">
                                <Pagination
                                    basePath="/admin/products"
                                    page={data.page}
                                    totalPages={
                                        data.totalPages
                                    }
                                    searchParams={{
                                        search: params.search,
                                    }}
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-700">
                            <PackageSearch
                                className="h-6 w-6"
                                strokeWidth={1.6}
                            />
                        </div>

                        <h2 className="mt-5 text-sm font-semibold text-chocolate">
                            {hasSearch
                                ? 'No products found'
                                : 'No products yet'}
                        </h2>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-chocolate-muted">
                           {hasSearch
    ? `No products match "${params.search}". Try a different search term.`
    : 'Your product catalog is empty. Add your first product to get started.'}
                        </p>

                        {hasSearch ? (
                            <Link
                                href="/admin/products"
                                className="mt-4 text-sm font-medium text-primary transition hover:text-primary-dark"
                            >
                                Clear search
                            </Link>
                        ) : (
                            <Link
                                href="/admin/products/new"
                                className={buttonVariants({
                                    className:
                                        'mt-5 gap-2',
                                })}
                            >
                                <Plus
                                    className="h-4 w-4"
                                    strokeWidth={2}
                                />
                                Add your first product
                            </Link>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}