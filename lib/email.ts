import 'server-only';

import {
    apiKey,
    mailDomain,
} from './constants';

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    label: string;
    replyTo?: string | string[];
}

interface ResendErrorResponse {
    message?: string;
}

export async function sendEmail({
    to,
    subject,
    html,
    label,
    replyTo,
}: SendEmailOptions): Promise<void> {
    // --------------------------------------------------
    // Validate email configuration
    // --------------------------------------------------
    if (!apiKey || !mailDomain) {
        throw new Error(
            'Email configuration is missing.',
        );
    }

    // --------------------------------------------------
    // Normalize domain
    // Example:
    // bymaza.me
    // --------------------------------------------------
    const normalizedDomain =
        mailDomain.trim().toLowerCase();

    if (!normalizedDomain) {
        throw new Error(
            'Email domain is required.',
        );
    }

    // --------------------------------------------------
    // Normalize sender label
    // Example:
    // support
    // order
    // security
    // --------------------------------------------------
    const normalizedLabel =
        label.trim().toLowerCase();

    if (!normalizedLabel) {
        throw new Error(
            'Email sender label is required.',
        );
    }

    // --------------------------------------------------
    // Build sender email
    //
    // support + bymaza.me
    // => support@bymaza.me
    // --------------------------------------------------
    const fromEmail =
        `${normalizedLabel}@${normalizedDomain}`;

    // --------------------------------------------------
    // Optional Reply-To
    //
    // If replyTo exists:
    // reply_to will be included.
    //
    // If replyTo does not exist:
    // reply_to will NOT be included.
    // --------------------------------------------------
    const replyToField =
        replyTo
            ? {
                  reply_to: replyTo,
              }
            : {};

    // --------------------------------------------------
    // Send email through Resend
    // --------------------------------------------------
    const response = await fetch(
        'https://api.resend.com/emails',
        {
            method: 'POST',
            headers: {
                Authorization:
                    `Bearer ${apiKey}`,
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({
                from: fromEmail,
                to,
                subject,
                html,
                ...replyToField,
            }),
        },
    );

    // --------------------------------------------------
    // Handle Resend error
    // --------------------------------------------------
    if (!response.ok) {
        let errorMessage =
            'Failed to send email.';

        try {
            const error =
                (await response.json()) as ResendErrorResponse;

            if (
                typeof error.message === 'string' &&
                error.message.trim()
            ) {
                errorMessage =
                    error.message.trim();
            }
        } catch {
            // Ignore invalid/non-JSON error bodies.
        }

        throw new Error(errorMessage);
    }
}