"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  Heart,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Rating } from "@/components/ui/Rating";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { StockBadge } from "@/components/product/StockBadge";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductImageZoom } from "@/components/product/ProductImageZoom";
import { DeliveryChecker } from "@/components/product/DeliveryChecker";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductQA } from "@/components/product/ProductQA";
import { cn, discountPercent, formatCount, formatDeliveryDate, getProductStock, handleImageError } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const {
    addToCart,
    toast,
    isWishlisted,
    toggleWishlist,
    isPriceAlerted,
    togglePriceAlert,
    isNotified,
    toggleNotify,
    addRecentlyViewed,
    products,
  } = useStore();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | undefined>(
    product.colors[0] ?? undefined
  );
  const [size, setSize] = useState<string | undefined>(product.sizes[0] ?? undefined);
  const [descOpen, setDescOpen] = useState(true);

  const wished = isWishlisted(product.id);
  const priceAlerted = isPriceAlerted(product.id);
  const pct = discountPercent(product.mrp, product.price);

  const currentStock = getProductStock(product, color, size);
  const isOutOfStock = currentStock <= 0;

  const relatedProducts = useMemo(() => {
    return products
      .filter((p: any) => p.id !== product.id && (p as any).categoryId === (product as any).categoryId)
      .slice(0, 6);
  }, [products, product.id, (product as any).categoryId]);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const requireOptions = () => {
    if (product.colors.length && !color) {
      toast("Please select a color", "error");
      return false;
    }
    if (product.sizes.length && !size) {
      toast("Please select a size", "error");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast("This item is currently out of stock", "error");
      return;
    }
    if (!requireOptions()) return;
    if (qty > currentStock) {
      toast(`Only ${currentStock} item(s) available in stock`, "error");
      return;
    }
    await addToCart(product.id, qty, color, size);
    toast("Added to cart");
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast("This item is currently out of stock", "error");
      return;
    }
    if (!requireOptions()) return;
    if (qty > currentStock) {
      toast(`Only ${currentStock} item(s) available in stock`, "error");
      return;
    }
    await addToCart(product.id, qty, color, size);
    toast("Proceeding to checkout");
    router.push("/checkout");
  };

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-black">
          Products
        </Link>
        <ChevronRight size={12} />
        <Link
          href={`/products?category=${product.categoryId}`}
          className="capitalize hover:text-black"
        >
          {product.categoryId}
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery with zoom */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <ProductImageZoom
            images={product.images}
            price={product.price}
            mrp={product.mrp}
            alt={product.name}
          />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-neutral-500">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-black sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Rating value={product.rating} size={15} />
              <span className="text-sm font-semibold text-black">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-neutral-400">
              {formatCount(product.reviews)} ratings & reviews
            </span>
            {isOutOfStock ? (
              <StockBadge stock={0} />
            ) : currentStock < 20 ? (
              <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                Only {currentStock} left
              </span>
            ) : (
              <StockBadge stock={currentStock} />
            )}
          </div>

          <div className="mt-4 rounded-lg bg-neutral-50 p-4">
            <PriceDisplay price={product.price} mrp={product.mrp} size="lg" />
            {pct > 0 && (
              <p className="mt-1 text-xs text-neutral-500">
                You save <span className="font-semibold text-green-700">₹{(product.mrp - product.price).toLocaleString("en-IN")}</span> on MRP
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Inclusive of all taxes · Free delivery on orders over ₹499
            </p>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-bold text-black">
                Color: <span className="font-medium text-neutral-500">{color}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      color === c
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-700 hover:border-black"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-bold text-black">
                Size: <span className="font-medium text-neutral-500">{size}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      size === s
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-neutral-700 hover:border-black"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          {!isOutOfStock && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div>
                <p className="mb-1.5 text-sm font-bold text-black">Quantity</p>
                <QuantitySelector value={qty} onChange={setQty} max={Math.min(10, currentStock)} />
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {isOutOfStock ? (
              <>
                <Button size="lg" variant="outline" disabled className="w-full opacity-60 cursor-not-allowed">
                  Out of Stock
                </Button>
                <Button
                  size="lg"
                  variant={isNotified(product.id) ? "primary" : "outline"}
                  onClick={() => toggleNotify(product.id)}
                  className="w-full"
                >
                  <Bell size={18} /> {isNotified(product.id) ? "Notification Set ✓" : "Notify Me When Available"}
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="outline" onClick={handleAddToCart} className="w-full">
                  <ShoppingCart size={18} /> Add to Cart
                </Button>
                <Button size="lg" onClick={handleBuyNow} className="w-full">
                  <Zap size={18} /> Buy Now
                </Button>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                wished
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 text-neutral-700 hover:border-black"
              )}
            >
              <Heart size={14} className={cn(wished && "fill-white")} />
              {wished ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
              onClick={() => togglePriceAlert(product.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                priceAlerted
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 text-neutral-700 hover:border-black"
              )}
            >
              <Bell size={14} />
              {priceAlerted ? "Price alert set ✓" : "Notify me if price drops"}
            </button>
          </div>

          {/* Delivery */}
          <div className="mt-6 rounded-lg border border-neutral-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-black">
              <Truck size={16} /> Delivery Options
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                Free delivery by{" "}
                <span className="font-semibold text-black">
                  {formatDeliveryDate()}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                Cash on Delivery available
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                7-day easy returns & replacement
              </li>
            </ul>
          </div>

          <DeliveryChecker />

          {/* Trust */}
          <div className="mt-3 flex items-center gap-4 rounded-lg border border-neutral-200 px-4 py-3 text-xs font-medium text-neutral-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-black" /> Secure payment
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCcw size={16} className="text-black" /> Easy returns
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={16} className="text-black" /> 100% genuine
            </span>
          </div>
        </div>
      </div>

      {/* Description / specs / reviews */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-neutral-200">
            <button
              onClick={() => setDescOpen((o) => !o)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-bold text-black"
            >
              Product Description
              <ChevronRight
                size={18}
                className={cn("transition-transform", descOpen && "rotate-90")}
              />
            </button>
            {descOpen && (
              <div className="border-t border-neutral-200 px-5 py-4">
                <p className="text-sm leading-relaxed text-neutral-600">
                  {product.description}
                </p>

                <h4 className="mb-3 mt-6 text-sm font-bold text-black">Specifications</h4>
                <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
                  {product.specifications.map((s) => (
                    <div
                      key={s.label}
                      className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm"
                    >
                      <dt className="font-medium text-neutral-500">{s.label}</dt>
                      <dd className="font-semibold text-black">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Reviews */}
          <ReviewsSection product={product} />

          {/* Q&A */}
          <ProductQA product={product} />
        </div>

        {/* Related products (desktop sidebar fallback) */}
        <div className="hidden lg:block">
          <div className="sticky top-40 rounded-lg border border-neutral-200 p-5">
            <h3 className="mb-3 text-sm font-bold text-black">Related products</h3>
            <div className="space-y-3">
              {relatedProducts.slice(0, 3).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="flex gap-3 rounded-md border border-neutral-100 p-2 transition-colors hover:border-neutral-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-14 w-14 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs font-semibold text-black">{p.name}</p>
                    <PriceDisplay price={p.price} mrp={p.mrp} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related products grid */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-black sm:text-xl">
          You may also like
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {relatedProducts.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}