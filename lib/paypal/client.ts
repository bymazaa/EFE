import {
    Client,
    Environment,
} from '@paypal/paypal-server-sdk';

const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET;

if (!clientId) {
    throw new Error(
        'Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID.',
    );
}

if (!clientSecret) {
    throw new Error(
        'Missing PAYPAL_CLIENT_SECRET.',
    );
}

const environment =
    process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT ===
    'production'
        ? Environment.Production
        : Environment.Sandbox;

/**
 * Shared PayPal server client.
 *
 * This file is server-only.
 *
 * The client secret is never exposed to the browser.
 */
export const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,

        oAuthClientSecret: clientSecret,
    },

    environment,
});