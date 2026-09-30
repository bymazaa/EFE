import { LegalLayout, LegalSection } from '@/app/components/legal/LegalLayout';
import { LAST_UPDATED, SITE_CONTACT } from '@/lib/site-contact';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: `Privacy Policy | ${SITE_CONTACT.brandName}`,
    description: `How ${SITE_CONTACT.brandName} collects, uses and protects your information when you shop for streetwear with us.`,
    alternates: { canonical: '/privacy-policy' },
};

const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'information-we-collect', label: 'Information we collect' },
    { id: 'how-we-use-it', label: 'How we use it' },
    { id: 'how-we-share-it', label: 'How we share it' },
    { id: 'payments', label: 'Payments' },
    { id: 'cookies', label: 'Cookies & local storage' },
    { id: 'data-retention', label: 'Data retention' },
    { id: 'your-rights', label: 'Your rights' },
    { id: 'childrens-privacy', label: "Children's privacy" },
    { id: 'changes', label: 'Changes to this policy' },
    { id: 'contact', label: 'Contact us' },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalLayout
            eyebrow="Your trust matters to us"
            title="Privacy Policy"
            intro={`This page explains what information ${SITE_CONTACT.brandName} collects when you shop with us, and how we use, store and protect it.`}
            updatedDate={LAST_UPDATED}
            sections={sections}
        >
            <LegalSection id="overview" heading="Overview">
                <p>
                    {SITE_CONTACT.brandName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                    &ldquo;our&rdquo;) respects your privacy. You can browse and shop
                    our streetwear collection without creating an account. We only ask
                    for the personal information needed to prepare, confirm and deliver
                    your order.
                </p>
            </LegalSection>

            <LegalSection
                id="information-we-collect"
                heading="Information we collect"
            >
                <p>When you place an order, we collect:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>
                        Delivery address (street, city, state, ZIP code, country)
                    </li>
                    <li>
                        Order details (products, sizes, quantities and amounts)
                    </li>
                </ul>

                <p>
                    We do not require an account, and we do not collect a password or
                    store payment card numbers on our servers.
                </p>
            </LegalSection>

            <LegalSection id="how-we-use-it" heading="How we use it">
                <p>We use your information only to:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>Prepare, confirm and deliver your order</li>
                    <li>Contact you about your order if needed</li>
                    <li>Keep accurate order records for accounting and support</li>
                    <li>Improve our products, collections and website</li>
                </ul>

                <p>
                    We do not use your information for automated profiling or targeted
                    advertising.
                </p>
            </LegalSection>

            <LegalSection id="how-we-share-it" heading="How we share it">
                <p>
                    We do not sell, rent or trade your personal information. We share
                    information only where necessary, such as with a delivery courier
                    to ship your order, or when required by law.
                </p>
            </LegalSection>

            <LegalSection id="payments" heading="Payments">
                <p>
                    We do not process card payments directly, and we never see or store
                    your full card details. When online payment is available, it is
                    handled by a trusted third-party payment processor (such as PayPal),
                    and their own privacy policy applies to that transaction. We only
                    store the payment status and a transaction reference for your order.
                </p>
            </LegalSection>

            <LegalSection id="cookies" heading="Cookies & local storage">
                <p>
                    Our shopping cart is stored in your browser (local storage) so your
                    selected streetwear items, sizes and quantities are remembered
                    between visits. This information stays on your device and is not
                    shared with third parties. We use only the minimum technical storage
                    needed for the site to work correctly.
                </p>
            </LegalSection>

            <LegalSection id="data-retention" heading="Data retention">
                <p>
                    We keep order and customer information for as long as needed to
                    fulfil orders, comply with tax and accounting obligations, and
                    resolve any disputes. Older order records may be retained in our
                    systems as historical business records even if a product, size, or
                    collection referenced in that order is later changed or removed.
                </p>
            </LegalSection>

            <LegalSection id="your-rights" heading="Your rights">
                <p>You can contact us at any time to:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>Ask what information we hold about you</li>
                    <li>Request a correction to inaccurate information</li>
                    <li>
                        Request deletion of your information, where we are not legally
                        required to keep it
                    </li>
                </ul>

                <p>
                    To make a request, email us at{' '}
                    <a
                        href={`mailto:${SITE_CONTACT.email}`}
                        className="text-[#E8751A] underline underline-offset-2"
                    >
                        {SITE_CONTACT.email}
                    </a>
                    .
                </p>
            </LegalSection>

            <LegalSection id="childrens-privacy" heading="Children's privacy">
                <p>
                    Our website is not directed at children, and we do not knowingly
                    collect personal information from anyone under the age of 13.
                </p>
            </LegalSection>

            <LegalSection id="changes" heading="Changes to this policy">
                <p>
                    We may update this policy from time to time to reflect changes in
                    our practices. The &ldquo;Last updated&rdquo; date at the top of
                    this page will always show the latest revision.
                </p>
            </LegalSection>

            <LegalSection id="contact" heading="Contact us">
                <p>
                    If you have any questions about this Privacy Policy or your personal
                    information, contact us:
                </p>

                <ul className="list-none space-y-1 pl-0">
                    <li>
                        <span className="text-[#B0703A]">Email: </span>
                        <a
                            href={`mailto:${SITE_CONTACT.email}`}
                            className="text-[#E8751A] underline underline-offset-2"
                        >
                            {SITE_CONTACT.email}
                        </a>
                    </li>

                    <li>
                        <span className="text-[#B0703A]">Phone: </span>
                        <a
                            href={`tel:${SITE_CONTACT.phone}`}
                            className="text-[#4A3626]"
                        >
                            {SITE_CONTACT.phone}
                        </a>
                    </li>

                    <li>
                        <span className="text-[#B0703A]">Address: </span>
                        {SITE_CONTACT.address}
                    </li>
                </ul>

                <p className="pt-2 text-sm text-[#6B4A35]">
                    See also our{' '}
                    <Link
                        href="/terms"
                        className="text-[#E8751A] underline underline-offset-2"
                    >
                        Terms &amp; Conditions
                    </Link>
                    .
                </p>
            </LegalSection>
        </LegalLayout>
    );
}