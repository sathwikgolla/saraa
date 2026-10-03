"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getCategory } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  DEFAULT_FILTERS,
  FilterSidebar,
  PRICE_MAX,
  type Filters,
} from "@/components/product/FilterSidebar";
import { SortDropdown, VALID_SORTS, type SortOption } from "@/components/product/SortDropdown";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { discountPercent } from "@/lib/utils";

type ParamValue = string | number | string[] | undefined;

function buildQuery(params: Record<string, ParamValue>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (Array.isArray(v)) {
      for (const x of v) if (x) sp.append(k, x);
    } else {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}

function toParams(filters: Filters, sort: SortOption, query: string): Record<string, ParamValue> {
  return {
    q: query || undefined,
    category: filters.category === "all" ? undefined : filters.category,
    minPrice: filters.minPrice > 0 ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice < PRICE_MAX ? String(filters.maxPrice) : undefined,
    rating: filters.rating > 0 ? String(filters.rating) : undefined,
    stock: filters.stock || undefined,
    discount: filters.discount > 0 ? String(filters.discount) : undefined,
    size: filters.sizes,
    color: filters.colors,
    brand: filters.brands,
    sort: sort === "popular" ? undefined : sort,
  };
}

export function ShopClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { products } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(12);

  const query = sp.get("q") ?? "";

  // Only display live products to customers
  const liveProducts = useMemo(() => {
    return products.filter((p) => p.status !== "draft");
  }, [products]);

  const filters: Filters = {
    category: sp.get("category") ?? "all",
    minPrice: clampPrice(Number(sp.get("minPrice") || 0)),
    maxPrice: clampPrice(Number(sp.get("maxPrice") || PRICE_MAX)),
    rating: Number(sp.get("rating") || 0),
    stock: sp.get("stock") ?? "",
    discount: Number(sp.get("discount") || 0),
    sizes: sp.getAll("size"),
    colors: sp.getAll("color"),
    brands: sp.getAll("brand"),
  };

  const sort: SortOption = VALID_SORTS.includes(sp.get("sort") as SortOption)
    ? (sp.get("sort") as SortOption)
    : "popular";

  useEffect(() => {
    setVisible(12);
  }, [filters, sort, query]);

  const push = (f: Filters, s: SortOption, q: string) => {
    const qs = buildQuery(toParams(f, s, q));
    router.push(qs ? `/products?${qs}` : "/products", { scroll: false });
  };

  const updateFilters = (patch: Partial<Filters>) => {
    push({ ...filters, ...patch }, sort, query);
  };

  const setSort = (s: SortOption) => push(filters, s, query);

  const removeOne = (key: "sizes" | "colors" | "brands", value: string) => {
    updateFilters({ [key]: filters[key].filter((v) => v !== value) });
  };

  const clearAll = () => push(DEFAULT_FILTERS, sort, "");

  // Products matching category + search only (pool for dynamic brand/size/color lists).
  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveProducts.filter((p) => {
      if (filters.category !== "all" && p.categoryId !== filters.category) return false;
      if (!q) return true;
      const catName = getCategory(p.categoryId)?.name.toLowerCase() ?? "";
      const hay = `${p.name} ${p.brand} ${p.description} ${catName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [liveProducts, filters.category, query]);

  const availableBrands = useMemo(
    () => [...new Set(pool.map((p) => p.brand))].sort((a, b) => a.localeCompare(b)),
    [pool]
  );
  const availableSizes = useMemo(
    () => [...new Set(pool.flatMap((p) => p.sizes))],
    [pool]
  );
  const availableColors = useMemo(
    () => [...new Set(pool.flatMap((p) => p.colors))],
    [pool]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = liveProducts.filter((p) => {
      if (filters.category !== "all" && p.categoryId !== filters.category) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (p.rating < filters.rating) return false;
      if (filters.stock === "in" && p.stock === 0) return false;
      if (filters.stock === "out" && p.stock > 0) return false;
      const pct = discountPercent(p.mrp, p.price);
      if (filters.discount > 0 && pct < filters.discount) return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s)))
        return false;
      if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c)))
        return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (q) {
        const catName = getCategory(p.categoryId)?.name.toLowerCase() ?? "";
        const hay = `${p.name} ${p.brand} ${p.description} ${catName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "reviews":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case "discount":
        sorted.sort(
          (a, b) =>
            discountPercent(b.mrp, b.price) - discountPercent(a.mrp, a.price) ||
            b.reviews - a.reviews
        );
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            Number(b.badges.includes("New")) - Number(a.badges.includes("New"))
        );
        break;
      default:
        sorted.sort((a, b) => b.reviews - a.reviews);
    }
    return sorted;
  }, [liveProducts, filters, sort, query]);

  const activeCategory = filters.category === "all" ? undefined : getCategory(filters.category);
  const title = query ? `Results for "${query}"` : activeCategory?.name ?? "All Products";

  // Build active filter chips
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query) {
    chips.push({ key: "q", label: `"${query}"`, remove: () => push(filters, sort, "") });
  }
  if (activeCategory) {
    chips.push({
      key: "category",
      label: activeCategory.name,
      remove: () => updateFilters({ category: "all" }),
    });
  }
  if (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) {
    chips.push({
      key: "price",
      label: `₹${filters.minPrice.toLocaleString("en-IN")} – ₹${filters.maxPrice.toLocaleString("en-IN")}`,
      remove: () => updateFilters({ minPrice: 0, maxPrice: PRICE_MAX }),
    });
  }
  if (filters.rating > 0) {
    chips.push({
      key: "rating",
      label: `${filters.rating}★ & above`,
      remove: () => updateFilters({ rating: 0 }),
    });
  }
  if (filters.stock === "in") {
    chips.push({ key: "stock", label: "In Stock", remove: () => updateFilters({ stock: "" }) });
  } else if (filters.stock === "out") {
    chips.push({
      key: "stock",
      label: "Out of Stock",
      remove: () => updateFilters({ stock: "" }),
    });
  }
  if (filters.discount > 0) {
    chips.push({
      key: "discount",
      label: `${filters.discount}%+ off`,
      remove: () => updateFilters({ discount: 0 }),
    });
  }
  filters.sizes.forEach((s) =>
    chips.push({ key: `size-${s}`, label: `Size ${s}`, remove: () => removeOne("sizes", s) })
  );
  filters.colors.forEach((c) =>
    chips.push({ key: `color-${c}`, label: c, remove: () => removeOne("colors", c) })
  );
  filters.brands.forEach((b) =>
    chips.push({ key: `brand-${b}`, label: b, remove: () => removeOne("brands", b) })
  );

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-5">
          <FilterSidebar
            filters={filters}
            onChange={updateFilters}
            availableBrands={availableBrands}
            availableSizes={availableSizes}
            availableColors={availableColors}
            productCount={filtered.length}
          />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-black sm:text-2xl">{title}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {filtered.length} product{filtered.length === 1 ? "" : "s"} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={15} /> Filters
            </Button>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.remove}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white py-1 pl-3 pr-2 text-xs font-medium text-neutral-700 transition-colors hover:border-black hover:text-black"
              >
                {chip.label}
                <X size={13} className="text-neutral-400" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-semibold text-black underline decoration-neutral-300 underline-offset-2 hover:decoration-black"
            >
              <RotateCcw size={13} /> Clear All
            </button>
          </div>
        )}

        <ProductGrid products={filtered.slice(0, visible)} />

        {visible < filtered.length && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + 12)}>
              Load More ({Math.min(12, filtered.length - visible)} more)
            </Button>
          </div>
        )}
      </div>

      {/* Mobile filter bottom sheet */}
      <MobileFilters
        filters={filters}
        onChange={updateFilters}
        availableBrands={availableBrands}
        availableSizes={availableSizes}
        availableColors={availableColors}
        productCount={filtered.length}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />
    </div>
  );
}

function clampPrice(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(PRICE_MAX, Math.round(v)));
}

interface MobileFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  availableBrands: string[];
  availableSizes: string[];
  availableColors: string[];
  productCount: number;
  isOpen: boolean;
  onClose: () => void;
}

function MobileFilters({
  filters,
  onChange,
  availableBrands,
  availableSizes,
  availableColors,
  productCount,
  isOpen,
  onClose,
}: MobileFiltersProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Filters" className="max-h-[82vh] overflow-y-auto">
      <FilterSidebar
        filters={filters}
        onChange={onChange}
        availableBrands={availableBrands}
        availableSizes={availableSizes}
        availableColors={availableColors}
        productCount={productCount}
      />
      <Button fullWidth size="lg" className="mt-6" onClick={onClose}>
        Show {productCount} product{productCount === 1 ? "" : "s"}
      </Button>
    </Modal>
  );
}