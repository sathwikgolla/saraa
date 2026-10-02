import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-xs sm:p-12 lg:p-16">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-800">
            <Sparkles size={13} className="text-black" />
            Your Fashion Journey Starts Here
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl">
            Ready to Upgrade Your Wardrobe?
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Discover curated looks for Women, Men, Kids, and Footwear tailored for every celebration and everyday lifestyle.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-8 text-sm font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-md"
            >
              <ShoppingBag size={16} />
              Browse All Collections
            </Link>
            <Link
              href="/products?sort=popular"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-6 text-sm font-semibold text-black transition-colors hover:border-black"
            >
              View Trending Now <ArrowRight size={15} />
            </Link>
          </div>

          {/* Quick links to core 4 categories */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-neutral-500">
            <Link href="/products?category=women" className="hover:text-black hover:underline">
              Women&apos;s Store
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/products?category=men" className="hover:text-black hover:underline">
              Men&apos;s Store
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/products?category=kids" className="hover:text-black hover:underline">
              Kids&apos; Store
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/products?category=footwear" className="hover:text-black hover:underline">
              Footwear Store
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
