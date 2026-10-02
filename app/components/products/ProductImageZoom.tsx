'use client';

import Image from 'next/image';

import {
    useRef,
    useState,
    type MouseEvent,
} from 'react';

interface ProductImageZoomProps {
    src: string;
    alt: string;
    sizes?: string;
    className?: string;
}

export function ProductImageZoom({
    src,
    alt,
    sizes = `
        (min-width: 1280px) 50vw,
        (min-width: 1024px) 50vw,
        100vw
    `,
    className = '',
}: ProductImageZoomProps) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const [isZoomed, setIsZoomed] =
        useState(false);

    const [transformOrigin, setTransformOrigin] =
        useState('50% 50%');

    /*
     * Product image URLs can come from database
     * fields containing accidental whitespace/newlines.
     *
     * Always normalize before passing to next/image.
     */
    const normalizedSrc = src.trim();

    /* ============================================================
       Mouse enter
    ============================================================ */

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    /* ============================================================
       Mouse move
    ============================================================ */

    const handleMouseMove = (
        event: MouseEvent<HTMLDivElement>,
    ) => {
        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const rect =
            container.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }

        const x =
            ((event.clientX - rect.left) /
                rect.width) *
            100;

        const y =
            ((event.clientY - rect.top) /
                rect.height) *
            100;

        const safeX = Math.max(
            0,
            Math.min(100, x),
        );

        const safeY = Math.max(
            0,
            Math.min(100, y),
        );

        setTransformOrigin(
            `${safeX}% ${safeY}%`,
        );
    };

    /* ============================================================
       Mouse leave
    ============================================================ */

    const handleMouseLeave = () => {
        setIsZoomed(false);
        setTransformOrigin('50% 50%');
    };

    return (
        <div
            ref={containerRef}
            className={`group relative h-full w-full overflow-hidden ${className}`}
            onMouseEnter={
                handleMouseEnter
            }
            onMouseMove={handleMouseMove}
            onMouseLeave={
                handleMouseLeave
            }
        >
            {normalizedSrc ? (
                <Image
                    src={normalizedSrc}
                    alt={alt}
                    fill
                    sizes={sizes}
                    draggable={false}
                    className="h-full w-full select-none cursor-pointer object-contain transition-transform duration-200 ease-out will-change-transform"
                    style={{
                        transform: isZoomed
                            ? 'scale(1.8)'
                            : 'scale(1)',
                        transformOrigin,
                    }}
                />
            ) : null}

            {/* Desktop zoom hint */}

            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-4
                    left-1/2
                    z-20
                    hidden
                    -translate-x-1/2
                    items-center
                    rounded-full
                    border
                    border-white/70
                    bg-white/80
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    tracking-wide
                    text-chocolate-soft
                    opacity-0
                    shadow-sm
                    backdrop-blur-md
                    transition-opacity
                    duration-200
                    lg:flex
                    lg:group-hover:opacity-100
                "
            >
                Move to zoom
            </div>
        </div>
    );
}