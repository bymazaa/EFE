import { connectDB } from '@/lib/mongodb';

import { SiteSettings, type SiteSettingsDB } from '@/models/SiteSettings';

import { siteSettingsSchema } from '@/lib/validation/settings.schema';

import {
    ok,
    fail,
    validationFail,
    handleError,
    type ActionResult,
} from '@/lib/action-result';

const SETTINGS_KEY = 'main';

const DEFAULT_SETTINGS = {
    key: SETTINGS_KEY,
    brandName: 'My Candle Shop',
    description: '',
    logoUrl: '',
    address: '',
    shippingCost: 0,
    websiteUrl: '',
    phone: '',
    email: '',
    social: {
        facebook: '',
        instagram: '',
        whatsapp: '',
        twitter: '',
    },
};

export interface SiteSettingsDTO {
    brandName: string;
    description: string;
    logoUrl: string;
    address: string;
    shippingCost: number;
    websiteUrl: string;
    phone: string;
    email: string;
    social: {
        facebook: string;
        instagram: string;
        whatsapp: string;
        twitter: string;
    };
    updatedAt: Date;
}

function toDTO(doc: SiteSettingsDB): SiteSettingsDTO {
    return {
        brandName: doc.brandName,
        description: doc.description ?? '',
        logoUrl: doc.logoUrl ?? '',
        address: doc.address ?? '',
        shippingCost: doc.shippingCost ?? 0,
        websiteUrl: doc.websiteUrl ?? '',
        phone: doc.phone ?? '',
        email: doc.email ?? '',
        social: {
            facebook: doc.social?.facebook ?? '',
            instagram: doc.social?.instagram ?? '',
            whatsapp: doc.social?.whatsapp ?? '',
            twitter: doc.social?.twitter ?? '',
        },
        updatedAt: doc.updatedAt as Date,
    };
}

/**
 * Read the site settings singleton. Creates it with sensible defaults
 * the first time it's called, so callers never have to handle `null`.
 *
 * const settings = await getSettings();
 */
export async function getSettings(): Promise<SiteSettingsDTO> {
    const DEFAULT_SETTINGS: Omit<SiteSettingsDTO, 'updatedAt'> & {
        key: string;
    } = {
        key: SETTINGS_KEY,
        brandName: 'Quiet Flame Co.',
        logoUrl: '',
        description: 'Hand-poured soy candles made in small batches.',
        email: '',
        phone: '',
        address: '',
        shippingCost: 0,
        websiteUrl: '',
        social: {
            facebook: '',
            instagram: '',
            twitter: '',
            whatsapp: '',
        },
    };

    try {
        await connectDB();

        const doc = await SiteSettings.findOneAndUpdate(
            { key: SETTINGS_KEY },
            { $setOnInsert: DEFAULT_SETTINGS },
            {
                returnDocument: 'after',
                upsert: true,
            },
        ).lean();

        return toDTO(doc);
    } catch (error) {
        console.error('Failed to load settings:', error);

        return {
            ...DEFAULT_SETTINGS,
            updatedAt: new Date(),
        };
    }
}

/**
 * Admin settings form. Validates input itself (do not validate again in the
 * Server Action). Always updates the single settings document.
 *
 * const result = await updateSettings(formData);
 */
export async function updateSettings(
    data: unknown,
): Promise<ActionResult<SiteSettingsDTO>> {
    const parsed = siteSettingsSchema.safeParse(data);


    if (!parsed.success) {
        return validationFail(parsed.error);
    }

    try {
        await connectDB();

        const doc = await SiteSettings.findOneAndUpdate(
            { key: SETTINGS_KEY },
            { $set: parsed.data },
            {
                returnDocument: 'after',
                upsert: true,
            },
        ).lean();

        if (!doc) {
            return fail('Could not save settings.');
        }

        return ok(
            'Settings updated successfully.',
            toDTO(doc),
        );
    } catch (error) {
        return handleError(error);
    }
}