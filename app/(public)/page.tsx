export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { getSettings } from "@/services/settings.service";
import { Hero } from "@/app/components/home/Hero";
import { WhyChooseUs } from "../components/home/WhyChoosUs";
import { BrandAbout } from "../components/home/About";
import { FinalCTA } from "../components/home/CTA";
import { FeaturedProducts } from "../components/home/FeaturedProducts";

export const metadata: Metadata = {
    title: 'Premium Streetwear & Clothing',

    description:
        'Discover premium streetwear essentials, jackets, sweaters, sweatshirts, and modern clothing designed for everyday style and comfort.',

    alternates: {
        canonical: '/',
    },

    openGraph: {
        title: 'EFE Apparel | Premium Streetwear & Clothing',

        description:
            'Explore jackets, sweaters, sweatshirts, and modern streetwear essentials designed for everyday style.',

        url: '/',

        images: [
            {
                url: '/EFE Heritage Wool Jacket new.webp',
                width: 1200,
                height: 630,
                alt: 'EFE Apparel Heritage Wool Jacket',
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