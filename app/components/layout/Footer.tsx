import Link from 'next/link';

import {
    Mail,
    Phone,
    MapPin,
} from 'lucide-react';

import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaWhatsapp,
} from 'react-icons/fa';

import type {
    SiteSettingsDTO,
} from '@/services/settings.service';

const NAV_LINKS = [
    {
        href: '/',
        label: 'Home',
    },
    {
        href: '/products',
        label: 'Products',
    },
    {
        href: '/about',
        label: 'About',
    },
    {
        href: '/contact',
        label: 'Contact',
    },
] as const;

const SOCIAL_LINKS = [
    {
        key: 'facebook',
        label: 'Facebook',
        icon: FaFacebookF,
    },
    {
        key: 'instagram',
        label: 'Instagram',
        icon: FaInstagram,
    },
    {
        key: 'twitter',
        label: 'Twitter',
        icon: FaTwitter,
    },
] as const;

/* ============================================================
   WhatsApp
============================================================ */

function getWhatsAppHref(
    value: string,
): string {
    const input = value.trim();

    if (!input) {
        return '';
    }

    // If a complete WhatsApp URL was already saved,
    // keep it working.
    if (
        input.startsWith('https://wa.me/') ||
        input.startsWith('http://wa.me/') ||
        input.startsWith('https://api.whatsapp.com/')
    ) {
        return input;
    }

    // Keep digits only.
    let phone = input.replace(/\D/g, '');

    if (!phone) {
        return '';
    }

    // Bangladesh local format:
    // 017XXXXXXXX -> 88017XXXXXXXX
    if (phone.startsWith('01')) {
        phone = `880${phone.slice(1)}`;
    }
    // International Bangladesh format:
    // 88017XXXXXXXX -> unchanged
    else if (phone.startsWith('880')) {
        // Already normalized.
    }
    // Generic international number without +:
    // leave as provided.
    
    return `https://wa.me/${phone}`;
}

export function Footer({
    settings,
}: {
    settings: SiteSettingsDTO;
}) {
    const year = new Date().getFullYear();

    const activeSocial = SOCIAL_LINKS.filter(
        ({ key }) => settings.social[key],
    );

    const whatsappHref =
        getWhatsAppHref(
            settings.social.whatsapp,
        );

    return (
        <footer className="border-t border-border bg-surface-muted">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* =================================================
                        Brand
                    ================================================= */}

                    <div className="sm:col-span-2 lg:col-span-1">
                        <span className="font-serif text-xl text-chocolate">
                            {settings.brandName}
                        </span>

                        {settings.description ? (
                            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-chocolate-soft">
                                {
                                    settings.description
                                }
                            </p>
                        ) : null}

                        {(activeSocial.length >
                            0 ||
                            whatsappHref) ? (
                            <div className="mt-5 flex items-center gap-2">
                                {activeSocial.map(
                                    ({
                                        key,
                                        label,
                                        icon: Icon,
                                    }) => (
                                        <a
                                            key={key}
                                            href={
                                                settings
                                                    .social[
                                                    key
                                                ]
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={
                                                label
                                            }
                                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-chocolate-soft transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    ),
                                )}

                                {whatsappHref ? (
                                    <a
                                        href={
                                            whatsappHref
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="WhatsApp"
                                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-chocolate-soft transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <FaWhatsapp className="h-4 w-4" />
                                    </a>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    {/* =================================================
                        Navigation
                    ================================================= */}

                    <div>
                        <p className="text-[13px] font-medium uppercase tracking-wide text-chocolate-muted">
                            Explore
                        </p>

                        <ul className="mt-3 space-y-2.5">
                            {NAV_LINKS.map(
                                ({
                                    href,
                                    label,
                                }) => (
                                    <li
                                        key={href}
                                    >
                                        <Link
                                            href={
                                                href
                                            }
                                            className="cursor-pointer text-[13px] text-chocolate-soft transition-colors hover:text-chocolate"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>

                    {/* =================================================
                        Contact
                    ================================================= */}

                    <div>
                        <p className="text-[13px] font-medium uppercase tracking-wide text-chocolate-muted">
                            Contact
                        </p>

                        <ul className="mt-3 space-y-2.5">
                            {settings.email ? (
                                <li className="flex items-start gap-2 text-[13px] text-chocolate-soft">
                                    <Mail
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                        strokeWidth={
                                            1.75
                                        }
                                    />

                                    <a
                                        href={`mailto:${settings.email}`}
                                        className="cursor-pointer transition-colors hover:text-chocolate"
                                    >
                                        {
                                            settings.email
                                        }
                                    </a>
                                </li>
                            ) : null}

                            {settings.phone ? (
                                <li className="flex items-start gap-2 text-[13px] text-chocolate-soft">
                                    <Phone
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                        strokeWidth={
                                            1.75
                                        }
                                    />

                                    <a
                                        href={`tel:${settings.phone}`}
                                        className="cursor-pointer transition-colors hover:text-chocolate"
                                    >
                                        {
                                            settings.phone
                                        }
                                    </a>
                                </li>
                            ) : null}

                            {settings.address ? (
                                <li className="flex items-start gap-2 text-[13px] text-chocolate-soft">
                                    <MapPin
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                        strokeWidth={
                                            1.75
                                        }
                                    />

                                    <span>
                                        {
                                            settings.address
                                        }
                                    </span>
                                </li>
                            ) : null}
                        </ul>
                    </div>

                    {/* =================================================
                        Legal
                    ================================================= */}

                    <div>
                        <p className="text-[13px] font-medium uppercase tracking-wide text-chocolate-muted">
                            Legal
                        </p>

                        <ul className="mt-3 space-y-2.5">
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="cursor-pointer text-[13px] text-chocolate-soft transition-colors hover:text-chocolate"
                                >
                                    Privacy Policy
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/terms"
                                    className="cursor-pointer text-[13px] text-chocolate-soft transition-colors hover:text-chocolate"
                                >
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* =====================================================
                    Copyright
                ===================================================== */}

                <div className="mt-10 border-t border-border pt-6 text-center text-xs text-chocolate-muted">
                    © {year} {settings.brandName}.
                    All rights reserved.
                </div>
            </div>
        </footer>
    );
}