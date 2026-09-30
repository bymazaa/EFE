'use client';

import { useRouter } from 'next/navigation';

import {
    updateSettings,
} from '@/app/admin/(dashboard)/settings/actions';

import { DEFAULT_CURRENCY } from '@/lib/constants';

import type { SiteSettingsDTO } from '@/services/settings.service';

import {
    Globe2,
    Link2,
    MapPin,
    Save,
    Store,
    Truck,
} from 'lucide-react';

import {
    SiFacebook,
    SiInstagram,
    SiWhatsapp,
    SiX,
} from 'react-icons/si';

import {
    useState,
    useTransition,
    type FormEvent,
    type ReactNode,
} from 'react';

import { toast } from 'sonner';

/* ============================================================
   Types
============================================================ */

type FormState = Omit<
    SiteSettingsDTO,
    'updatedAt'
>;

/* ============================================================
   Helpers
============================================================ */

function toFormState(
    dto: SiteSettingsDTO,
): FormState {
    const {
        brandName,
        description,
        logoUrl,
        address,
        shippingCost,
        websiteUrl,
        phone,
        email,
        social,
    } = dto;

    return {
        brandName,
        description,
        logoUrl,
        address,
        shippingCost,
        websiteUrl,
        phone,
        email,
        social,
    };
}

type ActionResultWithErrors = {
    success: boolean;
    error?: string;
    data?: unknown;
    fieldErrors?: Record<string, string[]>;
};

function extractFieldErrors(
    result: ActionResultWithErrors,
): Record<string, string> {
    if (!result.fieldErrors) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(result.fieldErrors).map(
            ([key, messages]) => [
                key,
                messages[0] ?? 'Invalid value.',
            ],
        ),
    );
}

/* ============================================================
   Props
============================================================ */

interface SettingsFormProps {
    initialSettings: SiteSettingsDTO;
}

/* ============================================================
   Main Form
============================================================ */

export default function SettingsForm({
    initialSettings,
}: SettingsFormProps) {
    const router = useRouter();

    const [form, setForm] =
        useState<FormState>(() =>
            toFormState(initialSettings),
        );

    const [isPending, startTransition] =
        useTransition();

    const [fieldErrors, setFieldErrors] =
        useState<Record<string, string>>({});

    /* ========================================================
       Normal field setter
    ======================================================== */

    function set<K extends keyof FormState>(
        key: K,
        value: FormState[K],
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (fieldErrors[key as string]) {
            setFieldErrors((prev) => {
                const next = {
                    ...prev,
                };

                delete next[key as string];

                return next;
            });
        }
    }

    /* ========================================================
       Social field setter
    ======================================================== */

    function setSocial(
        key: keyof FormState['social'],
        value: string,
    ) {
        setForm((prev) => ({
            ...prev,
            social: {
                ...prev.social,
                [key]: value,
            },
        }));

        const fieldKey =
            `social.${String(key)}`;

        if (fieldErrors[fieldKey]) {
            setFieldErrors((prev) => {
                const next = {
                    ...prev,
                };

                delete next[fieldKey];

                return next;
            });
        }
    }

    /* ========================================================
       Submit
    ======================================================== */
function handleSubmit(
    event: FormEvent<HTMLFormElement>,
) {
    event.preventDefault();

    setFieldErrors({});

    startTransition(async () => {
        const result =
            (await updateSettings(form)) as ActionResultWithErrors;

        if (!result.success) {
            const errors =
                extractFieldErrors(result);

            setFieldErrors(errors);

            toast.error(
                result.error ??
                    'Could not save settings.',
                {
                    description:
                        'Please check the highlighted fields and try again.',
                },
            );

            return;
        }
        
        toast.success(
           
                'Settings saved successfully.',
        );

        if (result.data) {
            setForm(
                toFormState(
                    result.data as SiteSettingsDTO,
                ),
            );
        }

        router.refresh();
    });
}
    const initial =
        form.brandName
            .trim()
            .charAt(0)
            .toUpperCase() || 'S';

    return (
        <div className="w-full max-w-6xl">
            <form
                onSubmit={handleSubmit}
                className="w-full"
                noValidate
            >
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">

                    {/* =====================================================
                        Header
                    ===================================================== */}

                    <div className="border-b border-orange-100 bg-[#fffaf6] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex min-w-0 items-center gap-3.5">
                                <LogoPreview
                                    key={form.logoUrl}
                                    url={form.logoUrl}
                                    fallbackLetter={initial}
                                />

                                <div className="min-w-0">
                                    <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                                        <Store className="h-3 w-3" />

                                        Store settings
                                    </div>

                                    <h1 className="truncate text-lg font-semibold tracking-tight text-chocolate sm:text-xl">
                                        {form.brandName ||
                                            'Your store'}
                                    </h1>

                                    <p className="mt-0.5 line-clamp-2 max-w-xl text-xs leading-5 text-chocolate-muted sm:text-sm">
                                        {form.description ||
                                            'Manage your storefront information, contact details, social links and shipping settings.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex w-fit items-center gap-2 rounded-xl border border-amber-200/70 bg-white px-3 py-2.5 shadow-sm">
                                <Globe2 className="h-4 w-4 text-amber-600" />

                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-chocolate-muted">
                                        Storefront
                                    </p>

                                    <p className="text-xs font-semibold text-chocolate">
                                        Configuration
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* =====================================================
                        General
                    ===================================================== */}

                    <Section
                        icon={
                            <Store className="h-4 w-4" />
                        }
                        title="General"
                        description="Your store identity displayed across the storefront and search results."
                    >
                        <div className="space-y-5">

                            <Field
                                label="Brand name"
                                htmlFor="brandName"
                                error={
                                    fieldErrors.brandName
                                }
                            >
                                <input
                                    id="brandName"
                                    name="brandName"
                                    type="text"
                                    value={
                                        form.brandName
                                    }
                                    onChange={(event) =>
                                        set(
                                            'brandName',
                                            event.target
                                                .value,
                                        )
                                    }
                                    autoComplete="organization"
                                    required
                                    disabled={isPending}
                                    aria-invalid={Boolean(
                                        fieldErrors.brandName,
                                    )}
                                    aria-describedby={
                                        fieldErrors.brandName
                                            ? 'brandName-feedback'
                                            : undefined
                                    }
                                    className={`${inputClass} ${
                                        fieldErrors.brandName
                                            ? errorInputClass
                                            : ''
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                />
                            </Field>

                            <Field
                                label="Description"
                                htmlFor="description"
                                hint="Used as the meta description for search engines."
                                error={
                                    fieldErrors.description
                                }
                            >
                                <div className="relative">
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={(event) =>
                                            set(
                                                'description',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        rows={4}
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.description,
                                        )}
                                        aria-describedby={
                                            fieldErrors.description
                                                ? 'description-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.description
                                                ? errorInputClass
                                                : ''
                                        } min-h-[112px] resize-y leading-6 disabled:cursor-not-allowed disabled:opacity-60`}
                                    />

                                    <span className="pointer-events-none absolute bottom-2.5 right-3 text-[10px] text-slate-400">
                                        {
                                            form
                                                .description
                                                .length
                                        }
                                    </span>
                                </div>
                            </Field>

                            <Field
                                label="Logo URL"
                                htmlFor="logoUrl"
                                hint="Paste a direct image URL for your storefront logo."
                                error={
                                    fieldErrors.logoUrl
                                }
                            >
                                <div className="relative">
                                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="logoUrl"
                                        name="logoUrl"
                                        type="url"
                                        value={
                                            form.logoUrl
                                        }
                                        onChange={(event) =>
                                            set(
                                                'logoUrl',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="https://example.com/logo.png"
                                        autoComplete="url"
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.logoUrl,
                                        )}
                                        aria-describedby={
                                            fieldErrors.logoUrl
                                                ? 'logoUrl-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.logoUrl
                                                ? errorInputClass
                                                : ''
                                        } pl-9 disabled:cursor-not-allowed disabled:opacity-60`}
                                    />
                                </div>
                            </Field>

                        </div>
                    </Section>

                    {/* =====================================================
                        Contact
                    ===================================================== */}

                    <Section
                        icon={
                            <MapPin className="h-4 w-4" />
                        }
                        title="Contact"
                        description="Information customers can use to contact your store."
                    >
                        <div className="space-y-5">

                            <Field
                                label="Address"
                                htmlFor="address"
                                error={
                                    fieldErrors.address
                                }
                            >
                                <div className="relative">
                                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={
                                            form.address
                                        }
                                        onChange={(event) =>
                                            set(
                                                'address',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        autoComplete="street-address"
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.address,
                                        )}
                                        aria-describedby={
                                            fieldErrors.address
                                                ? 'address-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.address
                                                ? errorInputClass
                                                : ''
                                        } pl-9 disabled:cursor-not-allowed disabled:opacity-60`}
                                    />
                                </div>
                            </Field>

                            <Field
                                label="Website"
                                htmlFor="websiteUrl"
                                error={
                                    fieldErrors.websiteUrl
                                }
                            >
                                <div className="relative">
                                    <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="websiteUrl"
                                        name="websiteUrl"
                                        type="url"
                                        value={
                                            form.websiteUrl
                                        }
                                        onChange={(event) =>
                                            set(
                                                'websiteUrl',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="https://example.com"
                                        autoComplete="url"
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.websiteUrl,
                                        )}
                                        aria-describedby={
                                            fieldErrors.websiteUrl
                                                ? 'websiteUrl-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.websiteUrl
                                                ? errorInputClass
                                                : ''
                                        } pl-9 disabled:cursor-not-allowed disabled:opacity-60`}
                                    />
                                </div>
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <Field
                                    label="Phone"
                                    htmlFor="phone"
                                    error={
                                        fieldErrors.phone
                                    }
                                >
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={
                                            form.phone
                                        }
                                        onChange={(event) =>
                                            set(
                                                'phone',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        autoComplete="tel"
                                        inputMode="tel"
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.phone,
                                        )}
                                        aria-describedby={
                                            fieldErrors.phone
                                                ? 'phone-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.phone
                                                ? errorInputClass
                                                : ''
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                    />
                                </Field>

                                <Field
                                    label="Email"
                                    htmlFor="email"
                                    error={
                                        fieldErrors.email
                                    }
                                >
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={(event) =>
                                            set(
                                                'email',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        autoComplete="email"
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.email,
                                        )}
                                        aria-describedby={
                                            fieldErrors.email
                                                ? 'email-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.email
                                                ? errorInputClass
                                                : ''
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                    />
                                </Field>

                            </div>
                        </div>
                    </Section>

                    {/* =====================================================
                        Social
                    ===================================================== */}

                    <Section
                        icon={
                            <Link2 className="h-4 w-4" />
                        }
                        title="Social links"
                        description="Optional. Leave a field blank to keep that social link hidden."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">

                            <SocialField
                                icon={
                                    <SiFacebook className="h-4 w-4" />
                                }
                                label="Facebook"
                                htmlFor="facebook"
                                value={
                                    form.social.facebook
                                }
                                placeholder="https://facebook.com/..."
                                disabled={isPending}
                                error={
                                    fieldErrors[
                                        'social.facebook'
                                    ]
                                }
                                onChange={(value) =>
                                    setSocial(
                                        'facebook',
                                        value,
                                    )
                                }
                            />

                            <SocialField
                                icon={
                                    <SiInstagram className="h-4 w-4" />
                                }
                                label="Instagram"
                                htmlFor="instagram"
                                value={
                                    form.social.instagram
                                }
                                placeholder="https://instagram.com/..."
                                disabled={isPending}
                                error={
                                    fieldErrors[
                                        'social.instagram'
                                    ]
                                }
                                onChange={(value) =>
                                    setSocial(
                                        'instagram',
                                        value,
                                    )
                                }
                            />

                            <SocialField
                                icon={
                                    <SiWhatsapp className="h-4 w-4" />
                                }
                                label="WhatsApp"
                                htmlFor="whatsapp"
                                value={
                                    form.social.whatsapp
                                }
                                placeholder="https://wa.me/..."
                                disabled={isPending}
                                error={
                                    fieldErrors[
                                        'social.whatsapp'
                                    ]
                                }
                                onChange={(value) =>
                                    setSocial(
                                        'whatsapp',
                                        value,
                                    )
                                }
                            />

                            <SocialField
                                icon={
                                    <SiX className="h-4 w-4" />
                                }
                                label="X / Twitter"
                                htmlFor="twitter"
                                value={
                                    form.social.twitter
                                }
                                placeholder="https://x.com/..."
                                disabled={isPending}
                                error={
                                    fieldErrors[
                                        'social.twitter'
                                    ]
                                }
                                onChange={(value) =>
                                    setSocial(
                                        'twitter',
                                        value,
                                    )
                                }
                            />

                        </div>
                    </Section>

                    {/* =====================================================
                        Shipping
                    ===================================================== */}

                    <Section
                        icon={
                            <Truck className="h-4 w-4" />
                        }
                        title="Shipping"
                        description="Default shipping cost automatically applied during checkout."
                    >
                        <Field
                            label="Shipping cost"
                            htmlFor="shippingCost"
                            error={
                                fieldErrors.shippingCost
                            }
                        >
                            <div className="w-full sm:max-w-sm">
                                <div className="relative">

                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-amber-700">
                                        {DEFAULT_CURRENCY ===
                                        'USD'
                                            ? '$'
                                            : DEFAULT_CURRENCY}
                                    </span>

                                    <input
                                        id="shippingCost"
                                        name="shippingCost"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        inputMode="decimal"
                                        value={
                                            form.shippingCost
                                        }
                                        onChange={(event) =>
                                            set(
                                                'shippingCost',
                                                Number(
                                                    event.target
                                                        .value,
                                                ),
                                            )
                                        }
                                        disabled={isPending}
                                        aria-invalid={Boolean(
                                            fieldErrors.shippingCost,
                                        )}
                                        aria-describedby={
                                            fieldErrors.shippingCost
                                                ? 'shippingCost-feedback'
                                                : undefined
                                        }
                                        className={`${inputClass} ${
                                            fieldErrors.shippingCost
                                                ? errorInputClass
                                                : ''
                                        } pl-8 font-medium disabled:cursor-not-allowed disabled:opacity-60`}
                                    />

                                </div>
                            </div>
                        </Field>

                        <div className="mt-4 rounded-xl border border-orange-100 bg-[#fffaf6] p-3.5">
                            <p className="text-xs font-medium leading-5 text-chocolate-soft">
                                This amount will be used as
                                the default shipping charge
                                during checkout.
                            </p>
                        </div>
                    </Section>

                    {/* =====================================================
                        Save Footer
                    ===================================================== */}

                    <div className="border-t border-orange-100 bg-[#fffaf6] px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800">
                                    Store settings
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                    Changes will be reflected
                                    across your storefront.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {isPending ? (
                                    <Spinner />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}

                                {isPending
                                    ? 'Saving…'
                                    : 'Save changes'}
                            </button>

                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}

/* ============================================================
   Shared UI
============================================================ */

const inputClass =
    'block w-full rounded-xl border border-orange-100 bg-[#fffaf6] px-3 py-2.5 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10';

const errorInputClass =
    'border-red-300 bg-red-50/30 hover:border-red-400 focus:border-red-400 focus:ring-red-500/10';

/* ============================================================
   Section
============================================================ */

function Section({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="grid gap-6 border-b border-orange-100 px-4 py-7 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-8">

            <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-200/70 bg-amber-50 text-amber-700">
                    {icon}
                </div>

                <div className="min-w-0">

                    <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
                            {description}
                        </p>
                    )}

                </div>
            </div>

            <div className="min-w-0">
                {children}
            </div>

        </section>
    );
}

/* ============================================================
   Field
============================================================ */

function Field({
    label,
    htmlFor,
    hint,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    const feedbackId =
        `${htmlFor}-feedback`;

    return (
        <div className="min-w-0">

            <label
                htmlFor={htmlFor}
                className="block text-[13px] font-semibold text-slate-800"
            >
                {label}
            </label>

            <div className="mt-2">
                {children}
            </div>

            {error ? (
                <p
                    id={feedbackId}
                    className="mt-1.5 text-xs font-medium leading-4 text-red-600"
                >
                    {error}
                </p>
            ) : hint ? (
                <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                    {hint}
                </p>
            ) : null}

        </div>
    );
}

/* ============================================================
   Social Field
============================================================ */

function SocialField({
    icon,
    label,
    htmlFor,
    value,
    placeholder,
    disabled,
    error,
    onChange,
}: {
    icon: ReactNode;
    label: string;
    htmlFor: string;
    value: string;
    placeholder: string;
    disabled?: boolean;
    error?: string;
    onChange: (value: string) => void;
}) {
    const feedbackId =
        `${htmlFor}-feedback`;

    return (
        <div className="min-w-0">

            <label
                htmlFor={htmlFor}
                className="block text-[13px] font-semibold text-slate-800"
            >
                {label}
            </label>

            <div className="relative mt-2">

                <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-slate-400">
                    {icon}
                </span>

                <input
                    id={htmlFor}
                    name={htmlFor}
                    type="url"
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value,
                        )
                    }
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error
                            ? feedbackId
                            : undefined
                    }
                    className={`${inputClass} pl-9 ${
                        error
                            ? errorInputClass
                            : ''
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                />

            </div>

            {error ? (
                <p
                    id={feedbackId}
                    className="mt-1.5 text-xs font-medium leading-4 text-red-600"
                >
                    {error}
                </p>
            ) : null}

        </div>
    );
}

/* ============================================================
   Logo Preview
============================================================ */

function LogoPreview({
    url,
    fallbackLetter,
}: {
    url: string;
    fallbackLetter: string;
}) {
    const [failed, setFailed] =
        useState(false);

    const showFallback =
        !url || failed;

    return (
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm sm:h-16 sm:w-16">

            <div className="absolute inset-1 rounded-lg border border-amber-100" />

            {showFallback ? (
                <span className="relative text-lg font-semibold text-amber-600 sm:text-xl">
                    {fallbackLetter}
                </span>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={url}
                    alt="Logo preview"
                    className="relative h-full w-full object-contain p-2"
                    onError={() =>
                        setFailed(true)
                    }
                />
            )}

        </div>
    );
}

/* ============================================================
   Spinner
============================================================ */

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />

            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
}