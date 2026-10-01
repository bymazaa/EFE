import type { Metadata, Viewport } from 'next';

import { Bebas_Neue, DM_Sans } from 'next/font/google';

import { Toaster } from 'sonner';

import './globals.css';

import { PromoPopup } from './components/home/PromoPopup';

/**
 * --------------------------------------------------------------------------
 * SITE CONFIG
 * --------------------------------------------------------------------------
 *
 * Set the real production URL in:
 *
 * NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 *
 * Do NOT include a trailing slash.
 */

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const SITE_NAME = 'Your Brand Name';

const SITE_DESCRIPTION =
    'Shop premium streetwear, jackets, sweaters, sweatshirts, and everyday essentials designed with a modern approach to style, comfort, and quality.';

const SITE_KEYWORDS = [
    'streetwear',
    'streetwear clothing',
    'premium clothing',
    'jackets',
    'sweaters',
    'sweatshirts',
    'hoodies',
    'outerwear',
    'fashion clothing',
    'casual clothing',
    'modern streetwear',
    'online clothing store',
];

/**
 * Add only social URLs that actually belong to your brand.
 */
const SOCIAL_URLS: string[] = [
    // 'https://www.instagram.com/yourbrand',
    // 'https://www.tiktok.com/@yourbrand',
    // 'https://www.facebook.com/yourbrand',
];

/**
 * --------------------------------------------------------------------------
 * FONTS
 * --------------------------------------------------------------------------
 *
 * Bebas Neue:
 * - hero headings
 * - collection headings
 * - product titles
 * - brand statements
 *
 * DM Sans:
 * - body
 * - navigation
 * - buttons
 * - forms
 * - prices
 * - general UI
 */

const bebasNeue = Bebas_Neue({
    subsets: ['latin'],
    variable: '--font-bebas',
    weight: '400',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['400', '500', '600', '700'],
    display: 'swap',
});

/**
 * --------------------------------------------------------------------------
 * METADATA
 * --------------------------------------------------------------------------
 */

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: `${SITE_NAME} | Premium Streetwear & Clothing`,
        template: `%s | ${SITE_NAME}`,
    },

    description: SITE_DESCRIPTION,

    applicationName: SITE_NAME,

    keywords: SITE_KEYWORDS,

    category: 'shopping',

    authors: [
        {
            name: SITE_NAME,
        },
    ],

    creator: SITE_NAME,

    publisher: SITE_NAME,

    /**
     * Canonical URL.
     */
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
     * Open Graph / Facebook / WhatsApp / Messenger.
     *
     * Put this file in:
     *
     * /public/og-image.jpg
     */
    openGraph: {
        type: 'website',

        locale: 'en_US',

        url: SITE_URL,

        siteName: SITE_NAME,

        title: `${SITE_NAME} | Premium Streetwear & Clothing`,

        description: SITE_DESCRIPTION,

        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} premium streetwear collection`,
            },
        ],
    },

    /**
     * X / Twitter.
     */
    twitter: {
        card: 'summary_large_image',

        title: `${SITE_NAME} | Premium Streetwear & Clothing`,

        description: SITE_DESCRIPTION,

        images: ['/og-image.jpg'],
    },

    /**
     * Browser automatic detection.
     */
    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },
};

/**
 * --------------------------------------------------------------------------
 * VIEWPORT
 * --------------------------------------------------------------------------
 */

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#fff8f2',
    colorScheme: 'light',
};

/**
 * --------------------------------------------------------------------------
 * STRUCTURED DATA
 * --------------------------------------------------------------------------
 *
 * OnlineStore is appropriate for an ecommerce clothing business.
 *
 * Product structured data should be added separately to individual
 * product pages, because those pages contain the actual product,
 * price and availability information.
 */

const jsonLd = {
    '@context': 'https://schema.org',

    '@graph': [
        {
            '@type': 'OnlineStore',

            '@id': `${SITE_URL}/#organization`,

            name: SITE_NAME,

            url: SITE_URL,

            description: SITE_DESCRIPTION,

            logo: {
                '@type': 'ImageObject',

                url: `${SITE_URL}/logo.png`,
            },

            image: `${SITE_URL}/og-image.jpg`,

            sameAs: SOCIAL_URLS,
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

/**
 * --------------------------------------------------------------------------
 * ROOT LAYOUT
 * --------------------------------------------------------------------------
 */

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${bebasNeue.variable} ${dmSans.variable}`}
        >
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />
            </head>

            <body className="font-sans antialiased">
                {children}

                <PromoPopup />

                <Toaster
                    position="top-right"
                    duration={3000}
                    toastOptions={{
                        style: {
                            background: 'var(--color-surface)',
                            color: 'var(--color-chocolate)',
                            border: '1px solid var(--color-border)',
                            boxShadow:
                                '0 2px 8px -2px rgb(0 0 0 / 0.08)',
                            fontSize: '13px',
                            padding: '10px 14px',
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