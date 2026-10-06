"use client";

import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/product/ProductCard";

export function Recommended() {
  const { recentlyViewed, wishlist, cart, hydrated, products } = useStore();

  const recs = useMemo(() => {
    if (!hydrated) return [];

    // Gather signal ids
    const viewed = recentlyViewed;
    const wished = wishlist;
    const cartIds = cart.map((i) => i.productId);

    // Build score
    const score = new Map<string, number>();
    const add = (id: string, weight: number) => {
      score.set(id, (score.get(id) ?? 0) + weight);
    };

    const getProductById = (id: string) => products.find((p: any) => p.id === id);
    const viewedProducts = viewed.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
    const wishedProducts = wished.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
    const cartProducts = cartIds.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

    // Categories viewed get +1, their other products boosted
    const viewedCats = new Set(viewedProducts.map((p: any) => (p as any).categoryId));
    for (const p of products) {
      if (viewedCats.has((p as any).categoryId)) add(p.id, 1);
    }
    // Similar categories of wishlist/cart products
    const likedCats = new Set([...wishedProducts, ...cartProducts].map((p: any) => (p as any).categoryId));
    for (const p of products) {
      if (likedCats.has((p as any).categoryId)) add(p.id, 2);
    }
    // Never recommend items already viewed/wished/in cart
    const exclude = new Set([...viewed, ...wished, ...cartIds]);
    return products
      .filter((p: any) => !exclude.has(p.id))
      .sort((a: any, b: any) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0))
      .slice(0, 8);
  }, [recentlyViewed, wishlist, cart, hydrated, products]);

  if (!hydrated || recs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black">
          <Sparkles size={18} className="text-white" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-black sm:text-xl">Recommended For You</h2>
          <p className="text-xs text-neutral-500 sm:text-sm">Picked just for you</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {recs.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}