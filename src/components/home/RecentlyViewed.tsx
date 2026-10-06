"use client";

import Link from "next/link";
import { Clock, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";

export function RecentlyViewed() {
  const { recentlyViewed, removeRecentlyViewed, products } = useStore();
  const getProductById = (id: string) => products.find((p: any) => p.id === id);
  const viewedProducts = recentlyViewed.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (viewedProducts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100">
            <Clock size={18} className="text-black" />
          </span>
          <h2 className="text-lg font-bold text-black sm:text-xl">Recently Viewed</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {viewedProducts.slice(0, 10).map((p) => (
          <div key={p.id} className="relative">
            <button
              onClick={() => removeRecentlyViewed(p.id)}
              aria-label="Remove from recently viewed"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow hover:text-black"
            >
              <X size={14} />
            </button>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecentlyViewedEmpty() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
        <Clock size={28} className="text-neutral-300" />
        <h3 className="mt-3 text-base font-bold text-black">No recently viewed products</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Products you open will appear here so you can pick up where you left off.
        </p>
        <Button asChild className="mt-5">
          <Link href="/products">Start Browsing</Link>
        </Button>
      </div>
    </section>
  );
}