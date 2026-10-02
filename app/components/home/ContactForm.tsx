'use client';

import {
    useActionState,
    useEffect,
    useRef,
} from 'react';

import { Send } from 'lucide-react';
import { toast } from 'sonner';

import {
    sendContactMessageAction,
    type ContactFormState,
} from '@/app/(public)/contact/action';

const initialState: ContactFormState = {
    success: false,
    message: '',
};

export function ContactForm() {
    const formRef = useRef<HTMLFormElement>(null);

    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        sendContactMessageAction,
        initialState,
    );

    useEffect(() => {
        if (!state.message) {
            return;
        }

        if (state.success) {
            toast.success(
                'Message sent successfully.',
                {
                    description: state.message,
                },
            );

            formRef.current?.reset();
            return;
        }

        toast.error(
            'Unable to send message.',
            {
                description: state.message,
            },
        );
    }, [
        state.success,
        state.message,
    ]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-5"
        >
            {/* Name */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-chocolate"
                >
                    Your Name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    disabled={isPending}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-chocolate"
                >
                    Email Address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            {/* Subject */}
            <div>
                <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-chocolate"
                >
                    Subject
                </label>

                <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    required
                    disabled={isPending}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            {/* Message */}
            <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-chocolate"
                    >
                        Message
                    </label>

                    <span className="text-xs text-chocolate-muted">
                        We&apos;ll get back to you soon
                    </span>
                </div>

                <textarea
                    id="message"
                    name="message"
                    rows={7}
                    placeholder="Write your message here..."
                    required
                    maxLength={2000}
                    disabled={isPending}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-6 text-gray-900 shadow-2xl shadow-gray-50 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending
                    ? 'Sending...'
                    : 'Send Message'}

                <Send className="h-4 w-4" />
            </button>

            <p className="text-center text-xs leading-5 text-chocolate-muted">
                By submitting this form, you agree to be
                contacted regarding your message.
            </p>
        </form>
    );
}