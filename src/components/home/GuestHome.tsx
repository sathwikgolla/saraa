import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeHero } from "@/components/home/HomeHero";
import { CategorySection } from "@/components/home/CategorySection";
import { QuickBenefits } from "@/components/home/QuickBenefits";
import { DealsAndOffers } from "@/components/home/DealsAndOffers";
import { CompleteTheLook } from "@/components/home/CompleteTheLook";
import { ShopByOccasion } from "@/components/home/ShopByOccasion";
import { ShopByBudget } from "@/components/home/ShopByBudget";
import { PersonalizedDiscovery } from "@/components/home/PersonalizedDiscovery";
import { PromoBanner } from "@/components/home/PromoBanner";
import { WhyShopWithUs } from "@/components/home/WhyShopWithUs";
import { FinalCTA } from "@/components/home/FinalCTA";

export function HomeSectionHeader({
  icon: Icon,
  badge,
  title,
  subtitle,
  viewAll,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  title: string;
  subtitle?: string;
  viewAll?: string;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
            <Icon size={17} className="text-black" />
          </span>
          {badge && (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {badge}
            </span>
          )}
        </div>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {viewAll && (
        <Link
          href={viewAll}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-black transition-colors hover:underline"
        >
          View all <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function GuestHome() {
  // Real product collections from existing catalog
  const trendingProducts = products
    .filter((p) => p.badges.includes("Trending"))
    .slice(0, 8);

  const featuredProducts = products
    .filter((p) => p.badges.includes("Best Seller") || p.badges.includes("New"))
    .slice(0, 8);

  return (
    <main className="flex-1 pb-10">
      {/* 1. Hero Section */}
      <HomeHero />

      {/* 2. Shop By Category */}
      <CategorySection />

      {/* 3. Quick Benefits */}
      <QuickBenefits />

      {/* 4. Trending Now */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <HomeSectionHeader
          icon={TrendingUp}
          badge="Popular Demand"
          title="Trending Now"
          subtitle="Top customer favorites and most-coveted fashion pieces this week"
          viewAll="/products?sort=popular"
        />

        {/* Mobile horizontal scroll, Tablet/Desktop 4-col grid */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {trendingProducts.map((p) => (
            <div key={p.id} className="w-56 shrink-0 sm:w-auto sm:shrink">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Offers & Deals */}
      <DealsAndOffers />

      {/* 6. Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <HomeSectionHeader
          icon={Sparkles}
          badge="Handpicked For You"
          title="Featured Products"
          subtitle="Best-selling essentials and fresh new season arrivals"
          viewAll="/products?sort=rating"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 7. Complete The Look */}
      <CompleteTheLook />

      {/* 8. Shop By Occasion ("What Are You Shopping For?") */}
      <ShopByOccasion />

      {/* 9. Fashion Discovery & Personalized Section ("Picked For You" + Recently Viewed / Continue Shopping) */}
      <div className="pt-10">
        <PersonalizedDiscovery />
      </div>

      {/* 10. Shop By Budget */}
      <ShopByBudget />

      {/* 11. Promotional Banner */}
      <PromoBanner />

      {/* 12. Why Shop With Us */}
      <WhyShopWithUs />

      {/* 13. Final CTA */}
      <FinalCTA />
    </main>
  );
}
