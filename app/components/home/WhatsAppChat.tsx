
'use client';

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from 'react';

import { Send, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';

const QUICK_MESSAGES = [
    'Hi! I have a question about an order.',
    'Can you help me choose a product?',
    'I want to know about shipping.',
];

interface WhatsAppChatProps {
    whatsappNumber: string;
}

export function WhatsAppChat({
    whatsappNumber,
}: WhatsAppChatProps) {
    const normalizedNumber =
        whatsappNumber?.replace(/\D/g, '') || '';

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    /**
     * =========================================================
     * Toggle chat
     * =========================================================
     */
    function handleToggle() {
        if (!normalizedNumber) {
            toast.warning(
                'WhatsApp is not configured.',
                {
                    description:
                        'Please add a valid WhatsApp number in your site settings.',
                },
            );

            return;
        }

        setIsOpen((value) => !value);
    }

    /**
     * =========================================================
     * Close on outside click
     * =========================================================
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleMouseDown,
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleMouseDown,
            );
        };
    }, [isOpen]);

    /**
     * =========================================================
     * Close with Escape
     * =========================================================
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [isOpen]);

    /**
     * =========================================================
     * Focus input when opened
     * =========================================================
     */
    useEffect(() => {
        if (!isOpen) return;

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 120);

        return () => {
            window.clearTimeout(timer);
        };
    }, [isOpen]);

    /**
     * =========================================================
     * Send WhatsApp message
     * =========================================================
     */
    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            inputRef.current?.focus();
            return;
        }

        if (!normalizedNumber) {
            toast.warning(
                'WhatsApp number is unavailable.',
                {
                    description:
                        'Please configure a valid WhatsApp number first.',
                },
            );

            return;
        }

        const encodedMessage =
            encodeURIComponent(trimmedMessage);

        const whatsappLink =
            `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;

        window.open(
            whatsappLink,
            '_blank',
            'noopener,noreferrer',
        );

        setMessage('');
        setIsOpen(false);
    }

    /**
     * =========================================================
     * Quick message
     * =========================================================
     */
    function handleQuickMessage(
        value: string,
    ) {
        setMessage(value);

        window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }

    return (
        <div
            ref={panelRef}
            className="fixed bottom-5 right-5 z-[90] sm:bottom-6 sm:right-6"
        >
            {/* =====================================================
                Chat panel
            ====================================================== */}
            {isOpen && (
                <div
                    className="
                        absolute
                        bottom-[68px]
                        right-0
                        w-[calc(100vw-2rem)]
                        max-w-[360px]
                        overflow-hidden
                        rounded-2xl
                        border
                        border-orange-100
                        bg-white
                        shadow-2xl
                        shadow-black/15
                        animate-in
                        fade-in
                        slide-in-from-bottom-3
                        duration-200
                    "
                >
                    {/* Header */}
                    <div className="bg-[#25D366] px-4 py-4 text-white">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <SiWhatsapp className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        Chat with us
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-white/80">
                                        We usually reply quickly
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsOpen(false)
                                }
                                aria-label="Close WhatsApp chat"
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-white
                                    transition
                                    hover:bg-white/15
                                "
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="bg-[#fffaf5] p-4">
                        {/* Welcome message */}
                        <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-orange-100">
                            <p className="text-xs font-medium leading-5 text-slate-700">
                                Hi! 👋
                                <br />
                                How can we help you
                                today?
                            </p>
                        </div>

                        {/* Quick messages */}
                        <div className="mt-3 space-y-2">
                            {QUICK_MESSAGES.map(
                                (quickMessage) => (
                                    <button
                                        key={quickMessage}
                                        type="button"
                                        onClick={() =>
                                            handleQuickMessage(
                                                quickMessage,
                                            )
                                        }
                                        className="
                                            block
                                            w-full
                                            cursor-pointer
                                            rounded-xl
                                            border
                                            border-orange-100
                                            bg-white
                                            px-3
                                            py-2.5
                                            text-left
                                            text-[11px]
                                            font-medium
                                            leading-4
                                            text-slate-600
                                            transition
                                            hover:border-orange-200
                                            hover:bg-orange-50
                                            hover:text-slate-800
                                        "
                                    >
                                        {quickMessage}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* Composer */}
                        <form
                            onSubmit={handleSubmit}
                            className="mt-3"
                        >
                            <div className="rounded-xl border border-orange-100 bg-white p-2 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500/10">
                                <textarea
                                    ref={inputRef}
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Write your message..."
                                    rows={3}
                                    maxLength={500}
                                    className="
                                        w-full
                                        resize-none
                                        border-0
                                        bg-transparent
                                        px-1
                                        py-1
                                        text-xs
                                        leading-5
                                        text-slate-800
                                        outline-none
                                        placeholder:text-slate-400
                                    "
                                />

                                <div className="flex items-center justify-between gap-3 border-t border-orange-50 pt-2">
                                    <span className="text-[10px] text-slate-400">
                                        WhatsApp will open next
                                    </span>

                                    <button
                                        type="submit"
                                        disabled={
                                            !message.trim()
                                        }
                                        className="
                                            inline-flex
                                            h-9
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            gap-1.5
                                            rounded-lg
                                            bg-[#25D366]
                                            px-3.5
                                            text-xs
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-[#20bd5a]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        Send
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
                Floating button
            ====================================================== */}
            <button
                type="button"
                onClick={handleToggle}
                aria-label={
                    isOpen
                        ? 'Close WhatsApp chat'
                        : 'Open WhatsApp chat'
                }
                aria-expanded={isOpen}
                className="
                    group
                    relative
                    flex
                    h-14
                    w-14
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-full
                    bg-[#25D366]
                    text-white
                    shadow-xl
                    shadow-[#25D366]/25
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:bg-[#20bd5a]
                    active:scale-95
                    sm:h-15
                    sm:w-15
                "
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <SiWhatsapp className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
                )}

                {!isOpen && (
                    <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                )}
            </button>
        </div>
    );
}