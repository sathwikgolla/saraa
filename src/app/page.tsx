import Link from "next/link";
import { ArrowRight, ShieldCheck, Tag, TrendingUp, Sparkles } from "lucide-react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { CategoryCard } from "@/components/home/CategoryCard";
import { ProductCard } from "@/components/product/ProductCard";
import { FlashSale } from "@/components/home/FlashSale";
import { Offers } from "@/components/home/Offers";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { Recommended } from "@/components/home/Recommended";
import { cn, discountPercent } from "@/lib/utils";

function Section({
  icon: Icon,
  title,
  subtitle,
  viewAll,
  children,
  className,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  viewAll?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-7xl px-4 sm:px-6", className)}>
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100">
            <Icon size={18} className="text-black" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-black sm:text-xl">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-500 sm:text-sm">{subtitle}</p>}
          </div>
        </div>
        {viewAll && (
          <Link
            href={viewAll}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-black hover:underline"
          >
            View all <ArrowRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {children}
    </div>
  );
}

export default function Home() {
  const trending = products.filter((p) => p.badges.includes("Trending"));
  const bestSellers = products.filter((p) => p.badges.includes("Best Seller"));
  const newArrivals = products.filter((p) => p.badges.includes("New"));
  const flash = products
    .filter((p) => discountPercent(p.mrp, p.price) >= 50 && p.stock > 0)
    .slice(0, 6);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 grid overflow-hidden rounded-2xl bg-black text-white lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              <Tag size={13} /> Up to 70% off — Limited time sale
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Big Deals on Everything You Love
            </h1>
            <p className="mt-4 max-w-md text-sm text-neutral-300 sm:text-base">
              Fashion, electronics, home & more — quality products at prices that
              make you smile. Fresh drops every day.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-black transition-colors hover:bg-neutral-200"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/products?sort=price-low"
                className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Best Deals
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[320px] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
              alt="Shopping"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>
      </section>

      {/* Flash sale */}
      <div className="mt-8">
        <FlashSale products={flash} />
      </div>

      {/* Recently viewed + Recommended */}
      <div className="mt-12 space-y-12">
        <RecentlyViewed />
        <Recommended />
        <Offers />
      </div>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="my-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-neutral-500 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-black" /> Secure payments
          </span>
          <span className="flex items-center gap-1.5">
            <Tag size={15} className="text-black" /> COD available
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowRight size={15} className="rotate-180 text-black" /> Easy 7-day returns
          </span>
        </div>
      </section>

      {/* Categories */}
      <Section
        icon={Tag}
        title="Shop by Category"
        subtitle="Everything you need, all in one place"
        viewAll="/products"
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </Section>

      {/* Trending */}
      <Section
        icon={TrendingUp}
        title="Trending Now"
        subtitle="Most-loved products this week"
        viewAll="/products?sort=popular"
        className="mt-12"
      >
        <ScrollRow>
          {trending.map((p) => (
            <div key={p.id} className="w-48 shrink-0 sm:w-auto sm:shrink">
              <ProductCard product={p} />
            </div>
          ))}
        </ScrollRow>
      </Section>

      {/* Best sellers */}
      <Section
        icon={Sparkles}
        title="Best Sellers"
        subtitle="Customers can't stop buying these"
        viewAll="/products?sort=rating"
        className="mt-12"
      >
        <ScrollRow>
          {bestSellers.map((p) => (
            <div key={p.id} className="w-48 shrink-0 sm:w-auto sm:shrink">
              <ProductCard product={p} />
            </div>
          ))}
        </ScrollRow>
      </Section>

      {/* New arrivals */}
      <Section
        icon={Sparkles}
        title="New Arrivals"
        subtitle="Just dropped — check out the latest"
        viewAll="/products?sort=newest"
        className="mt-12"
      >
        <ScrollRow>
          {newArrivals.map((p) => (
            <div key={p.id} className="w-48 shrink-0 sm:w-auto sm:shrink">
              <ProductCard product={p} />
            </div>
          ))}
        </ScrollRow>
      </Section>

      {/* Promo banner */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-8 text-center sm:px-10 lg:flex-row lg:text-left">
          <div>
            <h3 className="text-xl font-extrabold text-black sm:text-2xl">
              Become a Saara insider
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Sign up for exclusive deals, early access and member-only offers.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-black px-6 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
          >
            Join for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* All products */}
      <Section
        icon={Tag}
        title="Explore All Products"
        subtitle={`${products.length} products across ${categories.length} categories`}
        viewAll="/products"
        className="mt-12"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>
    </main>
  );
}