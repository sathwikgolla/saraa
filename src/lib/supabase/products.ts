import { supabase } from './client';
import { transformProduct } from './productMapper';
import type { Product } from '@/lib/types';

/**
 * Customer-facing product reads for the browser (StoreContext etc.).
 *
 * These use the browser client and are governed by RLS. Server Components
 * should read products through `products-server.ts` (the server client) instead
 * so a browser-only client never runs during SSR.
 *
 * NOTE: product writes (create / update / delete, status toggles, stock
 * adjustments) are privileged admin operations. They deliberately do NOT live
 * here — they run server-side with the service-role client behind
 * `requireAdmin()`. See `src/app/actions/admin/*`.
 */

/**
 * Get all products
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return transformProduct(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Get products by gender
 */
export async function getProductsByGender(gender: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('gender', gender)
      .eq('status', 'live')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products by gender:', error);
    return [];
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('status', 'live')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(transformProduct);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
