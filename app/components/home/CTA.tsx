import Link from 'next/link';

import { ArrowRight, Sparkles } from 'lucide-react';

import { buttonVariants } from '@/app/components/ui/Button';

export function FinalCTA({
    brandName,
}: {
    brandName: string;
}) {
    return (
        <section className="relative overflow-hidden bg-[#fff8f2]">
            {/* Background glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/40 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 px-6 py-14 text-center shadow-2xl shadow-orange-100/50 sm:px-10 sm:py-16 lg:px-16">
                    {/* Decorative circles */}
                    <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full border border-orange-200/70 bg-white/30" />

                    <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full border border-orange-200/70 bg-white/20" />

                    {/* Icon */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-lg shadow-orange-100">
                        <Sparkles
                            className="h-5 w-5"
                            strokeWidth={1.7}
                        />
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                        Elevate your everyday wardrobe
                    </p>

                    <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-chocolate sm:text-4xl lg:text-5xl">
                        Make your everyday style
                        <span className="text-orange-600">
                            {' '}feel a little more confident.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-chocolate-soft sm:text-[15px]">
                        Discover thoughtfully designed streetwear
                        made to bring confidence, comfort, and
                        timeless style into your everyday wardrobe.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/products"
                            className={buttonVariants({
                                size: 'lg',
                                className:
                                    'group rounded-2xl px-7 shadow-lg shadow-orange-200',
                            })}
                        >
                            Shop Streetwear

                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>

                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-7 py-3 text-sm font-semibold text-chocolate shadow-2xl shadow-gray-50 transition hover:border-orange-300 hover:bg-orange-50"
                        >
                            Our Story
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-chocolate-muted">
                        Crafted by {brandName}
                    </p>
                </div>
            </div>
        </section>
    );
}