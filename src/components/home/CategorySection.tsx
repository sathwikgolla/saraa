"use client";

import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { handleImageError } from "@/lib/utils";

const CORE_CATEGORIES = [
  {
    id: "clothing",
    name: "Clothing",
    subtext: "Kurtis, Sarees, Formal Shirts, T-Shirts, Denims & Kids Wear",
    image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=800&q=80",
    tags: ["Anarkali Kurtas", "Oxford Shirts", "Denim Jackets", "Festive Sets"],
    badge: "24 Styles Live",
    href: "/products?category=clothing",
  },
  {
    id: "footwear",
    name: "Footwear",
    subtext: "Sneakers, Wedge Sandals, Formal Brogues, Espadrilles & Ethnic Juttis",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    tags: ["Minimal Sneakers", "Ethnic Juttis", "Leather Brogues", "Wedges"],
    badge: "16 Styles Live",
    href: "/products?category=footwear",
  },
];

const CURATED_HIGHLIGHTS = [
  {
    name: "Women's Ethnic & Kurtas",
    department: "Clothing",
    count: "10+ Styles",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80",
    href: "/products?category=clothing",
  },
  {
    name: "Men's Shirts & Casuals",
    department: "Clothing",
    count: "8+ Styles",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
    href: "/products?category=clothing",
  },
  {
    name: "Kids' Celebrations",
    department: "Clothing",
    count: "6+ Styles",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=500&q=80",
    href: "/products?category=clothing",
  },
  {
    name: "Sneakers & Formals",
    department: "Footwear",
    count: "16 Styles",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
    href: "/products?category=footwear",
  },
];

export function CategorySection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
              <Layers size={17} className="text-black" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Curated Wardrobe
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
            Shop By Category
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            Handcrafted clothing and footwear thoughtfully designed with premium fabrics and modern comfort
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
        >
          View all products <ArrowRight size={15} />
        </Link>
      </div>

      {/* Primary 2 Hero Category Cards: Clothing & Footwear */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {CORE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-xl"
          >
            {/* Image Container with Hover Zoom */}
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Top Badge */}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-black backdrop-blur-sm shadow-sm">
                  {cat.badge}
                </span>
              </div>

              {/* Card Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                <h3 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-200 line-clamp-2">
                  {cat.subtext}
                </p>

                {/* Sub-tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Shop Now CTA */}
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
                  <span className="text-xs font-bold tracking-wide uppercase text-white group-hover:underline">
                    Explore {cat.name} Collection
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Curated Departments Highlight Strip */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-neutral-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Curated Style Highlights
            </h3>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-neutral-600 hover:text-black hover:underline"
          >
            Browse Full Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CURATED_HIGHLIGHTS.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white p-2.5 transition-all hover:border-black/30 hover:shadow-sm"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  {c.department}
                </span>
                <h4 className="truncate text-xs font-bold text-black group-hover:underline">
                  {c.name}
                </h4>
                <p className="text-[11px] text-neutral-500 font-medium">
                  {c.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
