import { supabase } from './client';
import type { Category } from '@/lib/types';

/**
 * Public catalog reads (governed by RLS: active rows only).
 *
 * Writes are privileged admin operations and live in
 * `src/app/actions/admin/categories.ts` behind `requireAdmin()`.
 */

export interface SubcategoryOption {
  id: string;
  categoryId: string;
  gender: string;
  name: string;
  slug: string;
  sortOrder: number;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) throw error;

    return data.map(transformCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return transformCategory(data);
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return transformCategory(data);
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

// NOTE: subcategory options are no longer read from a database table. The
// hierarchy lives on the existing `categories` table (its `subcategories`
// text[] column) and is expanded by `buildSubcategoryOptions()` in
// `@/lib/catalogTaxonomy`. There is intentionally NO query against
// `public.subcategories` anywhere in this app.

/**
 * Transform database category to app category format
 */
function transformCategory(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    image: data.image,
    description: data.description,
  };
}
