"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getProductById } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

type WishlistSort = "recent" | "price-low" | "price-high" | "rating";

export default function WishlistPage() {
  const { wishlist, hydrated, moveToCart, toggleWishlist } = useStore();
  const [sort, setSort] = useState<WishlistSort>("recent");

  const products = useMemo(() => {
    const list = wishlist
      .map((id, index) => ({ p: getProductById(id), index }))
      .filter((x): x is { p: NonNullable<ReturnType<typeof getProductById>>; index: number } => Boolean(x.p));
    const sorted = [...list];
    switch (sort) {
      case "price-low":
        sorted.sort((a, b) => a.p.price - b.p.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.p.price - a.p.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.p.rating - a.p.rating);
        break;
      default:
        sorted.sort((a, b) => a.index - b.index);
    }
    return sorted.map((x) => x.p);
  }, [wishlist, sort]);

  if (hydrated && products.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={
            <Button asChild>
              <Link href="/products">Discover Products</Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-black sm:text-2xl">
          Your Wishlist <span className="text-base font-medium text-neutral-400">— {products.length} Items</span>
        </h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as WishlistSort)}
          aria-label="Sort wishlist"
          className="h-10 cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-black outline-none focus:border-black"
        >
          <option value="recent">Recently Added</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col">
            <ProductCard product={p} showAddToCart={false} />
            <div className="-mt-1 grid grid-cols-2 gap-2 rounded-b-lg border border-t-0 border-neutral-200 bg-white p-2.5">
              <button
                onClick={() => moveToCart(p.id)}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-black text-[11px] font-semibold text-white hover:bg-neutral-800"
              >
                <ShoppingCart size={13} /> Move to Cart
              </button>
              <button
                onClick={() => toggleWishlist(p.id)}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-neutral-300 text-[11px] font-semibold text-neutral-600 hover:border-red-300 hover:text-red-600"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}