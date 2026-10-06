import type { Gender, Product } from "@/lib/types";

/** The audience sub-navigation shown under each top-level category (Clothing / Footwear). */
export const GENDER_OPTIONS: { id: Gender; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "kids", label: "Kids" },
];

export const GENDER_LABELS: Record<Gender, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  unisex: "Unisex",
};

/** Possessive label used in page titles, e.g. Men's Clothing / Kids' Footwear. */
export function genderCollectionTitle(gender: Gender, categoryName: string): string {
  const possessive = gender === "kids" ? "Kids'" : `${GENDER_LABELS[gender]}'s`;
  return `${possessive} ${categoryName}`;
}

export function isGender(value: string | null | undefined): value is Gender {
  return value === "men" || value === "women" || value === "kids";
}

/**
 * Resolve a product's audience. Products carry an explicit `gender` tag; when one is
 * missing (for example a product created later from the Admin panel) we infer it from
 * the name / sub-category so it still surfaces in the correct collection.
 */
export function getProductGender(
  p: Pick<Product, "gender" | "name" | "subCategory">
): Gender {
  if (p.gender) return p.gender;
  const hay = `${p.name} ${p.subCategory ?? ""}`.toLowerCase();
  if (/\b(kids?|boys?|girls?|toddler|infant|baby)\b|\byrs\b|years?/.test(hay)) return "kids";
  if (
    /\b(women|woman|womens|ladies|girl|saree|anarkali|kurti|dress|maxi|frock|blouse|heels?|ballet|espadrille)\b/.test(
      hay
    )
  ) {
    return "women";
  }
  if (
    /\b(men|man|mens|menswear|shirt|blazer|chino|trouser|loafer|derby|oxford|mojri|jutti)\b/.test(
      hay
    )
  ) {
    return "men";
  }
  return "unisex";
}

/**
 * Whether a product belongs in the requested gender collection. Unisex pieces are
 * shared between the men's and women's collections but not the kids' one.
 */
export function matchesGender(p: Product, gender: string): boolean {
  if (!gender || gender === "all") return true;
  const g = getProductGender(p);
  if (g === gender) return true;
  return g === "unisex" && (gender === "men" || gender === "women");
}
