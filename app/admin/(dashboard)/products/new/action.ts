'use server';

import { revalidatePath } from 'next/cache';

import type { ProductInput } from '@/lib/validation/product.schema';
import type { ActionResult } from '@/lib/action-result';

import {
    createProduct,
    type ProductDTO,
} from '@/services/product.service';

export async function createProductAction(
    data: ProductInput,
): Promise<ActionResult<ProductDTO>> {
    const result = await createProduct(data);

    if (!result.success) {
        return result;
    }

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/products/[slug]', 'page');

    return result;
}