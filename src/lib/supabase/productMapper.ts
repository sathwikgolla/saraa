import type { Product, ProductVariant } from '@/lib/types';

/**
 * Transform a `products` row (optionally with an embedded `product_variants`
 * array) into the app's `Product` shape.
 *
 * Shared by the browser read module (`products.ts`) and the server read module
 * (`products-server.ts`) so it does not pull in either Supabase client.
 */
export function transformProduct(data: any): Product {
  const variants: ProductVariant[] =
    data.product_variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: Number(v.stock ?? 0),
      reservedStock: Number(v.reserved_stock ?? 0),
      priceOverride: v.price_override ? Number(v.price_override) : undefined,
    })) ?? [];

  const variantStockSum = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const stock = variants.length > 0 ? variantStockSum : Number(data.stock ?? 0);

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    brand: data.brand,
    description: data.description,
    categoryId: data.category_id,
    subCategory: data.sub_category,
    gender: data.gender,
    price: Number(data.price),
    mrp: Number(data.mrp),
    costPrice: data.cost_price ? Number(data.cost_price) : undefined,
    rating: Number(data.rating),
    reviews: data.reviews,
    images: data.images,
    colors: data.colors,
    sizes: data.sizes,
    badges: data.badges,
    specifications: data.specifications,
    variants,
    stock,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
