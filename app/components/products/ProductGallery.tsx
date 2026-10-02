'use client';

import { useState } from 'react';

import Image from 'next/image';

import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ProductImageZoom } from './ProductImageZoom';

export function ProductGallery({
    images,
    productName,
}: {
    images: string[];
    productName: string;
}) {
    const [activeIndex, setActiveIndex] =
        useState(0);

    const gallery =
        images.length > 0 ? images : [''];

    const activeImage =
        gallery[activeIndex];

    return (
        <div className="space-y-4">
            {/* Main Image */}

            <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-2 shadow-2xl shadow-gray-50">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-[#fff7f0]">
                    {activeImage ? (
                        <ProductImageZoom
                            src={activeImage}
                            alt={productName}
                            sizes="
                                (min-width:1280px) 50vw,
                                (min-width:1024px) 50vw,
                                100vw
                            "
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-300 shadow-2xl shadow-gray-50">
                                <ImageIcon
                                    className="h-7 w-7"
                                    strokeWidth={1.5}
                                />
                            </div>

                            <p className="mt-4 text-sm font-medium text-chocolate-muted">
                                No product image
                            </p>
                        </div>
                    )}

                    {/* Image counter */}

                    {images.length > 1 ? (
                        <div className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                            {activeIndex + 1} /{' '}
                            {images.length}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Thumbnails */}

            {images.length > 1 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {images.map(
                        (image, index) => {
                            const isActive =
                                index ===
                                activeIndex;

                            return (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() =>
                                        setActiveIndex(
                                            index,
                                        )
                                    }
                                    aria-label={`Show image ${
                                        index + 1
                                    }`}
                                    aria-current={
                                        isActive
                                    }
                                    className={cn(
                                        'group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-2xl shadow-gray-50 transition-all duration-200',
                                        isActive
                                            ? 'border-orange-500 ring-4 ring-orange-100'
                                            : 'border-orange-100 hover:border-orange-300',
                                    )}
                                >
                                    <Image
                                        src={image}
                                        alt={`${productName} image ${
                                            index + 1
                                        }`}
                                        fill
                                        sizes="80px"
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                    />

                                    {!isActive ? (
                                        <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
                                    ) : null}
                                </button>
                            );
                        },
                    )}
                </div>
            ) : null}
        </div>
    );
}