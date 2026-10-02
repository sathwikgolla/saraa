"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { Modal } from "@/components/ui/Modal";
import { Rating } from "@/components/ui/Rating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { StockBadge } from "@/components/product/StockBadge";
import { cn, handleImageError } from "@/lib/utils";

export function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addToCart, toast } = useStore();
  const [img, setImg] = useState(0);
  const [color, setColor] = useState<string | undefined>(product.colors[0] ?? undefined);
  const [size, setSize] = useState<string | undefined>(product.sizes[0] ?? undefined);
  const [qty, setQty] = useState(1);

  const optionsMissing = () => {
    if (product.colors.length && !color) {
      toast("Please select a color", "error");
      return true;
    }
    if (product.sizes.length && !size) {
      toast("Please select a size", "error");
      return true;
    }
    return false;
  };

  const add = () => {
    if (optionsMissing()) return;
    addToCart(product.id, qty, color, size);
    toast("Added to cart");
  };

  const buyNow = () => {
    if (optionsMissing()) return;
    addToCart(product.id, qty, color, size);
    router.push("/checkout");
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-3xl p-0 sm:p-0">
      <div className="grid max-h-[85vh] gap-5 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
        {/* Image */}
        <div>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[img]}
              alt={product.name}
              decoding="async"
              onError={handleImageError}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={cn(
                    "h-12 w-12 overflow-hidden rounded border bg-white",
                    img === i ? "border-black" : "border-neutral-200"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs text-neutral-500">{product.brand}</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-black">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-2">
            <Rating value={product.rating} size={14} showValue />
            <span className="text-xs text-neutral-400">({product.reviews} reviews)</span>
          </div>
          <div className="mt-2">
            <PriceDisplay price={product.price} mrp={product.mrp} size="lg" />
          </div>
          <StockBadge stock={product.stock} className="mt-2" />
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>

          {product.colors.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-black">Color: {color}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "rounded border px-2 py-1 text-xs font-medium",
                      color === c ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600 hover:border-black"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-black">Size: {size}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-9 rounded border px-2 py-1 text-xs font-medium",
                      size === s ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600 hover:border-black"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3">
            <p className="mb-1 text-xs font-bold text-black">Quantity</p>
            <QuantitySelector size="sm" value={qty} onChange={setQty} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={add} disabled={product.stock === 0}>
              <ShoppingCart size={15} /> Add to Cart
            </Button>
            <Button size="sm" onClick={buyNow} disabled={product.stock === 0}>
              <Zap size={15} /> Buy Now
            </Button>
          </div>
          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="mt-3 text-center text-sm font-semibold text-black underline decoration-neutral-300 underline-offset-2 hover:decoration-black"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </Modal>
  );
}