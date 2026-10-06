import 'server-only';

import { createClient } from './server';
import { transformProduct } from './productMapper';
import type { Product } from '@/lib/types';

/**
 * Server-side product reads used by Server Components (e.g. the product detail
 * page and its metadata). Uses the cookie-aware server client so no
 * browser-only client is evaluated during SSR.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return transformProduct(data);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}
