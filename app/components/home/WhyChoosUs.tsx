import {
    Gem,
    Scissors,
    Shirt,
    Sparkles,
} from 'lucide-react';

const FEATURES = [
    {
        title: 'Premium Fabrics',
        description:
            'Made with premium wool and quality fabrics for a soft feel and lasting comfort.',
        icon: Gem,
    },
    {
        title: 'Limited Batches',
        description:
            'Every piece is produced in limited batches with attention to detail and finish.',
        icon: Shirt,
    },
    {
        title: 'Modern Streetwear Fit',
        description:
            'Unisex cuts and designs made to move with you, from morning to night.',
        icon: Sparkles,
    },
    {
        title: 'Made with Care',
        description:
            'From the first stitch to the final package, every piece is made with intention.',
        icon: Scissors,
    },
] as const;

export function WhyChooseUs() {
    return (
        <section className="relative overflow-hidden border-b border-orange-100 bg-white">
            {/* Soft decorative background */}
            <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-orange-100/50 blur-3xl" />

            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                        Why Choose Us
                    </span>

                    <h2 className="mt-5 font-serif text-3xl leading-tight text-chocolate sm:text-4xl">
                        Thoughtfully designed for
                        <span className="text-orange-600">
                            {' '}everyday style
                        </span>
                    </h2>

                    <p className="mt-4 text-[15px] leading-7 text-chocolate-soft">
                        We believe great streetwear should feel
                        as good as it looks. That&apos;s why every
                        detail matters.
                    </p>
                </div>

                {/* Features */}
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(
                        ({
                            title,
                            description,
                            icon: Icon,
                        }) => (
                            <div
                                key={title}
                                className="group rounded-3xl border border-orange-100 bg-[#fffaf6] p-6 shadow-2xl shadow-gray-50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-xl"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-2xl shadow-gray-50 ring-1 ring-orange-100 transition-transform duration-300 group-hover:scale-105">
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

                {/* Bottom statement */}
                <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-orange-100 bg-orange-50/70 px-6 py-5 text-center shadow-2xl shadow-gray-50 sm:px-8">
                    <p className="text-sm leading-6 text-chocolate-soft">
                        <span className="font-semibold text-chocolate">
                            Crafted with intention.
                        </span>{' '}
                        Designed to bring a little more confidence,
                        comfort, and style into your everyday wardrobe.
                    </p>
                </div>
            </div>
        </section>
    );
}