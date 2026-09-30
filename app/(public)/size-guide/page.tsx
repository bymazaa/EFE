import type { Metadata } from 'next';

import { Ruler, Shirt, MoveVertical } from 'lucide-react';

import { SITE_CONTACT } from '@/lib/site-contact';

export const metadata: Metadata = {
    title: `Size Guide | ${SITE_CONTACT.brandName}`,
    description: `Find the right fit with our sweatshirt and jacket size guide, including chest, waist, hip, sleeve and length measurements.`,
    alternates: {
        canonical: '/size-guide',
    },
};

const sweatshirtSizes = [
    {
        size: 'M',
        chest: '38–40',
        waist: '32–34',
        hip: '38–40',
        length: '28',
    },
    {
        size: 'L',
        chest: '42–44',
        waist: '36–38',
        hip: '42–44',
        length: '29',
    },
    {
        size: 'XL',
        chest: '46–48',
        waist: '40–42',
        hip: '46–48',
        length: '30',
    },
    {
        size: '2XL',
        chest: '50–52',
        waist: '44–46',
        hip: '50–52',
        length: '31',
    },
    {
        size: '3XL',
        chest: '54–56',
        waist: '48–50',
        hip: '54–56',
        length: '32',
    },
    {
        size: '4XL',
        chest: '58–60',
        waist: '52–54',
        hip: '58–60',
        length: '33',
    },
    {
        size: '5XL',
        chest: '62–64',
        waist: '56–58',
        hip: '62–64',
        length: '34',
    },
];

const jacketSizes = [
    {
        size: 'M',
        chest: '38–40',
        waist: '32–34',
        hip: '38–40',
        sleeve: '33.5',
        jacket: '26.5',
    },
    {
        size: 'L',
        chest: '42–44',
        waist: '36–38',
        hip: '42–44',
        sleeve: '34.5',
        jacket: '27.5',
    },
    {
        size: 'XL',
        chest: '46–48',
        waist: '40–42',
        hip: '46–48',
        sleeve: '35.5',
        jacket: '28.5',
    },
    {
        size: '2XL',
        chest: '50–52',
        waist: '44–46',
        hip: '50–52',
        sleeve: '36.25',
        jacket: '29.5',
    },
    {
        size: '3XL',
        chest: '54–56',
        waist: '48–50',
        hip: '54–56',
        sleeve: '37.0',
        jacket: '30.5',
    },
    {
        size: '4XL',
        chest: '58–60',
        waist: '52–54',
        hip: '58–60',
        sleeve: '37.75',
        jacket: '31.5',
    },
    {
        size: '5XL',
        chest: '62–64',
        waist: '56–58',
        hip: '62–64',
        sleeve: '38.5',
        jacket: '32.5',
    },
];

export default function SizeGuidePage() {
    return (
        <main className="min-h-screen bg-[#fff8f2]">
            {/* ================================================== */}
            {/* Header */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-white">
                <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
                    <span className="inline-flex rounded-full border border-orange-200 bg-[#fff8f2] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700 shadow-sm">
                        Find Your Fit
                    </span>

                    <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-chocolate sm:text-5xl">
                        Size Guide
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-chocolate-soft sm:text-base">
                        Finding the perfect fit is essential. Use a measuring
                        tape and follow the guide below to choose the size
                        that feels right for you.
                    </p>
                </div>
            </section>

            {/* ================================================== */}
            {/* How to Measure */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-[#fff8f2]">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                            How to Measure
                        </span>

                        <h2 className="mt-4 font-serif text-3xl text-chocolate sm:text-4xl">
                            Get your measurements right
                        </h2>

                        <p className="mt-4 text-[15px] leading-7 text-chocolate-soft">
                            Take your measurements while standing naturally
                            and keep the measuring tape comfortably snug,
                            not too tight.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {/* Bust */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                <Ruler
                                    className="h-5 w-5"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h3 className="mt-5 font-serif text-xl text-chocolate">
                                Bust
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                Finding the perfect fit is essential. Use a
                                measuring tape around the fullest part of your
                                bust and keep the tape level.
                            </p>
                        </div>

                        {/* Waist */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                <Shirt
                                    className="h-5 w-5"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h3 className="mt-5 font-serif text-xl text-chocolate">
                                Waist
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                Measure the narrowest part of your waistline
                                while keeping the measuring tape comfortable.
                            </p>
                        </div>

                        {/* Hips */}
                        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-gray-50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                <MoveVertical
                                    className="h-5 w-5"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h3 className="mt-5 font-serif text-xl text-chocolate">
                                Hips
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-chocolate-soft">
                                Measure the fullest part of your hips while
                                standing naturally with your feet together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Sweatshirt Size Chart */}
            {/* ================================================== */}

            <section className="border-b border-orange-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                            Size Chart
                        </span>

                        <h2 className="mt-3 font-serif text-3xl text-chocolate sm:text-4xl">
                            Sweatshirt Size Chart
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-chocolate-soft">
                            All measurements are in inches.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-xl shadow-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#dbc09b]">
                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Size
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Chest (inches)
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Waist (inches)
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Hip (inches)
                                        </th>

                                        <th className="px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Length (inches)
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sweatshirtSizes.map((item) => (
                                        <tr
                                            key={item.size}
                                            className="border-t border-orange-900/30 transition hover:bg-[#fff8f2]"
                                        >
                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-bold text-[#5a3924]">
                                                {item.size}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.chest}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.waist}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.hip}
                                            </td>

                                            <td className="px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.length}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Jacket Size Chart */}
            {/* ================================================== */}

            <section className="bg-[#fff8f2]">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mb-8">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                            Size Chart
                        </span>

                        <h2 className="mt-3 font-serif text-3xl text-chocolate sm:text-4xl">
                            Jacket Size Chart
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-chocolate-soft">
                            All measurements are in inches.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-xl shadow-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#dbc09b]">
                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Size
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Chest (inches)
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Waist (inches)
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Hip (inches)
                                        </th>

                                        <th className="border-r border-orange-900/40 px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Sleeve Length
                                            <span className="block text-xs">
                                                (inches)
                                            </span>
                                        </th>

                                        <th className="px-5 py-4 text-center text-sm font-bold text-[#5a3924] sm:text-base">
                                            Jacket Length
                                            <span className="block text-xs">
                                                (inches)
                                            </span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jacketSizes.map((item) => (
                                        <tr
                                            key={item.size}
                                            className="border-t border-orange-900/30 transition hover:bg-[#fff8f2]"
                                        >
                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-bold text-[#5a3924]">
                                                {item.size}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.chest}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.waist}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.hip}
                                            </td>

                                            <td className="border-r border-orange-900/30 px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.sleeve}
                                            </td>

                                            <td className="px-5 py-4 text-center font-semibold text-[#5a3924]">
                                                {item.jacket}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================== */}
            {/* Fit Note */}
            {/* ================================================== */}

            <section className="bg-white">
                <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
                    <p className="text-sm leading-7 text-chocolate-soft">
                        Measurements are intended as a general sizing guide.
                        For the best fit, compare your body measurements with
                        the chart above before placing your order.
                    </p>
                </div>
            </section>
        </main>
    );
}