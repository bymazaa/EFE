'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useEffect, useState } from 'react';

import {
    ArrowRight,
    X,
} from 'lucide-react';

const PROMO_IMAGES = {
    main: '/Screenshot20atE2AFPM.jpg',

    leftTop:
        'https://static.wixstatic.com/media/0445b4_8d061aec99c743e18980922ff9cb94d5~mv2.png/v1/fill/w_282,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Screenshot%202025-11-26%20at%2010_17_28%E2%80%AFAM.png',

    leftBottom:
        'https://static.wixstatic.com/media/0445b4_4cc13a0f7516476d871a0765ee629ce6~mv2.png/v1/fill/w_282,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Screenshot%202025-11-26%20at%2010_12_57%E2%80%AFAM.png',
} as const;

export function PromoPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(min-width: 768px)',
        );

        const updateViewport = () => {
            const desktop = mediaQuery.matches;

            setIsDesktop(desktop);

            if (!desktop) {
                setIsOpen(false);
                document.body.style.overflow = '';
            }
        };

        updateViewport();

        mediaQuery.addEventListener(
            'change',
            updateViewport,
        );

        return () => {
            mediaQuery.removeEventListener(
                'change',
                updateViewport,
            );
        };
    }, []);

    useEffect(() => {
        if (!isDesktop) {
            return;
        }

        const alreadyShown =
            sessionStorage.getItem(
                'promo-popup-shown',
            );

        if (alreadyShown) {
            return;
        }

        const timer = window.setTimeout(() => {
            setIsOpen(true);

            sessionStorage.setItem(
                'promo-popup-shown',
                'true',
            );
        }, 2000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [isDesktop]);

    useEffect(() => {
        if (!isOpen || !isDesktop) {
            document.body.style.overflow = '';
            return;
        }

        const handleEscape = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            'keydown',
            handleEscape,
        );

        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener(
                'keydown',
                handleEscape,
            );

            document.body.style.overflow = '';
        };
    }, [isOpen, isDesktop]);

    if (!isOpen || !isDesktop) {
        return null;
    }

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div
            className="
                fixed inset-0 z-[100]
                hidden md:flex
                items-center justify-center
                bg-black/30
                px-4 py-6
                backdrop-blur-[3px]
                animate-in fade-in duration-300
                lg:px-8
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="promo-title"
                className="
                    relative
                    w-full
                    max-w-[960px]
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                    shadow-black/25
                    animate-in
                    zoom-in-95
                    duration-300
                "
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* =====================================================
                    Close
                ===================================================== */}

                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close promotion"
                    className="
                        absolute
                        right-3
                        top-3
                        z-30
                        flex
                        h-9
                        w-9
                        cursor-pointer
                        items-center
                        justify-center
                        rounded-full
                        bg-white/80
                        text-[#2f241d]
                        shadow-sm
                        backdrop-blur
                        transition-all
                        duration-200
                        hover:bg-white
                        hover:text-orange-600
                        sm:right-4
                        sm:top-4
                        sm:h-10
                        sm:w-10
                    "
                >
                    <X
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        strokeWidth={1.5}
                    />
                </button>

                {/* =====================================================
                    Content
                ===================================================== */}

                <div className="grid md:grid-cols-[0.9fr_1.1fr]">

                    {/* =================================================
                        Left Content
                    ================================================= */}

                    <div
                        className="
                            flex
                            min-h-[430px]
                            flex-col
                            justify-center
                            bg-[#fffaf5]
                            px-7
                            py-10
                            sm:px-10
                            sm:py-12
                            md:min-h-[500px]
                            md:px-10
                            lg:px-12
                        "
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b0703a] sm:text-xs">
                            Limited Offer
                        </p>

                        <h2
                            id="promo-title"
                            className="
                                mt-4
                                max-w-[390px]
                                font-serif
                                text-[34px]
                                leading-[1.05]
                                tracking-[-0.02em]
                                text-[#5a3924]
                                sm:text-[42px]
                                lg:text-[48px]
                            "
                        >
                            Buy a Jacket,
                            <span className="block">
                                Get a{' '}
                                <span className="text-[#b0703a]">
                                    FREE
                                </span>
                            </span>
                            Sweatshirt!
                        </h2>

                        <p className="mt-5 max-w-[390px] text-sm leading-6 text-[#765b47] sm:text-[15px]">
                            Complete your streetwear look
                            and get a sweatshirt absolutely
                            free with your jacket purchase.
                        </p>

                        <Link
                            href="/products"
                            onClick={handleClose}
                            className="
                                mt-7
                                inline-flex
                                w-fit
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                border
                                border-[#5a3924]
                                bg-transparent
                                px-6
                                py-3
                                text-sm
                                font-medium
                                tracking-wide
                                text-[#5a3924]
                                transition-all
                                duration-200
                                hover:bg-[#5a3924]
                                hover:text-white
                                sm:mt-8
                                sm:px-7
                                sm:py-3.5
                            "
                        >
                            Shop Now

                            <ArrowRight
                                className="h-4 w-4"
                                strokeWidth={1.7}
                            />
                        </Link>

                        <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#9b8069] sm:text-[10px]">
                            Limited time only
                        </p>
                    </div>

                    {/* =================================================
                        Right Image Composition
                    ================================================= */}

                    <div
                        className="
                            relative
                            min-h-[380px]
                            overflow-hidden
                            bg-[#e9e1d4]
                            sm:min-h-[440px]
                            md:min-h-[500px]
                        "
                    >
                        {/* Soft background glow */}
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.45),transparent_45%)]" />

                        {/* Main Image */}

                        <div
                            className="
                                absolute
                                inset-y-0
                                right-0
                                w-[71%]
                                sm:w-[69%]
                            "
                        >
                            <Image
                                src={
                                    PROMO_IMAGES.main
                                }
                                alt="Streetwear collection"
                                fill
                                priority
                                sizes="(max-width: 1024px) 50vw, 35vw"
                                className="
                                    object-cover
                                    object-center
                                    transition-transform
                                    duration-700
                                    hover:scale-[1.03]
                                "
                            />
                        </div>

                        {/* Dark soft gradient */}

                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#e9e1d4] via-[#e9e1d4]/35 to-transparent" />

                        {/* Top Small Image */}

                        <div
                            className="
                                absolute
                                left-5
                                top-7
                                z-10
                                h-40
                                w-28
                                overflow-hidden
                                bg-white
                                shadow-xl
                                ring-4
                                ring-white/70
                                sm:left-7
                                sm:top-8
                                sm:h-48
                                sm:w-32
                            "
                        >
                            <Image
                                src={
                                    PROMO_IMAGES.leftTop
                                }
                                alt="Streetwear outfit"
                                fill
                                sizes="128px"
                                className="
                                    object-cover
                                    transition-transform
                                    duration-500
                                    hover:scale-105
                                "
                            />
                        </div>

                        {/* Bottom Small Image */}

                        <div
                            className="
                                absolute
                                bottom-7
                                left-10
                                z-20
                                h-40
                                w-28
                                overflow-hidden
                                bg-white
                                shadow-xl
                                ring-4
                                ring-white/70
                                sm:bottom-8
                                sm:left-14
                                sm:h-48
                                sm:w-32
                            "
                        >
                            <Image
                                src={
                                    PROMO_IMAGES.leftBottom
                                }
                                alt="Streetwear style"
                                fill
                                sizes="128px"
                                className="
                                    object-cover
                                    transition-transform
                                    duration-500
                                    hover:scale-105
                                "
                            />
                        </div>

                        {/* Decorative label */}

                        <div
                            className="
                                absolute
                                bottom-5
                                right-5
                                z-20
                                hidden
                                rounded-full
                                border
                                border-white/40
                                bg-black/20
                                px-3
                                py-1.5
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-white/90
                                backdrop-blur-sm
                                sm:block
                            "
                        >
                            New collection
                        </div>

                        {/* Soft Overlay */}

                        <div className="pointer-events-none absolute inset-0 bg-black/[0.02]" />
                    </div>
                </div>
            </div>
        </div>
    );
}