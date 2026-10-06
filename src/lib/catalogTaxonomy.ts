import type { Category } from "@/lib/types";
import type { SubcategoryOption } from "@/lib/supabase/categories";

/**
 * The catalog's category → audience → subcategory hierarchy.
 *
 * IMPORTANT: there is no `public.subcategories` table. The hierarchy is stored
 * on the EXISTING `public.categories` table (the `subcategories text[]` column)
 * and expressed here so the product form and storefront agree on the exact
 * allowed values per category + audience. `products.sub_category` stores the
 * chosen name; `products.category_id` stores the real foreign key.
 */

export const AUDIENCE_GENDERS = ["men", "women", "kids"] as const;
export type AudienceGender = (typeof AUDIENCE_GENDERS)[number];

/** Category id (== slug) → audience → ordered subcategory names. */
export const CATEGORY_TAXONOMY: Record<string, Record<AudienceGender, string[]>> = {
  clothing: {
    men: [
      "T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Sweatshirts",
      "Hoodies", "Shorts", "Track Pants", "Ethnic Wear", "Innerwear",
    ],
    women: [
      "T-Shirts", "Tops", "Shirts", "Jeans", "Trousers", "Dresses", "Skirts",
      "Jackets", "Sweatshirts", "Hoodies", "Shorts", "Track Pants",
      "Ethnic Wear", "Innerwear",
    ],
    kids: [
      "T-Shirts", "Shirts", "Jeans", "Trousers", "Dresses", "Shorts",
      "Jackets", "Sweatshirts", "Hoodies", "Ethnic Wear",
    ],
  },
  footwear: {
    men: [
      "Casual Shoes", "Sports Shoes", "Running Shoes", "Sneakers",
      "Formal Shoes", "Loafers", "Sandals", "Slippers", "Boots",
    ],
    women: [
      "Casual Shoes", "Sports Shoes", "Sneakers", "Heels", "Flats",
      "Sandals", "Slippers", "Boots", "Loafers",
    ],
    kids: [
      "School Shoes", "Sports Shoes", "Sneakers", "Sandals", "Slippers",
      "Boots", "Casual Shoes",
    ],
  },
};

export function slugifySubcategory(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Resolve a taxonomy entry by category id or slug (case-insensitive). */
function taxonomyFor(categoryIdOrSlug: string | undefined): Record<AudienceGender, string[]> | null {
  if (!categoryIdOrSlug) return null;
  const key = categoryIdOrSlug.trim().toLowerCase();
  if (CATEGORY_TAXONOMY[key]) return CATEGORY_TAXONOMY[key];
  // Fall back to matching by slug for custom categories.
  for (const [id, value] of Object.entries(CATEGORY_TAXONOMY)) {
    if (slugifySubcategory(id) === slugifySubcategory(key)) return value;
  }
  return null;
}

/**
 * Subcategory names allowed for one category + audience.
 * Passing no / unknown gender returns the de-duplicated union of all audiences.
 */
export function genderSubcategories(categoryId: string, gender?: string): string[] {
  const tax = taxonomyFor(categoryId);
  if (!tax) return [];
  if (gender && (AUDIENCE_GENDERS as readonly string[]).includes(gender)) {
    return tax[gender as AudienceGender];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of AUDIENCE_GENDERS) {
    for (const name of tax[g]) {
      if (!seen.has(name)) {
        seen.add(name);
        out.push(name);
      }
    }
  }
  return out;
}

/**
 * Build the flat `SubcategoryOption[]` the storefront and admin UI consume —
 * derived from the category rows (DB) plus the shared taxonomy (code). Extra
 * names added to `categories.subcategories` that aren't in the taxonomy are
 * offered for every audience so admin-authored values stay selectable.
 */
export function buildSubcategoryOptions(categories: Category[]): SubcategoryOption[] {
  const options: SubcategoryOption[] = [];

  for (const category of categories) {
    const tax = taxonomyFor(category.id) ?? taxonomyFor(category.slug);
    const known = new Set<string>();

    if (tax) {
      let order = 0;
      for (const gender of AUDIENCE_GENDERS) {
        for (const name of tax[gender]) {
          known.add(name.toLowerCase());
          options.push({
            id: `${category.id}-${gender}-${slugifySubcategory(name)}`,
            categoryId: category.id,
            gender,
            name,
            slug: slugifySubcategory(name),
            sortOrder: order++,
          });
        }
      }
    }

    const extras = new Set<string>();
    for (const raw of category.subcategories ?? []) {
      const name = (raw ?? "").trim();
      if (!name || known.has(name.toLowerCase()) || extras.has(name.toLowerCase())) continue;
      extras.add(name.toLowerCase());
      for (const gender of AUDIENCE_GENDERS) {
        options.push({
          id: `${category.id}-${gender}-${slugifySubcategory(name)}`,
          categoryId: category.id,
          gender,
          name,
          slug: slugifySubcategory(name),
          sortOrder: 900,
        });
      }
    }
  }

  return options;
}

/** Whether a name is a valid subcategory for the given category + audience. */
export function isAllowedSubcategory(
  categoryId: string,
  gender: string,
  name: string | undefined
): boolean {
  const value = (name ?? "").trim();
  if (!value) return false;
  const wanted = slugifySubcategory(value);
  return genderSubcategories(categoryId, gender).some(
    (n) => slugifySubcategory(n) === wanted
  );
}
