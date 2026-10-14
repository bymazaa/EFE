import type { Metadata } from 'next';

import Image from 'next/image';
import { redirect } from 'next/navigation';

import { getCurrentAdmin } from '@/lib/auth';
import { getSettings } from '@/services/settings.service';

import { Card, CardBody } from '@/app/components/ui/Card';
import { LoginForm } from '@/app/components/admin/LoginForm';
import { ForgotPasswordModal } from '@/app/components/admin/ForgotPasswordModal';

export const metadata: Metadata = {
    title: 'Admin Login',
    robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
    const admin = await getCurrentAdmin();

    if (admin) redirect('/admin');

    const settings = await getSettings();

    return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    {settings.logoUrl ? (
                        <Image
                            src={settings.logoUrl}
                            alt={settings.brandName}
                            width={80}
                            height={70}
                            className="mx-auto mb-4"
                        />
                    ) : null}

                    <p className="text-[13px] tracking-wide text-chocolate-muted">
                        {settings.brandName}
                    </p>

                    <h1 className="mt-2 font-serif text-2xl text-chocolate">
                        Admin sign in
                    </h1>
                </div>

                <Card elevation="lifted">
                    <CardBody className="p-6">
                        <LoginForm />

                        <div className="text-center">
                            <ForgotPasswordModal />
                        </div>
                        <div className="text-center my-2">
                            <a href="/" className="text-gray-500">Go  To Home Page</a>
                        </div>
                    </CardBody>
                </Card>

                <p className="mt-6 text-center text-[13px] text-chocolate-muted">
                    Restricted area. Access is limited to store administrators.
                </p>
            </div>
        </div>
    );
}