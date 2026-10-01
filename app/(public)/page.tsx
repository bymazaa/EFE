export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { getSettings } from "@/services/settings.service";
import { Hero } from "@/app/components/home/Hero";
import { WhyChooseUs } from "../components/home/WhyChoosUs";
import { BrandAbout } from "../components/home/About";
import { FinalCTA } from "../components/home/CTA";
import { FeaturedProducts } from "../components/home/FeaturedProducts";

export const metadata: Metadata = {
    title: 'Hand-Poured Soy Candles',
    description:
        'Discover handcrafted soy candles from Quiet Flame Co., made in small batches with premium fragrances for everyday moments.',

    alternates: {
        canonical: '/',
    },

    openGraph: {
        title: 'Quiet Flame Co. | Hand-Poured Soy Candles',
        description:
            'Handcrafted soy candles made in small batches with premium fragrances and thoughtful craftsmanship.',
        url: '/',
        images: [
            {
                url: '/candle2.jpg',
                width: 1200,
                height: 630,
                alt: 'Quiet Flame Co. handcrafted soy candle',
            },
        ],
    },
};
export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <Hero brandName={settings.brandName} />
      <FeaturedProducts/>
      {/* Featured Products, Brand/About, Why Choose Us, and CTA sections come next */}
      <WhyChooseUs/>
      <BrandAbout brandName={settings.brandName}/>
      <FinalCTA brandName={settings.brandName} />
    </>
  );
}