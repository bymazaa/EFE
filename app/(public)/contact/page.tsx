import type { Metadata } from 'next';

import {
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
} from 'lucide-react';

import { getSettings } from '@/services/settings.service';

export const metadata: Metadata = {
    title: 'Contact Us',

    description:
        'Get in touch with us for questions about our clothing, jackets, sweaters, sweatshirts, orders, sizing, or anything else.',

    alternates: {
        canonical: '/contact',
    },

    openGraph: {
        title: 'Contact Us',

        description:
            'Have a question about our clothing, your order, or sizing? Get in touch with us.',

        url: '/contact',

        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Our latest streetwear collection',
            },
        ],
    },
};

export default async function ContactPage() {
    const settings = await getSettings();

    return (
        <main className="min-h-screen bg-[#fff8f2]">
            {/* ==================================================
                Hero
            ================================================== */}
            <section className="relative overflow-hidden border-b border-orange-100">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl" />

                    <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
                    <span className="inline-flex rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
                        Get in touch
                    </span>

                    <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-chocolate sm:text-5xl lg:text-6xl">
                        We&apos;d love to
                        <span className="text-orange-600">
                            {' '}hear from you.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-chocolate-soft sm:text-base">
                        Have a question about an order, product,
                        sizing, or anything else? Send us a message
                        and we&apos;ll get back to you as soon as we can.
                    </p>
                </div>
            </section>

            {/* ==================================================
                Contact Content
            ================================================== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    {/* ==================================================
                        Left Contact Info
                    ================================================== */}
                    <div className="space-y-5">
                        {/* Contact Card */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            <div className="mb-6">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                    Contact Information
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-chocolate">
                                    Let&apos;s talk.
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                    Reach us through any of the
                                    channels below.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {settings.email ? (
                                    <a
                                        href={`mailto:${settings.email}`}
                                        className="group flex items-start gap-4 rounded-2xl border border-orange-100 bg-[#fffaf6] p-4 transition hover:border-orange-200 hover:bg-orange-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                            <Mail className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                                Email
                                            </p>

                                            <p className="mt-1 break-all text-sm font-semibold text-chocolate group-hover:text-orange-700">
                                                {settings.email}
                                            </p>
                                        </div>
                                    </a>
                                ) : null}

                                {settings.phone ? (
                                    <a
                                        href={`tel:${settings.phone}`}
                                        className="group flex items-start gap-4 rounded-2xl border border-orange-100 bg-[#fffaf6] p-4 transition hover:border-orange-200 hover:bg-orange-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                            <Phone className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                                Phone
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-chocolate group-hover:text-orange-700">
                                                {settings.phone}
                                            </p>
                                        </div>
                                    </a>
                                ) : null}

                                {settings.address ? (
                                    <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-[#fffaf6] p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                                            <MapPin className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-muted">
                                                Address
                                            </p>

                                            <p className="mt-1 text-sm font-semibold leading-6 text-chocolate">
                                                {settings.address}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <Clock3 className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-chocolate">
                                        Business Hours
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                        Monday – Friday
                                        <br />
                                        9:00 AM – 6:00 PM
                                    </p>

                                    <p className="mt-2 text-xs text-chocolate-muted">
                                        We usually reply within one
                                        business day.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Message */}
                        <div className="rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 p-6 shadow-2xl shadow-orange-100/40">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                                <MessageCircle className="h-5 w-5" />
                            </div>

                            <h3 className="mt-5 font-serif text-xl text-chocolate">
                                Need a quick conversation?
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                Have a question about sizing,
                                products, orders, or shipping?
                                Reach out and our team will be
                                happy to help.
                            </p>

                            {settings.email ? (
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-700 transition hover:text-orange-800"
                                >
                                    Email us
                                    <Send className="h-4 w-4" />
                                </a>
                            ) : null}
                        </div>
                    </div>

                    {/* ==================================================
                        Contact Form
                    ================================================== */}
                    <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50 sm:p-8 lg:p-10">
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
                                Send a message
                            </p>

                            <h2 className="mt-2 font-serif text-3xl text-chocolate">
                                How can we help?
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-chocolate-soft">
                                Fill out the form below and tell
                                us a little about what you need.
                            </p>
                        </div>

                        <form className="space-y-5">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-chocolate"
                                >
                                    Your Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-chocolate"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label
                                    htmlFor="subject"
                                    className="mb-2 block text-sm font-semibold text-chocolate"
                                >
                                    Subject
                                </label>

                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="How can we help?"
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-semibold text-chocolate"
                                    >
                                        Message
                                    </label>

                                    <span className="text-xs text-chocolate-muted">
                                        We&apos;ll get back to you soon
                                    </span>
                                </div>

                                <textarea
                                    id="message"
                                    name="message"
                                    rows={7}
                                    placeholder="Write your message here..."
                                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-6 text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                            >
                                Send Message
                                <Send className="h-4 w-4" />
                            </button>

                            <p className="text-center text-xs leading-5 text-chocolate-muted">
                                By submitting this form, you agree
                                to be contacted regarding your
                                message.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* ==================================================
                Bottom CTA
            ================================================== */}
            <section className="border-t border-orange-100 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                        Still exploring?
                    </span>

                    <h2 className="mt-3 font-serif text-3xl text-chocolate">
                        Explore our latest collection.
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-chocolate-soft">
                        Discover jackets, sweaters,
                        sweatshirts, and other streetwear
                        essentials designed for everyday style.
                    </p>

                    <a
                        href="/products"
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-chocolate px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                    >
                        Browse Collection
                    </a>
                </div>
            </section>
        </main>
    );
}