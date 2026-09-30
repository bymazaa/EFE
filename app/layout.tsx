import type { Metadata, Viewport } from 'next';

import { Fraunces, Inter } from 'next/font/google';

import { Toaster } from 'sonner';

import './globals.css';
import { PromoPopup } from './components/home/PromoPopup';

const SITE_URL = 'https://www.quietflame.shop';

const FACEBOOK_URL =
    'https://www.facebook.com/p/Quite-Flame-61594366916853';

const SITE_NAME = 'Quiet Flame Co.';

const SITE_DESCRIPTION =
    'Hand-poured soy candles made in small batches with premium wax, thoughtful fragrances, and timeless warmth for everyday moments.';

/**
 * Display serif for headings.
 */
const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
    weight: ['500', '600'],
    style: ['normal', 'italic'],
    display: 'swap',
});

/**
 * Clean sans-serif for body text and admin UI.
 */
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['400', '500', '600'],
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default:
            'Quiet Flame Co. | Hand-Poured Soy Candles',
        template: '%s | Quiet Flame Co.',
    },

    description: SITE_DESCRIPTION,

    applicationName: SITE_NAME,

    authors: [
        {
            name: SITE_NAME,
            url: SITE_URL,
        },
    ],

    creator: SITE_NAME,
    publisher: SITE_NAME,

    keywords: [
        'Quiet Flame Co.',
        'hand-poured candles',
        'soy candles',
        'handmade candles',
        'scented candles',
        'aromatherapy candles',
        'premium candles',
        'soy wax candles',
        'candles online',
    ],

    category: 'shopping',

    alternates: {
        canonical: '/',
    },

    /**
     * Search engine crawling.
     */
    robots: {
        index: true,
        follow: true,

        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },

    /**
     * Open Graph / Facebook sharing preview.
     */
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: SITE_URL,
        siteName: SITE_NAME,

        title:
            'Quiet Flame Co. | Hand-Poured Soy Candles',

        description: SITE_DESCRIPTION,

        images: [
            {
                url: '/candle2.jpg',
                width: 1200,
                height: 630,
                alt: 'Quiet Flame Co. handcrafted soy candle',
            },
            {
                url: '/candle6.jpg',
                width: 1200,
                height: 630,
                alt: 'Quiet Flame Co. scented candle',
            },
            {
                url: '/candle8.jpg',
                width: 1200,
                height: 630,
                alt: 'Quiet Flame Co. handmade candle',
            },
        ],
    },

    /**
     * X / Twitter preview.
     */
    twitter: {
        card: 'summary_large_image',

        title:
            'Quiet Flame Co. | Hand-Poured Soy Candles',

        description: SITE_DESCRIPTION,

        images: ['/candle2.jpg'],
    },

    /**
     * Browser metadata.
     */
    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#fff8f2',
    colorScheme: 'light',
};

/**
 * Organization + Website structured data.
 *
 * This helps search engines understand:
 * - the brand
 * - the website
 * - the official Facebook profile
 */
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',

            '@id': `${SITE_URL}/#organization`,

            name: SITE_NAME,

            url: SITE_URL,

            description: SITE_DESCRIPTION,

            image: [
                `${SITE_URL}/candle2.jpg`,
                `${SITE_URL}/candle6.jpg`,
                `${SITE_URL}/candle8.jpg`,
            ],

            sameAs: [FACEBOOK_URL],
        },

        {
            '@type': 'WebSite',

            '@id': `${SITE_URL}/#website`,

            url: SITE_URL,

            name: SITE_NAME,

            description: SITE_DESCRIPTION,

            publisher: {
                '@id': `${SITE_URL}/#organization`,
            },

            inLanguage: 'en',
        },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${fraunces.variable} ${inter.variable}`}
        >
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            jsonLd,
                        ),
                    }}
                />
            </head>

            <body className="font-sans antialiased">
                {children}
          <Toaster
                    position="top-right"
                    duration={3000}
                    toastOptions={{
                        style: {
                            background:
                                'var(--color-surface)',
                            color:
                                'var(--color-chocolate)',
                            border:
                                '1px solid var(--color-border)',
                            boxShadow:
                                '0 2px 8px -2px rgb(0 0 0 / 0.08)',
                            fontSize: '13px',
                            padding:
                                '10px 14px',
                            width: '280px',
                        },

                        classNames: {
                            success:
                                'border-l-2 !border-l-status-delivered',

                            error:
                                'border-l-2 !border-l-status-cancelled',
                        },
                    }}
                />
            </body>
        </html>
    );
}