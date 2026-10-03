import { CONTACT_RECEIVER_EMAIL } from './constants';

import { sendEmail } from './email';

/* =========================================================
 * Helpers
 * ========================================================= */

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatPaymentMethod(
    paymentMethod: string,
): string {
    return paymentMethod
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
        );
}

function formatMoney(
    amount: number,
    currency: string,
): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

function normalizeEmailSubject(
    subject: string,
): string {
    return subject
        .replace(/[\r\n]/g, ' ')
        .trim();
}

/* =========================================================
 * Shared Email Styles
 * ========================================================= */

const EMAIL_CONTAINER_STYLE = `
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 24px;
    font-family: Arial, Helvetica, sans-serif;
    color: #2f211a;
`;

const EMAIL_BRAND_STYLE = `
    margin: 0 0 28px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #d97706;
`;

const EMAIL_TITLE_STYLE = `
    margin: 0 0 16px;
    font-size: 28px;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #2f211a;
`;

const EMAIL_TEXT_STYLE = `
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: #5f5148;
`;

const EMAIL_MUTED_STYLE = `
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    color: #8b7c72;
`;

const EMAIL_SECTION_STYLE = `
    margin: 28px 0 0;
    padding-top: 24px;
    border-top: 1px solid #eadbcf;
`;

const EMAIL_LABEL_STYLE = `
    margin: 0 0 7px;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8b7c72;
`;

const EMAIL_VALUE_STYLE = `
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    font-weight: 600;
    color: #2f211a;
`;

const EMAIL_BUTTON_STYLE = `
    display: inline-block;
    padding: 13px 20px;
    border-radius: 8px;
    background-color: #d97706;
    color: #ffffff;
    text-decoration: none;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 700;
`;

const EMAIL_FOOTER_STYLE = `
    margin: 32px 0 0;
    padding-top: 20px;
    border-top: 1px solid #eadbcf;
    font-size: 12px;
    line-height: 1.7;
    color: #9a8b80;
`;

/* =========================================================
 * Admin Created Email
 * ========================================================= */

interface SendAdminCreatedEmailOptions {
    email: string;
    name: string;
    password: string;
}

export async function sendAdminCreatedEmail({
    email,
    name,
    password,
}: SendAdminCreatedEmailOptions): Promise<void> {
    const safeEmail = escapeHtml(email);
    const safeName = escapeHtml(name);
    const safePassword = escapeHtml(password);

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Your admin account is ready
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 8px;">
                Hi ${safeName},
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                Your admin account has been created successfully.
                You can use the credentials below to sign in to
                your administrator dashboard.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Email
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 20px;">
                    ${safeEmail}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Temporary Password
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.6;
                        font-weight: 600;
                        color: #2f211a;
                        word-break: break-all;
                    "
                >
                    ${safePassword}
                </p>
            </div>

            <p style="${EMAIL_SECTION_STYLE}; ${EMAIL_MUTED_STYLE}">
                For security, sign in and change your password
                as soon as possible.
            </p>

            <p style="${EMAIL_FOOTER_STYLE}">
                This is an automated security email from EFE Apparel.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Your admin account has been created',
        html,
        label: 'security',
    });
}

/* =========================================================
 * Password Reset Email
 * ========================================================= */

export async function sendPasswordResetEmail({
    email,
    resetUrl,
}: {
    email: string;
    resetUrl: string;
}): Promise<void> {
    const safeResetUrl = escapeHtml(resetUrl);

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Reset your password
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 10px;">
                We received a request to reset the password
                for your admin account.
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                This password reset link will expire in
                <strong>15 minutes</strong>.
            </p>

            <div
                style="
                    margin: 28px 0;
                    text-align: left;
                "
            >
                <a
                    href="${safeResetUrl}"
                    style="${EMAIL_BUTTON_STYLE}"
                >
                    Reset Password
                </a>
            </div>

            <div style="${EMAIL_SECTION_STYLE}">
                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        line-height: 1.6;
                        font-weight: 700;
                        color: #5f5148;
                    "
                >
                    Having trouble with the button?
                </p>

                <p style="${EMAIL_MUTED_STYLE}; margin-bottom: 10px;">
                    Copy and paste the following URL into
                    your browser:
                </p>

                <a
                    href="${safeResetUrl}"
                    style="
                        font-size: 12px;
                        line-height: 1.7;
                        color: #c2410c;
                        text-decoration: underline;
                        word-break: break-all;
                    "
                >
                    ${safeResetUrl}
                </a>
            </div>

            <p style="${EMAIL_FOOTER_STYLE}">
                If you did not request a password reset,
                you can safely ignore this email.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Reset your admin password',
        html,
        label: 'security',
    });
}

/* =========================================================
 * Password Changed Email
 * ========================================================= */

export async function sendPasswordChangedEmail({
    email,
    name,
}: {
    email: string;
    name?: string;
}): Promise<void> {
    const greeting = name?.trim()
        ? `Hi ${escapeHtml(name.trim())},`
        : 'Hi,';

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Your password was changed
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 8px;">
                ${greeting}
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                Your admin account password has been changed
                successfully.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_MUTED_STYLE}">
                    If you did not make this change, contact
                    your administrator immediately and secure
                    your account.
                </p>
            </div>

            <p style="${EMAIL_FOOTER_STYLE}">
                This is an automated security notification from
                EFE Apparel.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Your password was changed',
        html,
        label: 'security',
    });
}

/* =========================================================
 * Order Delivered Email
 * ========================================================= */

export async function sendOrderDeliveredEmail({
    email,
    customerName,
    orderNumber,
}: {
    email: string;
    customerName: string;
    orderNumber: string;
}): Promise<void> {
    const safeCustomerName = escapeHtml(
        customerName?.trim() || 'Customer',
    );

    const safeOrderNumber = escapeHtml(
        orderNumber,
    );

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Your order has been delivered
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 8px;">
                Hi ${safeCustomerName},
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                Your order has been marked as delivered.
                We hope you enjoy your new pieces.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Order Number
                </p>

                <p style="${EMAIL_VALUE_STYLE}">
                    ${safeOrderNumber}
                </p>
            </div>

            <p style="${EMAIL_FOOTER_STYLE}">
                Thank you for shopping with EFE Apparel.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `Your order ${orderNumber} has been delivered`,
        html,
        label: 'order',
    });
}

/* =========================================================
 * Payment Successful Email
 *
 * Kept available for future use.
 * Current order flow can use sendOrderPlacedEmail()
 * instead.
 * ========================================================= */

export async function sendPaymentSuccessEmail({
    email,
    customerName,
    orderNumber,
    amount,
    currency,
    paymentMethod,
    providerOrderId,
    providerCaptureId,
}: {
    email: string;
    customerName: string;
    orderNumber: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    providerOrderId?: string | null;
    providerCaptureId?: string | null;
}): Promise<void> {
    const safeCustomerName = escapeHtml(
        customerName?.trim() || 'Customer',
    );

    const safeOrderNumber = escapeHtml(
        orderNumber,
    );

    const formattedAmount =
        formatMoney(amount, currency);

    const safeFormattedAmount =
        escapeHtml(formattedAmount);

    const formattedPaymentMethod =
        formatPaymentMethod(paymentMethod);

    const safePaymentMethod =
        escapeHtml(formattedPaymentMethod);

    const safeProviderOrderId =
        providerOrderId
            ? escapeHtml(providerOrderId)
            : '';

    const safeProviderCaptureId =
        providerCaptureId
            ? escapeHtml(providerCaptureId)
            : '';

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Payment received
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 8px;">
                Hi ${safeCustomerName},
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                Your payment has been received successfully.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Order Number
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 20px;">
                    ${safeOrderNumber}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Amount Paid
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 20px;">
                    ${safeFormattedAmount}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Payment Method
                </p>

                <p style="${EMAIL_VALUE_STYLE};">
                    ${safePaymentMethod}
                </p>
            </div>

            ${
                safeProviderOrderId
                    ? `
                        <div style="${EMAIL_SECTION_STYLE}">
                            <p style="${EMAIL_LABEL_STYLE}">
                                Provider Order ID
                            </p>

                            <p
                                style="
                                    ${EMAIL_VALUE_STYLE};
                                    word-break: break-all;
                                "
                            >
                                ${safeProviderOrderId}
                            </p>
                        </div>
                    `
                    : ''
            }

            ${
                safeProviderCaptureId
                    ? `
                        <div style="${EMAIL_SECTION_STYLE}">
                            <p style="${EMAIL_LABEL_STYLE}">
                                Provider Capture ID
                            </p>

                            <p
                                style="
                                    ${EMAIL_VALUE_STYLE};
                                    word-break: break-all;
                                "
                            >
                                ${safeProviderCaptureId}
                            </p>
                        </div>
                    `
                    : ''
            }

            <p style="${EMAIL_FOOTER_STYLE}">
                Thank you for shopping with EFE Apparel.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `Payment received for order ${orderNumber}`,
        html,
        label: 'order',
    });
}

/* =========================================================
 * Order Placed + Payment Confirmation Email
 * ========================================================= */

export async function sendOrderPlacedEmail({
    email,
    customerName,
    orderNumber,
    totalAmount,
    currency,
    paymentMethod,
    providerOrderId,
    providerCaptureId,
    shippingAddress,
    orderStatusUrl,
}: {
    email: string;
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    providerOrderId: string;
    providerCaptureId: string;
    shippingAddress: string;
    orderStatusUrl: string;
}): Promise<void> {
    const safeCustomerName = escapeHtml(
        customerName?.trim() || 'Customer',
    );

    const safeOrderNumber =
        escapeHtml(orderNumber);

    const safeShippingAddress =
        escapeHtml(shippingAddress);

    const safeProviderOrderId =
        escapeHtml(providerOrderId);

    const safeProviderCaptureId =
        escapeHtml(providerCaptureId);

    const safeOrderStatusUrl =
        escapeHtml(orderStatusUrl);

    const formattedAmount =
        formatMoney(
            totalAmount,
            currency,
        );

    const safeFormattedAmount =
        escapeHtml(formattedAmount);

    const formattedPaymentMethod =
        formatPaymentMethod(paymentMethod);

    const safePaymentMethod =
        escapeHtml(formattedPaymentMethod);

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                Order confirmed
            </h2>

            <p style="${EMAIL_TEXT_STYLE}; margin-bottom: 8px;">
                Hi ${safeCustomerName},
            </p>

            <p style="${EMAIL_TEXT_STYLE}">
                Your order has been placed successfully and
                your payment has been verified.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Order Number
                </p>

                <p style="${EMAIL_VALUE_STYLE}">
                    ${safeOrderNumber}
                </p>
            </div>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Customer
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 18px;">
                    ${safeCustomerName}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Shipping Address
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.7;
                        color: #5f5148;
                    "
                >
                    ${safeShippingAddress}
                </p>
            </div>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Amount Paid
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 18px;">
                    ${safeFormattedAmount}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Payment Method
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 18px;">
                    ${safePaymentMethod}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Provider Order ID
                </p>

                <p
                    style="
                        ${EMAIL_VALUE_STYLE};
                        margin-bottom: 18px;
                        word-break: break-all;
                    "
                >
                    ${safeProviderOrderId}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Provider Capture ID
                </p>

                <p
                    style="
                        ${EMAIL_VALUE_STYLE};
                        word-break: break-all;
                    "
                >
                    ${safeProviderCaptureId}
                </p>
            </div>

            <div
                style="
                    margin: 32px 0 0;
                    text-align: left;
                "
            >
                <a
                    href="${safeOrderStatusUrl}"
                    style="${EMAIL_BUTTON_STYLE}"
                >
                    Check Your Order Status
                </a>
            </div>

            <p style="${EMAIL_FOOTER_STYLE}">
                You can use the order status page anytime to
                check your order progress.
            </p>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: `Order ${orderNumber} confirmed`,
        html,
        label: 'order',
    });
}

/* =========================================================
 * Contact Form Email
 * ========================================================= */

export async function sendContactMessageEmail({
    name,
    email,
    subject,
    message,
}: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): Promise<void> {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);

    const safeMessage =
        escapeHtml(message).replace(
            /\n/g,
            '<br />',
        );

    const emailSubject =
        normalizeEmailSubject(subject);

    const html = `
        <div style="${EMAIL_CONTAINER_STYLE}">
            <p style="${EMAIL_BRAND_STYLE}">
                EFE Apparel
            </p>

            <h2 style="${EMAIL_TITLE_STYLE}">
                New contact message
            </h2>

            <p style="${EMAIL_TEXT_STYLE}">
                Someone submitted a new message through
                the website contact form.
            </p>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Name
                </p>

                <p style="${EMAIL_VALUE_STYLE}; margin-bottom: 20px;">
                    ${safeName}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Email
                </p>

                <p
                    style="
                        ${EMAIL_VALUE_STYLE};
                        margin-bottom: 20px;
                        word-break: break-word;
                    "
                >
                    ${safeEmail}
                </p>

                <p style="${EMAIL_LABEL_STYLE}">
                    Subject
                </p>

                <p style="${EMAIL_VALUE_STYLE}">
                    ${safeSubject}
                </p>
            </div>

            <div style="${EMAIL_SECTION_STYLE}">
                <p style="${EMAIL_LABEL_STYLE}">
                    Message
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.8;
                        color: #5f5148;
                    "
                >
                    ${safeMessage}
                </p>
            </div>

            <p style="${EMAIL_FOOTER_STYLE}">
                Reply directly to this email to respond to
                ${safeEmail}.
            </p>
        </div>
    `;

    await sendEmail({
        to: CONTACT_RECEIVER_EMAIL!,
        subject: `Contact: ${emailSubject}`,
        html,
        label: 'support',
        replyTo: email,
    });
}