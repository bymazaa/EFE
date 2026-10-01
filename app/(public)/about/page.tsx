import type { Metadata } from 'next';

import Image from 'next/image';
import Link from 'next/link';

import {
    ArrowRight,
    Heart,
    Leaf,
    Sparkles,
    Flame,
    HandHeart,
    PackageCheck,
} from 'lucide-react';

import { getSettings } from '@/services/settings.service';

export const metadata: Metadata = {
    title: 'About Us',
    description:
        'Learn the story behind our brand and discover why we create thoughtful streetwear with quality, style, and care.',

    alternates: {
        canonical: '/about',
    },

    openGraph: {
        title: 'About Our Brand',
        description:
            'Discover the story, values, and craftsmanship behind our streetwear collection.',
        url: '/about',
        images: [
            {
                url: '/EFE Heritage Wool Jacket new.webp',
                width: 1200,
                height: 630,
                alt: 'Our streetwear collection',
            },
        ],
    },
};

const VALUES = [
    {
        title: 'Thoughtful Design',
        description:
            'We carefully choose fabrics, colors, and details with quality, comfort, and everyday style in mind.',
        icon: Leaf,
    },
    {
        title: 'Made with Care',
        description:
            'Every piece is selected and finished with attention to detail so it feels right from the first wear.',
        icon: HandHeart,
    },
    {
        title: 'Created with Intention',
        description:
            'Every design is made to bring confidence, character, and a distinct sense of style to your everyday look.',
        icon: Sparkles,
    },
];

const PROCESS = [
    {
        number: '01',
        title: 'Choose the design',
        description:
            'We carefully develop designs that feel modern, comfortable, and easy to wear.',
        icon: Sparkles,
    },
    {
        number: '02',
        title: 'Craft the piece',
        description:
            'Each piece is prepared with attention to fit, materials, and the details that make it stand out.',
        icon: Flame,
    },
    {
        number: '03',
        title: 'Finish with care',
        description:
            'Every item is checked, finished, packaged, and prepared before it reaches you.',
        icon: PackageCheck,
    },
];

export default async function AboutPage() {
    const settings = await getSettings();

    const brandName = settings.brandName;

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            {/* ================================================== */}
            {/* Hero */}
            {/* ================================================== */}

            <section className="relative overflow-hidden border-b border-orange-100">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl" />

                    <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
                    <span className="inline-flex rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
                        Our Story
                    </span>

                    <h1 className="mx-auto mt-6 max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-chocolate sm:text-5xl lg:text-6xl">
                        We believe everyday style
                        <span className="text-orange-600">
                            {' '}deserves a little more character.
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-chocolate-soft sm:text-base">
                        {brandName} was created around a simple idea:
                        everyday life feels better when what you wear feels
                        comfortable, confident, and true to your style.
                    </p>
                </div>
            </section>

            {/* ================================================== */}
            {/* Brand Story */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-white">
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8">
                    {/* Image */}
                 <div className="relative">
    <div className="absolute -inset-5 rounded-[3rem] bg-orange-200/30 blur-2xl" />

    <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-2 shadow-2xl shadow-gray-100">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-orange-50">
            <Image
                src="/0445b4_05aad7afa7084f70abef792b88dad929~mv2.avif"
                alt={`${brandName} streetwear collection`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition duration-700 hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                    Behind the brand
                </p>

                <p className="mt-2 max-w-xs font-serif text-2xl leading-tight text-white">
                    Simple design.
                    <br />
                    Everyday style.
                </p>
            </div>
        </div>
    </div>

    <div className="absolute -bottom-5 -right-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl shadow-gray-100 sm:-right-5">
        <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Heart
                    className="h-4 w-4"
                    fill="currentColor"
                    strokeWidth={1.5}
                />
            </div>

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                    Crafted
                </p>

                <p className="text-sm font-semibold text-chocolate">
                    With care
                </p>
            </div>
        </div>
    </div>
</div>
                    {/* Story */}
                    <div className="max-w-xl">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                            Why we started
                        </span>

                        <h2 className="mt-4 font-serif text-3xl leading-tight text-chocolate sm:text-4xl">
                            More than clothing.
                            <span className="block text-orange-600">
                                A feeling.
                            </span>
                        </h2>

                        <div className="mt-6 space-y-5 text-[15px] leading-7 text-chocolate-soft">
                            <p>
                                {brandName} began with a love for modern
                                streetwear, clean design, and the everyday
                                moments that shape personal style.
                            </p>

                            <p>
                                We wanted to create clothing that does more
                                than simply look good. We wanted each piece
                                to become part of the way people dress,
                                move, and express themselves.
                            </p>

                            <p>
                                That idea guides everything we do. From the
                                materials we choose to the way each piece is
                                designed and packaged, every detail is
                                approached with care.
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-3 border-t border-orange-100 pt-6">
                            <div>
                                <p className="font-serif text-2xl text-chocolate">
                                    Quality
                                </p>

                                <p className="mt-1 text-xs text-chocolate-muted">
                                    Materials
                                </p>
                            </div>

                            <div className="border-l border-orange-100 pl-4">
                                <p className="font-serif text-2xl text-chocolate">
                                    Small
                                </p>

                                <p className="mt-1 text-xs text-chocolate-muted">
                                    Collections
                                </p>
                            </div>

                            <div className="border-l border-orange-100 pl-4">
                                <p className="font-serif text-2xl text-chocolate">
                                    Everyday
                                </p>

                                <p className="mt-1 text-xs text-chocolate-muted">
                                    Style
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Values */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-[#fff8f2]">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                            What matters to us
                        </span>

                        <h2 className="mt-5 font-serif text-3xl text-chocolate sm:text-4xl">
                            Made with purpose,
                            <span className="text-orange-600">
                                {' '}not just appearance.
                            </span>
                        </h2>

                        <p className="mt-4 text-[15px] leading-7 text-chocolate-soft">
                            We keep our approach simple: thoughtful design,
                            quality materials, and products that feel good
                            to wear every day.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {VALUES.map(
                            ({
                                title,
                                description,
                                icon: Icon,
                            }) => (
                                <div
                                    key={title}
                                    className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                        <Icon
                                            className="h-5 w-5"
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <h3 className="mt-5 font-serif text-xl text-chocolate">
                                        {title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                        {description}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Process */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        {/* Heading */}
                        <div className="max-w-md">
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                                Our process
                            </span>

                            <h2 className="mt-4 font-serif text-3xl leading-tight text-chocolate sm:text-4xl">
                                From the first idea
                                <span className="block text-orange-600">
                                    to the final piece.
                                </span>
                            </h2>

                            <p className="mt-5 text-[15px] leading-7 text-chocolate-soft">
                                We keep the process intentional and
                                hands-on, so every piece gets the attention
                                it deserves.
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4">
                            {PROCESS.map(
                                ({
                                    number,
                                    title,
                                    description,
                                    icon: Icon,
                                }) => (
                                    <div
                                        key={number}
                                        className="flex gap-5 rounded-3xl border border-orange-100 bg-[#fffaf6] p-5 shadow-2xl shadow-gray-50 sm:p-6"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                                            <Icon
                                                className="h-5 w-5"
                                                strokeWidth={1.7}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-orange-500">
                                                    {number}
                                                </span>

                                                <h3 className="font-serif text-xl text-chocolate">
                                                    {title}
                                                </h3>
                                            </div>

                                            <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Brand Promise */}
            {/* ================================================== */}

            <section className="bg-[#fff8f2]">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 px-6 py-14 text-center shadow-2xl shadow-orange-100/40 sm:px-10 sm:py-16">
                        <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full border border-orange-200/70 bg-white/30" />

                        <div className="pointer-events-none absolute -bottom-14 -right-8 h-36 w-36 rounded-full border border-orange-200/70 bg-white/20" />

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-lg shadow-orange-100">
                            <Heart
                                className="h-5 w-5"
                                fill="currentColor"
                                strokeWidth={1.5}
                            />
                        </div>

                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                            Our promise
                        </p>

                        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight text-chocolate sm:text-4xl">
                            Create something you&apos;ll want
                            to wear again and again.
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-chocolate-soft sm:text-[15px]">
                            That&apos;s what we keep coming back to —
                            simple design, thoughtful details,
                            and everyday pieces worth remembering.
                        </p>

                        <Link
                            href="/products"
                            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                        >
                            Explore Our Collection
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}