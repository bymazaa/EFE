import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';


export const metadata: Metadata = {
    title: 'Your Cart',
    description:
        'Review your selected clothing, jackets, sweaters, and sweatshirts before checkout.',
};

export default function CartPage() {
    return <CartPageClient />;
}