
import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { buttonVariants } from '@/app/components/ui/Button';
import { categoryName } from '@/lib/constants';

export function Hero({
    brandName,
}: {
    brandName: string;
}) {
    return (
        <section className="relative overflow-hidden border-b border-border bg-[#fff8f2]">
            {/* Soft background glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(55% 70% at 75% 20%, var(--color-primary-soft) 0%, transparent 70%)',
                }}
            />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
                {/* Left Content */}
                <div className="max-w-xl">
                    <div className="inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
                        {brandName}
                    </div>

                    <h1 className="mt-6 text-balance font-serif text-4xl leading-[1.08] tracking-tight text-chocolate sm:text-5xl lg:text-6xl">
                         Premium Streetwear for 
                        <span className="block text-orange-600">
                           Everyday Style
                        </span>
                    </h1>

                    <p className="mt-6 max-w-lg text-[15px] leading-7 text-chocolate-soft sm:text-base">
                       Crafted in limited batches with premium fabrics and refined finishing, thoughtfully designed to bring confidence, comfort, and style into your everyday moments.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/products"
                            className={buttonVariants({
                                size: 'lg',
                                className:
                                    'group rounded-2xl px-6 shadow-lg shadow-orange-100',
                            })}
                        >
                            Shop {categoryName}

                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>

                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-chocolate shadow-2xl shadow-gray-50 transition hover:border-orange-300 hover:bg-orange-50"
                        >
                            Our Story
                        </Link>
                    </div>

                    {/* Small highlights */}
                    <div className="mt-10 grid max-w-md grid-cols-3 border-t border-orange-100 pt-6">
                        <div>
                            <p className="font-serif text-xl text-chocolate">
                                100%
                            </p>
                            <p className="mt-1 text-xs text-chocolate-muted">
                                Soy Wax
                            </p>
                        </div>

                        <div className="border-l border-orange-100 pl-4">
                            <p className="font-serif text-xl text-chocolate">
                                Small
                            </p>
                            <p className="mt-1 text-xs text-chocolate-muted">
                                Batch Made
                            </p>
                        </div>

                        <div className="border-l border-orange-100 pl-4">
                            <p className="font-serif text-xl text-chocolate">
                                Clean
                            </p>
                            <p className="mt-1 text-xs text-chocolate-muted">
                                Burning
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative lg:ml-auto lg:w-full lg:max-w-xl">
                    {/* Glow */}
                    <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-orange-200/30 blur-3xl" />

                    {/* Main image */}
                    <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-2 shadow-2xl shadow-orange-100/50">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-orange-50">
                            <Image
                                src="/0445b4_9a1dd1a2896a4bda98208c9d30cebc0b~mv2.webp"
                              alt="EFE Apparel premium streetwear jacket"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition duration-700 hover:scale-105"
                            />

                            {/* Image overlay */}
                            {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent p-6">
                                <div className="max-w-xs">
                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">
                                        Made with care
                                    </p>

                                    <p className="mt-1 font-serif text-xl text-white">
                                        Warm light. Quiet moments.
                                    </p>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Floating badge */}
                    <div className="absolute -bottom-5 -left-4 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl shadow-gray-100 sm:-left-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-500">
                            Crafted
                        </p>

                        <p className="mt-1 text-sm font-semibold text-chocolate">
                            With intention
                        </p>
                    </div>

                    {/* Small decorative circle */}
                    <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full border border-orange-200 bg-orange-100/70 blur-[1px] sm:-right-5 sm:-top-5" />
                </div>
            </div>
        </section>
    );
}
