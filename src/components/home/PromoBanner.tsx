import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-12 text-white shadow-lg sm:px-12 lg:px-16 lg:py-14">
        {/* Subtle background overlay with high quality fashion atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-90" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-300 backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-400" />
              Limited-Time Capsule Collection
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Refresh Your Collection
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-300 sm:text-base">
              Discover new styles for every occasion. From breathable daily cottons
              to head-turning festive ethnic wear and handcrafted footwear, elevate your wardrobe today.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-400 lg:justify-start">
              <span>✓ 100% Genuine Apparel</span>
              <span>✓ Free Delivery Over ₹499</span>
              <span>✓ Doorstep Exchanges</span>
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
              View Special Offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
