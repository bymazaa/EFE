
import Image from 'next/image';
import Link from 'next/link';

import {
    ArrowRight,
    Heart,
    Sparkles,
} from 'lucide-react';

import { buttonVariants } from '@/app/components/ui/Button';
import { categoryName } from '@/lib/constants';

export function BrandAbout({
    brandName,
}: {
    brandName: string;
}) {
    return (
        <section className="relative overflow-hidden border-b border-orange-100 bg-[#fff8f2]">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8">
                {/* Image */}
              <div className="relative">
    <div className="absolute -inset-5 rounded-[3rem] bg-orange-200/30 blur-2xl" />

    <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-2 shadow-2xl shadow-gray-100">
        <div className="relative overflow-hidden rounded-[1.5rem]">
            <Image
                src="https://static.wixstatic.com/media/0445b4_813fb4d164b042e6b82be38d525b2747~mv2.png"
                alt={`${brandName} handcrafted candles`}
                width={713}
                height={1121}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full object-contain"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                    Our Craft
                </p>

                <p className="mt-2 max-w-xs font-serif text-2xl leading-tight text-white">
                    Made slowly.
                    <br />
                    Made with care.
                </p>
            </div>
        </div>
    </div>

    <div className="absolute -bottom-5 -right-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl shadow-gray-100 sm:-right-5">
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Heart
                    className="h-4 w-4"
                    fill="currentColor"
                    strokeWidth={1.5}
                />
            </div>

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                    From us
                </p>

                <p className="text-sm font-semibold text-chocolate">
                    With love
                </p>
            </div>
        </div>
    </div>
</div>
                {/* Content */}
                <div className="max-w-xl">
                    <span className="inline-flex rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
                        Our Story
                    </span>

                    <h2 className="mt-6 font-serif text-3xl leading-tight text-chocolate sm:text-4xl lg:text-5xl">
                        A little more warmth
                        <span className="block text-orange-600">
                            in everyday life.
                        </span>
                    </h2>

                    <div className="mt-6 space-y-4 text-[15px] leading-7 text-chocolate-soft">
                        <p>
                            {brandName} started with a simple idea:
                            everyday spaces can feel more special
                            with the right light, scent, and a
                            little intention.
                        </p>

                        <p>
                            Each {categoryName}  is hand-poured in small
                            batches using carefully selected
                            ingredients, premium soy wax, and
                            fragrances chosen to create a warm and
                            comfortable atmosphere.
                        </p>

                        <p>
                            We&apos;re not here to make {categoryName}  that
                            simply look beautiful on a shelf. We
                            create pieces that become part of quiet
                            mornings, slow evenings, celebrations,
                            and the small moments in between.
                        </p>
                    </div>

                    {/* Highlights */}
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <Sparkles
                                    className="h-4 w-4"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <p className="mt-3 font-serif text-xl text-chocolate">
                                Small
                            </p>

                            <p className="mt-1 text-xs text-chocolate-muted">
                                Batch Crafted
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50">
                            <p className="font-serif text-2xl text-chocolate">
                                100%
                            </p>

                            <p className="mt-1 text-xs text-chocolate-muted">
                                Soy Wax
                            </p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl shadow-gray-50">
                            <p className="font-serif text-2xl text-chocolate">
                                Clean
                            </p>

                            <p className="mt-1 text-xs text-chocolate-muted">
                                Burning
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-8">
                        <Link
                            href="/about"
                            className={buttonVariants({
                                size: 'lg',
                                className:
                                    'group rounded-2xl shadow-lg shadow-orange-100',
                            })}
                        >
                            Learn More About Us

                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
