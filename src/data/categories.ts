import type { Category } from "@/lib/types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

export const categories: Category[] = [
  {
    id: "men",
    name: "Men",
    slug: "men",
    image: img("photo-1521572163474-6864f9cf17ab"),
    description: "T-shirts, shirts & casuals",
  },
  {
    id: "women",
    name: "Women",
    slug: "women",
    image: img("photo-1566206091558-7f218b696731"),
    description: "Kurtas, dresses & more",
  },
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    image: img("photo-1505740420928-5e560c06d30e"),
    description: "Headphones, wearables & gadgets",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image: img("photo-1556911220-bff31c812dba"),
    description: "Cookware, decor & essentials",
  },
  {
    id: "beauty",
    name: "Beauty",
    slug: "beauty",
    image: img("photo-1596462502278-27bfdc403348"),
    description: "Skincare, makeup & fragrances",
  },
  {
    id: "footwear",
    name: "Footwear",
    slug: "footwear",
    image: img("photo-1542291026-7eec264c27ff"),
    description: "Sneakers, sandals & more",
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    image: img("photo-1491637639811-60e2756cc1c7"),
    description: "Bags, watches & eyewear",
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}