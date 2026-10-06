"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * Server actions for inventory / stock (admin only).
 *
 * Stock adjustments keep `product_variants.stock` and the aggregated
 * `products.stock` consistent, and always run through the service-role client
 * after a server-side admin check.
 */

/** Invalidate the storefront + inventory surfaces that render stock levels. */
function revalidateStockViews() {
  revalidatePath("/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}

export async function adminAdjustStock(
  productId: string,
  variantSku: string,
  change: number
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    // Get current variant
    const { data: variant } = await adminSupabase
      .from('product_variants')
      .select('stock')
      .eq('sku', variantSku)
      .single();

    if (!variant) {
      return { success: false, status: 500, error: 'Variant not found' };
    }

    const newStock = Math.max(0, variant.stock + change);

    const { error } = await adminSupabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('sku', variantSku);

    if (error) throw error;

    // Recompute the product's aggregated stock from its variants.
    const { data: variants } = await adminSupabase
      .from('product_variants')
      .select('stock')
      .eq('product_id', productId);

    const totalStock = variants?.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0) ?? 0;

    await adminSupabase
      .from('products')
      .update({ stock: totalStock })
      .eq('id', productId);

    revalidateStockViews();
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

export async function adminBulkUpdateStock(
  rows: { sku: string; stock: number }[]
): Promise<AdminActionResult<{ updated: number; errors: string[] }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  let updated = 0;
  const errors: string[] = [];
  const affectedProductIds = new Set<string>();

  for (const row of rows) {
    try {
      // Resolve the owning product so its aggregated stock can be recomputed.
      const { data: variant } = await adminSupabase
        .from('product_variants')
        .select('id, product_id')
        .eq('sku', row.sku)
        .single();

      if (!variant) {
        errors.push(`SKU not found: ${row.sku}`);
        continue;
      }

      const { error } = await adminSupabase
        .from('product_variants')
        .update({ stock: Math.max(0, row.stock) })
        .eq('sku', row.sku);

      if (error) {
        errors.push(`Failed to update ${row.sku}: ${error.message}`);
      } else {
        updated++;
        affectedProductIds.add(variant.product_id);
      }
    } catch {
      errors.push(`Failed to update ${row.sku}`);
    }
  }

  // Keep the product-level aggregated stock consistent with its variants.
  for (const productId of affectedProductIds) {
    const { data: variants } = await adminSupabase
      .from('product_variants')
      .select('stock')
      .eq('product_id', productId);

    const totalStock =
      variants?.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0) ?? 0;

    await adminSupabase.from('products').update({ stock: totalStock }).eq('id', productId);
  }

  revalidateStockViews();
  return { success: true, data: { updated, errors } };
}
