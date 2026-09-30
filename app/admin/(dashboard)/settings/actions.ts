'use server';

import { revalidatePath } from 'next/cache';

import {
    updateSettings as updateSettingsService,
} from '@/services/settings.service';

import type { SiteSettingsDTO } from '@/services/settings.service';

import type { ActionResult } from '@/lib/action-result';

export async function updateSettings(
    data: unknown,
): Promise<ActionResult<SiteSettingsDTO>> {
    const result = await updateSettingsService(data);


    if (!result.success) {
        return result;
    }

    /**
     * Settings are global storefront data.
     *
     * Revalidate the root layout so components such as
     * header, footer, metadata, logo, brand name, etc.
     * can immediately receive the updated settings.
     */
    revalidatePath('/', 'layout');

    /**
     * Revalidate the admin settings page as well.
     */
    revalidatePath('/admin/settings');

    return result;
}