"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Tag, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { handleImageError } from "@/lib/utils";

const HERO_TILES = [
  {
    title: "Women's Fashion",
    image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=600&q=80",
    href: "/products?category=women",
    badge: "Kurtas & Dresses",
    tall: true,
  },
  {
    title: "Footwear Collection",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    href: "/products?category=footwear",
    badge: "Sneakers & Flats",
    tall: false,
  },
  {
    title: "Men's Apparel",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    href: "/products?category=men",
    badge: "Denims & Tees",
    tall: false,
  },
  {
    title: "Kids' Collection",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80",
    href: "/products?category=kids",
    badge: "Festive & Casual",
    tall: true,
  },
];

export function HomeHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-xl">
        {/* Decorative subtle ambient lighting */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-neutral-700/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-neutral-800/40 blur-3xl" />

        <div className="relative grid items-center lg:grid-cols-12">
          {/* Left content */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7 lg:p-14">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm text-neutral-200">
                <Sparkles size={13} className="text-amber-400" />
                New Season Collection
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-300">
                <Tag size={12} />
                Free Shipping over ₹499
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              Discover <br />
              <span className="text-neutral-300">Your Style.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
              Explore the latest styles for Women, Men, Kids and Footwear at Miracle Collections.
              Premium fabrics, contemporary fits, and timeless everyday essentials.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <a
                href="#categories"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Explore Categories
              </a>
            </div>

            {/* Mobile / Tablet Visual Demo Image Strip (Visible < lg) */}
            <div className="mt-8 block lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Trending Departments
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {HERO_TILES.map((tile) => (
                  <Link
                    key={tile.title}
                    href={tile.href}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/15"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tile.image}
                        alt={tile.title}
                        loading="eager"
                        decoding="async"
                        onError={handleImageError}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="truncate text-xs font-bold text-white group-hover:underline">
                        {tile.title}
                      </p>
                      <p className="truncate text-[10px] text-neutral-400">
                        {tile.badge}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Category Quick Badges */}
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Curated Departments
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  { name: "Women's Collection", href: "/products?category=women" },
                  { name: "Men's Collection", href: "/products?category=men" },
                  { name: "Kids' Festive & Casual", href: "/products?category=kids" },
                  { name: "Footwear & Shoes", href: "/products?category=footwear" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {item.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image Collage (Desktop lg: and up) */}
          <div className="relative hidden h-full min-h-[460px] lg:col-span-5 lg:block">
            <div className="grid h-full grid-cols-2 gap-2 p-4">
              <div className="space-y-2">
                <Link href="/products?category=women" className="group block overflow-hidden rounded-xl bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=600&q=80"
                    alt="Women's Fashion"
                    loading="eager"
                    decoding="async"
                    onError={handleImageError}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <Link href="/products?category=footwear" className="group block overflow-hidden rounded-xl bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                    alt="Footwear Collection"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>
              <div className="space-y-2 pt-6">
                <Link href="/products?category=men" className="group block overflow-hidden rounded-xl bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
                    alt="Men's Apparel"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <Link href="/products?category=kids" className="group block overflow-hidden rounded-xl bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80"
                    alt="Kids' Collection"
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>
            </div>

            {/* Floating Trust Card */}
            <div className="absolute bottom-6 left-6 rounded-xl border border-white/20 bg-black/80 p-3.5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-extrabold text-white">Miracle Collections</p>
              <p className="text-[11px] text-neutral-300">Single-Store Direct Fashion • Genuine Quality</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-white" /> 100% Genuine</span>
                <span className="flex items-center gap-1"><Truck size={11} className="text-white" /> Fast Dispatch</span>
                <span className="flex items-center gap-1"><RefreshCw size={11} className="text-white" /> 7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

