import type { SiteSettingsDTO } from '@/services/settings.service';
import {WhatsAppChat} from "@/app/components/home/WhatsAppChat"

import { getSettings } from '@/services/settings.service';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PromoPopup } from '../components/home/PromoPopup';

const DEFAULT_SETTINGS: SiteSettingsDTO = {
    brandName: 'Quiet Flame Co.',
    logoUrl: '',
    description: 'Hand-poured soy candles made in small batches.',
    email: '',
    phone: '',
    address: '',
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        whatsapp: '',
    },
    shippingCost: 0,
    websiteUrl: '',
    updatedAt: new Date(),
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    let settings: SiteSettingsDTO;

    try {
        const result = await getSettings();

        settings = result ?? DEFAULT_SETTINGS;
    } catch {
        settings = DEFAULT_SETTINGS;
    }

    return (
        <div className="flex min-h-screen flex-col bg-cream">
            <Header brandName={settings.brandName} logoUrl={settings.logoUrl} />

            <main className="flex-1">{children}</main>

            <PromoPopup />
            
<WhatsAppChat/>
            <Footer settings={settings} />
        </div>
    );
}
