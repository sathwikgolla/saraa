"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Compass,
  Heart,
  Layers,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/product/ProductCard";
import { handleImageError, cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export function AuthenticatedHome({ user }: { user: User }) {
  const {
    products,
    recentlyViewed,
    removeRecentlyViewed,
    getProductById,
    wishlist,
    cart,
    orders,
  } = useStore();

  const firstName = user.name ? user.name.trim().split(" ")[0] : "Customer";
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  // 1. Continue Shopping (Recently viewed with safe fallback)
  const { continueShoppingProducts, isFallbackHistory } = useMemo(() => {
    const viewed = recentlyViewed
      .map((id) => getProductById(id) || products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    if (viewed.length > 0) {
      return {
        continueShoppingProducts: viewed.slice(0, 4),
        isFallbackHistory: false,
      };
    }

    // Safe fallback if user has not browsed yet: Popular items
    const fallback = [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    return {
      continueShoppingProducts: fallback,
      isFallbackHistory: true,
    };
  }, [recentlyViewed, getProductById, products]);

  // 2. Recommended For You (Based on affinity signals or top rated)
  const recommendedProducts = useMemo(() => {
    const viewed = recentlyViewed;
    const wished = wishlist;
    const cartIds = cart.map((i) => i.productId);

    // Identify user's category affinity
    const interactedProducts = [...viewed, ...wished, ...cartIds]
      .map((id) => getProductById(id) || products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const categoryCounts: Record<string, number> = {};
    for (const p of interactedProducts) {
      categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
    }

    const preferredCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    const excludeIds = new Set([...viewed, ...cartIds]);

    if (preferredCategory) {
      const categoryMatches = products
        .filter((p) => p.categoryId === preferredCategory && !excludeIds.has(p.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

      if (categoryMatches.length >= 4) {
        return categoryMatches;
      }
    }

    // Fallback: top-rated picks excluding cart
    return products
      .filter((p) => !cartIds.includes(p.id))
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 4);
  }, [recentlyViewed, wishlist, cart, getProductById, products]);

  // 3. New Arrivals (Filter products with "New" badge or latest)
  const newArrivals = useMemo(() => {
    const tagged = products.filter((p) => p.badges.includes("New"));
    if (tagged.length >= 4) return tagged.slice(0, 4);
    return products.slice(0, 4);
  }, [products]);

  return (
    <main className="flex-1 pb-16">
      {/* 1. Personalized Welcome Section */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-800">
                <Sparkles size={13} className="text-neutral-900" />
                Miracle Member Experience
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="underline decoration-neutral-300 decoration-2 underline-offset-8">
                {firstName}
              </span>
              !
            </h1>
            <p className="mt-2 text-base text-neutral-600 sm:text-lg">
              Discover something you&apos;ll love today.
            </p>
          </div>

          {/* Quick status summary chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm transition-colors hover:border-black hover:text-black"
            >
              <Package size={14} />
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm transition-colors hover:border-black hover:text-black"
            >
              <Heart size={14} />
              {wishlist.length} Wishlist
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm transition-colors hover:border-black hover:text-black"
            >
              <ShoppingCart size={14} />
              {cartCount} in Cart
            </Link>
          </div>
        </div>

        {/* Hero banner area below greeting */}
        <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-neutral-800/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-neutral-800/40 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-200 backdrop-blur-sm">
                  <Tag size={12} /> Personalized For You
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-300">
                  <Truck size={12} /> Complimentary Shipping on Orders Over ₹499
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-tight">
                Curated Styles, <br />
                <span className="text-neutral-300">Tailored For Your Taste.</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
                Explore handpicked clothing and footwear designed for modern comfort
                and everyday elegance. Pick up right where you left off or dive into fresh arrivals.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-black transition-all hover:bg-neutral-100 hover:shadow-md"
                >
                  Start Shopping <ArrowRight size={16} />
                </Link>
                <a
                  href="#recommendations"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  View Recommendations
                </a>
              </div>
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="relative mx-auto aspect-[4/3] max-w-xs overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
                  alt="Personalized Collection"
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                    Miracle Signature
                  </span>
                  <p className="text-xs font-bold text-white">
                    Premium Clothing & Footwear
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Continue Shopping / Recently Viewed */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                <Clock size={17} className="text-black" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {isFallbackHistory ? "Explore To Get Started" : "Recent Browsing History"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Continue Shopping
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              {isFallbackHistory
                ? "Items you open will appear here. In the meantime, here are popular customer favorites."
                : "Pick up right where you left off with items you recently viewed."}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
          >
            Browse all products <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {continueShoppingProducts.map((p) => (
            <div key={p.id} className="relative">
              {!isFallbackHistory && (
                <button
                  onClick={() => removeRecentlyViewed(p.id)}
                  aria-label="Remove from recently viewed"
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recommended For You */}
      <section id="recommendations" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                <Sparkles size={17} className="text-black" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Personalized Picks
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Recommended For You
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              Styles and footwear curated to match your aesthetic and recent interests.
            </p>
          </div>
          <Link
            href="/products?sort=rating"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
          >
            View more recommendations <ArrowRight size={15} />
          </Link>
        </div>

        {/* Responsive horizontal scroll on mobile, 4-col grid on tablet/desktop */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {recommendedProducts.map((p) => (
            <div key={p.id} className="w-56 shrink-0 sm:w-auto sm:shrink">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Shop by Category (Strictly Clothing & Footwear) */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                <Layers size={17} className="text-black" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Core Collections
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              Explore our signature catalog across premium apparel and handcrafted footwear.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Clothing Card */}
          <Link
            href="/products?category=clothing"
            className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-md transition-shadow hover:shadow-xl sm:p-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=800&q=80"
              alt="Clothing Collection"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                24+ Live Styles
              </span>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Clothing Collection
              </h3>
              <p className="mt-1 text-xs text-neutral-200 sm:text-sm">
                Kurtis, Sarees, Oxford Shirts, T-Shirts, Denims & Festive Sets.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white group-hover:underline">
                Explore Clothing <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Footwear Card */}
          <Link
            href="/products?category=footwear"
            className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-md transition-shadow hover:shadow-xl sm:p-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
              alt="Footwear Collection"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                16+ Live Styles
              </span>
              <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Footwear Collection
              </h3>
              <p className="mt-1 text-xs text-neutral-200 sm:text-sm">
                Minimal Sneakers, Ethnic Juttis, Leather Brogues & Wedge Sandals.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white group-hover:underline">
                Explore Footwear <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                <TrendingUp size={17} className="text-black" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Fresh Drops
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              New Arrivals
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              The newest additions to our seasonal clothing and footwear lines.
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
          >
            View all new arrivals <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Special Offer / Promotional Banner */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-12 text-white shadow-lg sm:px-12 lg:px-16 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-90" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-300 backdrop-blur-sm">
                <Sparkles size={13} className="text-amber-400" />
                Member Exclusive Highlight
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Refresh Your Style
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">
                Explore the latest clothing and footwear picks.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-400 lg:justify-start">
                <span>✓ 100% Genuine Apparel</span>
                <span>✓ Doorstep Delivery & Easy Returns</span>
                <span>✓ Verified Customer Satisfaction</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-extrabold text-black transition-all hover:bg-neutral-100 hover:shadow-md"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?sort=discount"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                View Offers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Personalized Account Quick Actions */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
              <Compass size={17} className="text-black" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Your Dashboard
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
            Account Quick Actions
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            Quickly jump into your orders, saved favorites, cart, or profile settings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* My Orders */}
          <Link
            href="/orders"
            className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-black hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-black transition-colors group-hover:bg-black group-hover:text-white">
                <Package size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-black">My Orders</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Track pending shipments, review order history, and request returns.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-bold text-black">
              <span>{orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-black hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-black transition-colors group-hover:bg-black group-hover:text-white">
                <Heart size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-black">Wishlist</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Check prices and availability for the styles you&apos;ve saved for later.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-bold text-black">
              <span>{wishlist.length} {wishlist.length === 1 ? "Item" : "Items"} Saved</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-black hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-black transition-colors group-hover:bg-black group-hover:text-white">
                <ShoppingCart size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-black">Cart</h3>
              <p className="mt-1 text-xs text-neutral-500">
                View items ready in your shopping bag and proceed to checkout.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-bold text-black">
              <span>{cartCount} {cartCount === 1 ? "Item" : "Items"} in Bag</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-black hover:shadow-md"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-black transition-colors group-hover:bg-black group-hover:text-white">
                <UserIcon size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-black">Profile</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Manage your name, mobile number, saved delivery addresses, and password.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-bold text-black">
              <span className="truncate max-w-[140px]">{user.email}</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
