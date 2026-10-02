import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { categories } from "@/data/categories";

const CORE_CATEGORIES = [
  {
    id: "women",
    name: "Women",
    subtext: "Dresses, Kurtis, Tops, Jeans & Ethnic Wear",
    image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=700&q=80",
    tags: ["Kurtis", "Dresses", "Ethnic", "Tops"],
    badge: "500+ Styles",
  },
  {
    id: "men",
    name: "Men",
    subtext: "T-Shirts, Shirts, Jeans, Trousers & Casuals",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
    tags: ["T-Shirts", "Shirts", "Jackets", "Denim"],
    badge: "New Season",
  },
  {
    id: "kids",
    name: "Kids",
    subtext: "Boys, Girls, Festive Sets & Party Wear",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=700&q=80",
    tags: ["Boys Kurta", "Girls Frock", "Festive"],
    badge: "Trending",
  },
  {
    id: "footwear",
    name: "Footwear",
    subtext: "Sneakers, Sandals, Casual & Formal Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    tags: ["Sneakers", "Wedges", "Espadrilles", "Boots"],
    badge: "Top Rated",
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
            Handcrafted apparel and footwear thoughtfully designed for every member of your family
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
        >
          View all categories <ArrowRight size={15} />
        </Link>
      </div>

      {/* Primary 4 Category Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CORE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-lg"
          >
            {/* Image Container with Hover Zoom */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top Badge */}
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-black backdrop-blur-sm shadow-sm">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Overlay Info */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-neutral-100">
                  {cat.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-300">
                  {cat.subtext}
                </p>

                {/* Subcategory Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Shop Now CTA Button */}
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
                  <span className="text-xs font-bold tracking-wide uppercase text-white group-hover:underline">
                    Shop Now
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Quick-Access Categories Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-xs font-bold text-neutral-600">
          Also exploring:
        </span>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => !["women", "men", "kids", "footwear"].includes(c.id))
            .map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
              >
                {c.name}
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
