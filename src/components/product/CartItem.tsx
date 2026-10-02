"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/lib/types";
import { getProductById } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQty, removeFromCart, moveToWishlist } = useStore();
  const product = getProductById(item.productId);
  if (!product) return null;

  const lineTotal = product.price * item.qty;

  return (
    <div className="flex gap-4 p-4">
      <Link
        href={`/products/${product.slug}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-semibold text-black hover:underline"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-xs text-neutral-500">{product.brand}</p>
            {(item.color || item.size) && (
              <p className="mt-0.5 text-xs text-neutral-500">
                {[item.color, item.size].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <PriceDisplay price={lineTotal} mrp={product.mrp * item.qty} size="sm" />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantitySelector
            size="sm"
            value={item.qty}
            onChange={(q) => updateQty(item.key, q)}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => moveToWishlist(item.key)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black"
            >
              <Heart size={14} /> Save for later
            </button>
            <button
              onClick={() => removeFromCart(item.key)}
              aria-label="Remove item"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}