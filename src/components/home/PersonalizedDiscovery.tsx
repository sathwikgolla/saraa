"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { products, getProductById } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";

export function PersonalizedDiscovery() {
  const { recentlyViewed, wishlist, cart, hydrated } = useStore();

  const { picks, isPersonalized } = useMemo(() => {
    // Consistent fallback for SSR and initial guest view
    const defaultPicks = [...products]
      .filter((p) => p.rating >= 4.3)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 4);

    if (!hydrated) {
      return { picks: defaultPicks, isPersonalized: false };
    }

    const viewed = recentlyViewed;
    const wished = wishlist;
    const cartIds = cart.map((i) => i.productId);

    // If user has any interaction signals
    const hasSignals = viewed.length > 0 || wished.length > 0 || cartIds.length > 0;

    if (hasSignals) {
      const viewedProducts = viewed.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
      const wishedProducts = wished.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
      const cartProducts = cartIds.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

      const affinityCategories = new Set([
        ...viewedProducts.map((p) => p.categoryId),
        ...wishedProducts.map((p) => p.categoryId),
        ...cartProducts.map((p) => p.categoryId),
      ]);

      const excludeIds = new Set([...viewed, ...wished, ...cartIds]);
      const matched = products
        .filter((p) => !excludeIds.has(p.id) && affinityCategories.has(p.categoryId))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

      if (matched.length > 0) {
        return { picks: matched, isPersonalized: true };
      }
    }

    // Default for guest / new users: Popular picks
    const popularPicks = [...products]
      .filter((p) => p.rating >= 4.3)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 4);

    return { picks: popularPicks, isPersonalized: false };
  }, [recentlyViewed, wishlist, cart, hydrated]);

  return (
    <div className="space-y-12">
      {/* 1. Continue Shopping / Recently Viewed (Appears when customer has browsing history) */}
      <RecentlyViewed />

      {/* 2. Picked For You / Popular Picks Section */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                {isPersonalized ? (
                  <HeartHandshake size={17} className="text-black" />
                ) : (
                  <Sparkles size={17} className="text-black" />
                )}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {isPersonalized ? "Tailored Just For You" : "Customer Favorites"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              {isPersonalized ? "Picked For You" : "Popular Picks For You"}
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              {isPersonalized
                ? "Recommendations based on categories and styles you love"
                : "Top customer-rated styles and footwear curated by our stylists"}
            </p>
          </div>
          <Link
            href="/products?sort=rating"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
          >
            View more top picks <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
