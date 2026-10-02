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

function formatPaymentMethod(paymentMethod: string): string {
    return paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

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
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Your admin account is ready
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Hi ${safeName},
            </p>

            <p
                style="
                    margin: 0 0 24px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Your admin account has been created successfully.
                You can use the credentials below to sign in.
            </p>

            <div
                style="
                    margin: 0 0 24px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                "
            >
                <p
                    style="
                        margin: 0 0 10px;
                        font-size: 13px;
                        color: #8b7c72;
                    "
                >
                    Email
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safeEmail}
                </p>

                <p
                    style="
                        margin: 0 0 10px;
                        font-size: 13px;
                        color: #8b7c72;
                    "
                >
                    Password
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2f211a;
                        word-break: break-all;
                    "
                >
                    ${safePassword}
                </p>
            </div>

            <p
                style="
                    margin: 0;
                    line-height: 1.6;
                    font-size: 13px;
                    color: #8b7c72;
                "
            >
                Please sign in and change your password as soon
                as possible.
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
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Reset your password
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                We received a request to reset the password
                for your admin account.
            </p>

            <p
                style="
                    margin: 0 0 24px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                This reset link will expire in
                <strong>15 minutes</strong>.
            </p>

            <div style="margin: 28px 0;">
                <a
                    href="${safeResetUrl}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        border-radius: 8px;
                        background-color: #d97706;
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 600;
                        line-height: 1;
                    "
                >
                    Reset password
                </a>
            </div>

            <p
                style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #5f5148;
                "
            >
                Button not working?
            </p>

            <p
                style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #8b7c72;
                "
            >
                Copy and paste this link into your browser:
            </p>

            <p
                style="
                    margin: 8px 0 24px;
                    padding: 10px 12px;
                    border-radius: 6px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                    word-break: break-all;
                "
            >
                <a
                    href="${safeResetUrl}"
                    style="
                        color: #c2410c;
                        text-decoration: underline;
                        font-size: 12px;
                        line-height: 1.6;
                    "
                >
                    ${safeResetUrl}
                </a>
            </p>

            <p
                style="
                    margin: 0;
                    line-height: 1.6;
                    font-size: 13px;
                    color: #8b7c72;
                "
            >
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
    const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim())},` : 'Hi,';

    const html = `
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Your password was changed
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                ${greeting}
            </p>

            <p
                style="
                    margin: 0 0 16px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Your password has been changed successfully.
            </p>

            <p
                style="
                    margin: 0 0 24px;
                    line-height: 1.6;
                    font-size: 13px;
                    color: #8b7c72;
                "
            >
                If you did not make this change, please contact
                your administrator immediately.
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
    const safeCustomerName = escapeHtml(customerName?.trim() || 'Customer');

    const safeOrderNumber = escapeHtml(orderNumber);

    const html = `
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Your order has been delivered
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Hi ${safeCustomerName},
            </p>

            <p
                style="
                    margin: 0 0 20px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Your order has been marked as delivered.
                We hope you enjoy your new pieces.
            </p>

            <div
                style="
                    margin: 0 0 24px;
                    padding: 14px 16px;
                    border-radius: 8px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                "
            >
                <p
                    style="
                        margin: 0 0 6px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Order Number
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 15px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safeOrderNumber}
                </p>
            </div>

            <p
                style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #8b7c72;
                "
            >
                Thank you for shopping with us.
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
 * =========================================================
 *
 * Kept available for future use.
 * Your current order flow can use
 * sendOrderPlacedEmail() instead.
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
    const safeCustomerName = escapeHtml(customerName);

    const safeOrderNumber = escapeHtml(orderNumber);

    const formattedAmount = formatMoney(amount, currency);

    const formattedPaymentMethod = formatPaymentMethod(paymentMethod);

    const safePaymentMethod = escapeHtml(formattedPaymentMethod);

    const safeProviderOrderId = providerOrderId ? escapeHtml(providerOrderId) : '';

    const safeProviderCaptureId = providerCaptureId ? escapeHtml(providerCaptureId) : '';

    const html = `
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Payment successful
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Hi ${safeCustomerName},
            </p>

            <p
                style="
                    margin: 0 0 20px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Your payment has been received successfully.
                Your order is now confirmed and ready for processing.
            </p>

            <div
                style="
                    margin: 0 0 24px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                "
            >
                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Order Number
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safeOrderNumber}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Amount Paid
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${escapeHtml(formattedAmount)}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Payment Method
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safePaymentMethod}
                </p>

                ${
                    safeProviderOrderId
                        ? `
                            <p
                                style="
                                    margin: 0 0 8px;
                                    font-size: 12px;
                                    color: #8b7c72;
                                "
                            >
                                Provider Order ID
                            </p>

                            <p
                                style="
                                    margin: 0 0 16px;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: #2f211a;
                                    word-break: break-all;
                                "
                            >
                                ${safeProviderOrderId}
                            </p>
                        `
                        : ''
                }

                ${
                    safeProviderCaptureId
                        ? `
                            <p
                                style="
                                    margin: 0 0 8px;
                                    font-size: 12px;
                                    color: #8b7c72;
                                "
                            >
                                Provider Capture ID
                            </p>

                            <p
                                style="
                                    margin: 0;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: #2f211a;
                                    word-break: break-all;
                                "
                            >
                                ${safeProviderCaptureId}
                            </p>
                        `
                        : ''
                }
            </div>

            <p
                style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #8b7c72;
                "
            >
                Thank you for your order. We appreciate your business.
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
    const safeCustomerName = escapeHtml(customerName);

    const safeOrderNumber = escapeHtml(orderNumber);

    const safeShippingAddress = escapeHtml(shippingAddress);

    const safeProviderOrderId = escapeHtml(providerOrderId);

    const safeProviderCaptureId = escapeHtml(providerCaptureId);

    const safeOrderStatusUrl = escapeHtml(orderStatusUrl);

    const formattedAmount = formatMoney(totalAmount, currency);

    const formattedPaymentMethod = escapeHtml(formatPaymentMethod(paymentMethod));

    const html = `
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                Order confirmed
            </h2>

            <p
                style="
                    margin: 0 0 12px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Hi ${safeCustomerName},
            </p>

            <p
                style="
                    margin: 0 0 20px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Your order has been placed successfully and
                your payment has been verified.
            </p>

            <!-- Order information -->
            <div
                style="
                    margin-bottom: 20px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                "
            >
                <p
                    style="
                        margin: 0 0 6px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Order Number
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 15px;
                        font-weight: 700;
                        color: #2f211a;
                    "
                >
                    ${safeOrderNumber}
                </p>
            </div>

            <!-- Customer information -->
            <div
                style="
                    margin-bottom: 20px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fffaf5;
                    border: 1px solid #eadbcf;
                "
            >
                <h3
                    style="
                        margin: 0 0 12px;
                        font-size: 15px;
                        color: #2f211a;
                    "
                >
                    Customer Information
                </h3>

                <p
                    style="
                        margin: 0 0 6px;
                        font-size: 13px;
                        color: #5f5148;
                    "
                >
                    <strong>Name:</strong>
                    ${safeCustomerName}
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 13px;
                        line-height: 1.6;
                        color: #5f5148;
                    "
                >
                    <strong>Shipping Address:</strong><br />
                    ${safeShippingAddress}
                </p>
            </div>

            <!-- Payment information -->
            <div
                style="
                    margin-bottom: 20px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fffaf5;
                    border: 1px solid #eadbcf;
                "
            >
                <h3
                    style="
                        margin: 0 0 12px;
                        font-size: 15px;
                        color: #2f211a;
                    "
                >
                    Payment Information
                </h3>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 13px;
                        color: #5f5148;
                    "
                >
                    <strong>Amount Paid:</strong>
                    ${escapeHtml(formattedAmount)}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 13px;
                        color: #5f5148;
                    "
                >
                    <strong>Payment Method:</strong>
                    ${formattedPaymentMethod}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 13px;
                        color: #5f5148;
                        word-break: break-all;
                    "
                >
                    <strong>Provider Order ID:</strong>
                    ${safeProviderOrderId}
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 13px;
                        color: #5f5148;
                        word-break: break-all;
                    "
                >
                    <strong>Provider Capture ID:</strong>
                    ${safeProviderCaptureId}
                </p>
            </div>

            <!-- Order status -->
            <div
                style="
                    margin: 24px 0;
                    text-align: center;
                "
            >
                <a
                    href="${safeOrderStatusUrl}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        border-radius: 8px;
                        background-color: #d97706;
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 600;
                    "
                >
                    Check Your Order Status
                </a>
            </div>

            <p
                style="
                    margin: 0 0 8px;
                    font-size: 13px;
                    text-align: center;
                    color: #8b7c72;
                "
            >
                Track your order anytime from our website.
            </p>

            <p
                style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.6;
                    text-align: center;
                    color: #a08f83;
                    word-break: break-all;
                "
            >
                ${safeOrderStatusUrl}
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

    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    // Prevent CR/LF characters from entering the email subject.
    const emailSubject = subject.replace(/[\r\n]/g, ' ').trim();

    const html = `
        <div
            style="
                max-width: 560px;
                margin: 0 auto;
                padding: 24px;
                font-family: Arial, sans-serif;
                color: #2f211a;
            "
        >
            <h2
                style="
                    margin: 0 0 16px;
                    font-size: 24px;
                    line-height: 1.3;
                "
            >
                New contact form message
            </h2>

            <p
                style="
                    margin: 0 0 20px;
                    line-height: 1.6;
                    color: #5f5148;
                "
            >
                Someone submitted a new message through
                your website contact form.
            </p>

            <div
                style="
                    margin-bottom: 20px;
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fff7ed;
                    border: 1px solid #fed7aa;
                "
            >
                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Name
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safeName}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Email
                </p>

                <p
                    style="
                        margin: 0 0 16px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2f211a;
                        word-break: break-word;
                    "
                >
                    ${safeEmail}
                </p>

                <p
                    style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Subject
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2f211a;
                    "
                >
                    ${safeSubject}
                </p>
            </div>

            <div
                style="
                    padding: 16px;
                    border-radius: 8px;
                    background-color: #fffaf5;
                    border: 1px solid #eadbcf;
                "
            >
                <p
                    style="
                        margin: 0 0 10px;
                        font-size: 12px;
                        color: #8b7c72;
                    "
                >
                    Message
                </p>

                <p
                    style="
                        margin: 0;
                        font-size: 14px;
                        line-height: 1.7;
                        color: #5f5148;
                    "
                >
                    ${safeMessage}
                </p>
            </div>
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
