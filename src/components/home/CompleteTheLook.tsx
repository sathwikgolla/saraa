"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { getProductById } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { formatPrice, handleImageError } from "@/lib/utils";

interface LookBundle {
  id: string;
  title: string;
  audience: "Women" | "Men" | "Kids";
  tagline: string;
  productIds: string[];
}

const LOOKS: LookBundle[] = [
  {
    id: "women-festive",
    title: "Festive Fusion Ensemble",
    audience: "Women",
    tagline: "Anarkali Kurta Set + Chic Wedge Sandals + Handcrafted Ethnic Juttis",
    productIds: ["p2", "p23", "mc_f1"],
  },
  {
    id: "men-street",
    title: "Urban Street Everyday",
    audience: "Men",
    tagline: "Pure Cotton Tee + Distressed Denim Jacket + Everyday Sneakers",
    productIds: ["p1", "p3", "p24"],
  },
  {
    id: "kids-festive",
    title: "Celebration Smiles",
    audience: "Kids",
    tagline: "Boys Silk Festive Kurta + Minimal Walkers + Girls Party Frock",
    productIds: ["p31", "p24", "p32"],
  },
];

export function CompleteTheLook() {
  const [activeLookId, setActiveLookId] = useState<string>("women-festive");
  const [added, setAdded] = useState(false);
  const { addToCart, toast } = useStore();

  const currentLook = LOOKS.find((l) => l.id === activeLookId) || LOOKS[0];
  const items = currentLook.productIds
    .map(getProductById)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const totalCurrentPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp, 0);
  const savings = Math.max(0, totalMrp - totalCurrentPrice);

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addToCart(item.id);
    });
    setAdded(true);
    toast(`Added all ${items.length} items from ${currentLook.title} to bag!`);
    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                <Sparkles size={17} className="text-black" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Curated Outfits
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Complete The Look
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              Discover harmonized apparel and footwear sets styled to perfection
            </p>
          </div>

          {/* Look Audience Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {LOOKS.map((look) => {
              const isActive = look.id === activeLookId;
              return (
                <button
                  key={look.id}
                  onClick={() => {
                    setActiveLookId(look.id);
                    setAdded(false);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-black text-white shadow-xs"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-black/30 hover:text-black"
                  }`}
                >
                  {look.audience}: {look.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Look Showcase Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Items breakdown (8 cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {items.map((prod, index) => (
                <div key={prod.id} className="relative">
                  <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3 transition-all hover:border-black/30 hover:shadow-md">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-2 top-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        Piece {index + 1}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-1 flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        {prod.brand}
                      </span>
                      <h4 className="mt-0.5 line-clamp-1 text-xs font-bold text-black group-hover:underline">
                        <Link href={`/products/${prod.slug}`}>{prod.name}</Link>
                      </h4>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-black text-black">
                          {formatPrice(prod.price)}
                        </span>
                        {prod.mrp > prod.price && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            {formatPrice(prod.mrp)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${prod.slug}`}
                        className="mt-3 block text-center text-[11px] font-semibold text-black hover:underline"
                      >
                        Inspect Details →
                      </Link>
                    </div>
                  </div>

                  {/* Plus Icon connector (on tablet/desktop between cards) */}
                  {index < items.length - 1 && (
                    <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 sm:flex">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xs">
                        <Plus size={12} className="text-black" />
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bundle Summary & CTA (4 cols) */}
          <div className="flex flex-col justify-center rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white lg:col-span-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Complete Set Value
            </span>
            <h3 className="mt-1 text-xl font-black text-white">
              {currentLook.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-300">
              {currentLook.tagline}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Bundle Total ({items.length} items)</span>
                <span className="line-through">{formatPrice(totalMrp)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Total Savings</span>
                <span>- {formatPrice(savings)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                <span className="text-sm font-bold text-white">Look Price:</span>
                <span className="text-2xl font-black text-white">
                  {formatPrice(totalCurrentPrice)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={added}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition-all hover:bg-neutral-100 disabled:opacity-80"
            >
              {added ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  Look Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Shop The Complete Look
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-neutral-400">
              Individual items can also be modified in bag
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
