import type { Category } from "@/lib/types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

export const categories: Category[] = [
  {
    id: "clothing",
    name: "Clothing",
    slug: "clothing",
    image: img("photo-1521572163474-6864f9cf17ab"),
    description: "Shirts, T-shirts, dresses, kurtas, jeans, jackets & kids wear",
  },
  {
    id: "footwear",
    name: "Footwear",
    slug: "footwear",
    image: img("photo-1542291026-7eec264c27ff"),
    description: "Sneakers, running shoes, loafers, formal shoes & sandals",
  },
];

export function getCategory(id: string): Category | undefined {
  if (id === "men" || id === "women" || id === "kids") {
    return categories.find((c) => c.id === "clothing");
  }
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  if (slug === "men" || slug === "women" || slug === "kids") {
    return categories.find((c) => c.slug === "clothing");
  }
  return categories.find((c) => c.slug === slug);
}