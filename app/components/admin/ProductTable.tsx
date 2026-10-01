import Image from 'next/image';

import {
    formatPrice,
    hasDiscount,
} from '@/lib/utils';

import { ProductActions } from '@/app/components/admin/ProductActions';
import { ProductInventory } from '@/app/components/admin/ProductInventory';

import type { ProductDTO } from '@/services/product.service';

import { LocalDate } from '../ui/LocalDate';
import { LocalDateTime } from '../ui/Timeformat';

export function ProductTable({
    products,
}: {
    products: ProductDTO[];
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                    <tr className="border-b border-orange-100 bg-orange-50/40">
                        <th className="w-20 py-4 pl-5 pr-3 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Image
                        </th>

                        <th className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Created
                        </th>

                        <th className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Product
                        </th>

                        <th className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Price
                        </th>

                        {/* Inventory */}
                        <th className="w-44 px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Inventory
                        </th>

                        <th className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Status
                        </th>

                        <th className="px-3 py-4 text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Last updated
                        </th>

                        <th className="w-36 py-4 pl-3 pr-5 text-right text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-orange-50">
                    {products.map((product) => {
                        const discounted =
                            hasDiscount(
                                product.price,
                                product.compareAtPrice,
                            );

                        return (
                            <tr
                                key={product.id}
                                className="group bg-white transition-colors duration-200 hover:bg-orange-50/30"
                            >
                                {/* Image */}
                                <td className="py-4 pl-5 pr-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-orange-100 bg-orange-50 shadow-sm">
                                        {product.images[0] ? (
                                            <Image
                                                src={
                                                    product
                                                        .images[0]
                                                }
                                                alt={
                                                    product.name
                                                }
                                                fill
                                                sizes="48px"
                                                className="object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-orange-400">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Created */}
                                <td className="px-3 py-4">
                                    <LocalDate
                                        date={
                                            product.createdAt
                                        }
                                    />
                                </td>

                                {/* Product */}
                                <td className="px-3 py-4">
                                    <div className="min-w-0">
                                        <p className="max-w-[260px] truncate font-semibold text-chocolate">
                                            {product.name}
                                        </p>

                                        <p className="mt-1 max-w-[260px] truncate text-xs text-chocolate-muted">
                                            /{product.slug}
                                        </p>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className="px-3 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-chocolate">
                                                {formatPrice(
                                                    product.price,
                                                    product.currency,
                                                )}
                                            </span>

                                            {discounted && (
                                                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                                                    SALE
                                                </span>
                                            )}
                                        </div>

                                        {discounted && (
                                            <span className="mt-1 text-xs text-chocolate-muted line-through">
                                                {formatPrice(
                                                    product.compareAtPrice as number,
                                                    product.currency,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Inventory */}
                                <td className="px-3 py-4 align-middle">
                                    <ProductInventory
                                        variants={
                                            product.variants
                                        }
                                    />
                                </td>

                                {/* Status */}
                                <td className="px-3 py-4">
                                    <span
                                        className={
                                            product.isActive
                                                ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'
                                                : 'inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-chocolate-muted ring-1 ring-inset ring-gray-200'
                                        }
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                product.isActive
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gray-400'
                                            }`}
                                        />

                                        {product.isActive
                                            ? 'Active'
                                            : 'Inactive'}
                                    </span>
                                </td>

                                {/* Updated */}
                                <td className="px-3 py-4">
                                    <LocalDateTime
                                        date={
                                            product.updatedAt
                                        }
                                    />
                                </td>

                                {/* Actions */}
                                <td className="py-4 pl-3 pr-5">
                                    <div className="flex justify-end">
                                        <div className="rounded-xl border border-orange-100 bg-white p-1 shadow-sm transition group-hover:border-orange-200 group-hover:shadow-md">
                                            <ProductActions
                                                id={product.id}
                                                isActive={
                                                    product.isActive
                                                }
                                                name={
                                                    product.name
                                                }
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}