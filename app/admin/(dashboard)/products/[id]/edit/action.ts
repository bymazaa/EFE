'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth';

import {
    updateProduct,
    type ProductDTO,
} from '@/services/product.service';

import type { ActionResult } from '@/lib/action-result';
import type { ProductInput } from '@/lib/validation/product.schema';

export async function updateProductAction(
    id: string,
    data: ProductInput,
): Promise<ActionResult<ProductDTO>> {
    await requireAdmin();

    const result = await updateProduct(id, data);

    if (!result.success) {
        return result;
    }

    // Admin product list
    revalidatePath('/admin/products');

    // Homepage product data
    revalidatePath('/');

    // Public product listing
    revalidatePath('/products');

    // All dynamic product pages
    // Covers slug changes as well.
    revalidatePath('/products/[slug]', 'page');

    return result;
}