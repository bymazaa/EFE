import { apiKey, fromEmail } from "./constants";

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

interface ResendErrorResponse {
    message?: string;
}

export async function sendEmail({
    to,
    subject,
    html
}: SendEmailOptions): Promise<void> {

    if (!apiKey || !fromEmail) {
        throw new Error(
            'Email configuration is missing.',
        );
    }

    const response = await fetch(
        'https://api.resend.com/emails',
        {
            method: 'POST',

            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                from: fromEmail,
                to,
                subject,
                html
                
            }),
        },
    );

    if (!response.ok) {
        let errorMessage =
            'Failed to send email.';

        try {
            const error =
                (await response.json()) as ResendErrorResponse;

            if (error.message) {
                errorMessage = error.message;
            }
        } catch {
            // Ignore invalid/non-JSON error bodies.
        }

        throw new Error(errorMessage);
    }
}