'use server';

import { z } from 'zod';

import { sendContactMessageEmail } from '@/lib/mail';

export interface ContactFormState {
    success: boolean;
    message: string;
}

const contactFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Please enter your name.')
        .max(80, 'Name is too long.'),

    email: z
        .string()
        .trim()
        .email('Please enter a valid email address.')
        .max(160, 'Email is too long.'),

    subject: z
        .string()
        .trim()
        .min(2, 'Please enter a subject.')
        .max(150, 'Subject is too long.'),

    message: z
        .string()
        .trim()
        .min(10, 'Please enter a message.')
        .max(
            2000,
            'Message must be under 2000 characters.',
        ),
});

export async function sendContactMessageAction(
    _previousState: ContactFormState,
    formData: FormData,
): Promise<ContactFormState> {
    const parsed = contactFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
    });

    if (!parsed.success) {
        const firstError =
            parsed.error.issues[0]?.message ??
            'Please check the form and try again.';

        return {
            success: false,
            message: firstError,
        };
    }

    try {
        await sendContactMessageEmail({
            name: parsed.data.name,
            email: parsed.data.email,
            subject: parsed.data.subject,
            message: parsed.data.message,
        });

        return {
            success: true,
            message:
                'Your message has been sent successfully.',
        };
    } catch (error) {
        console.error(
            'Failed to send contact message:',
            error,
        );

        return {
            success: false,
            message:
                'We could not send your message right now. Please try again later.',
        };
    }
}