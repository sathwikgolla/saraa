"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

export const PRICE_MAX = 50000;

export interface Filters {
  category: string; // "all" or category id
  minPrice: number;
  maxPrice: number;
  rating: number; // 0 = any
  stock: string; // "" | "in" | "out"
  discount: number; // minimum discount %
  sizes: string[];
  colors: string[];
  brands: string[];
}

export const DEFAULT_FILTERS: Filters = {
  category: "all",
  minPrice: 0,
  maxPrice: PRICE_MAX,
  rating: 0,
  stock: "",
  discount: 0,
  sizes: [],
  colors: [],
  brands: [],
};

export const PRICE_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "0-499", label: "Under ₹500", min: 0, max: 499 },
  { key: "500-999", label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { key: "1000-1999", label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { key: "2000-4999", label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { key: "5000-max", label: "Above ₹5,000", min: 5001, max: PRICE_MAX },
];

export const RATING_OPTIONS = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

export const DISCOUNT_OPTIONS = [
  { value: 10, label: "10% or more" },
  { value: 20, label: "20% or more" },
  { value: 30, label: "30% or more" },
  { value: 50, label: "50% or more" },
];

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

const T = { MIN: "min", MAX: "max" } as const;

interface FilterSidebarProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  availableBrands: string[];
  availableSizes: string[];
  availableColors: string[];
  productCount: number;
}

export function FilterSidebar({
  filters,
  onChange,
  availableBrands,
  availableSizes,
  availableColors,
  productCount,
}: FilterSidebarProps) {
  const set = (patch: Partial<Filters>) => onChange(patch);

  const isDirty =
    filters.category !== "all" ||
    filters.minPrice > 0 ||
    filters.maxPrice < PRICE_MAX ||
    filters.rating !== 0 ||
    filters.stock !== "" ||
    filters.discount !== 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.brands.length > 0;

  const radio = (checked: boolean) => (
    <span
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full border",
        checked ? "border-black" : "border-neutral-300"
      )}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-black" />}
    </span>
  );

  const toggleArray = (key: "sizes" | "colors" | "brands", value: string) => {
    const list = filters[key];
    set({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-black">
          <SlidersHorizontal size={16} />
          Filters
        </h2>
        {isDirty && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black"
          >
            <RotateCcw size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-black">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => set({ category: "all" })}
            className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
          >
            {radio(filters.category === "all")}
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ category: c.id })}
              className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
            >
              {radio(filters.category === c.id)}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-black">Price</h3>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_RANGES.map((r) => {
            const active =
              filters.minPrice === r.min && filters.maxPrice === r.max;
            return (
              <button
                key={r.key}
                onClick={() => set({ minPrice: r.min, maxPrice: r.max })}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-black"
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Custom range */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Min ₹{filters.minPrice.toLocaleString("en-IN")}</span>
            <span>Max ₹{filters.maxPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-neutral-200">
            <div
              className="absolute h-1.5 rounded-full bg-black"
              style={{
                left: `${(filters.minPrice / PRICE_MAX) * 100}%`,
                right: `${100 - (filters.maxPrice / PRICE_MAX) * 100}%`,
              }}
            />
          </div>
          <div className="relative mt-[-0.375rem] h-5">
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={100}
              value={filters.minPrice}
              onChange={(e) =>
                set({ minPrice: Math.min(Number(e.target.value), filters.maxPrice - 100) })
              }
              aria-label="Minimum price"
              className="pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow"
            />
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={100}
              value={filters.maxPrice}
              onChange={(e) =>
                set({ maxPrice: Math.max(Number(e.target.value), filters.minPrice + 100) })
              }
              aria-label="Maximum price"
              className="pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:shadow"
            />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.minPrice}
              onChange={(e) =>
                set({ minPrice: Math.max(0, Number(e.target.value)) })
              }
              aria-label="Minimum price amount"
              className="h-9 w-full rounded-md border border-neutral-300 px-2 text-sm outline-none focus:border-black"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              min={0}
              max={PRICE_MAX}
              value={filters.maxPrice}
              onChange={(e) =>
                set({ maxPrice: Math.min(PRICE_MAX, Number(e.target.value)) })
              }
              aria-label="Maximum price amount"
              className="h-9 w-full rounded-md border border-neutral-300 px-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-black">Rating</h3>
        <div className="space-y-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => set({ rating: filters.rating === r.value ? 0 : r.value })}
              className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
            >
              {radio(filters.rating === r.value)}
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-black">Availability</h3>
        <div className="space-y-2">
          {[
            { value: "", label: "All" },
            { value: "in", label: "In Stock" },
            { value: "out", label: "Out of Stock" },
          ].map((o) => (
            <button
              key={o.value}
              onClick={() => set({ stock: o.value })}
              className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
            >
              {radio(filters.stock === o.value)}
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Discount */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-black">Discount</h3>
        <div className="space-y-2">
          <button
            onClick={() => set({ discount: 0 })}
            className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
          >
            {radio(filters.discount === 0)}
            Any discount
          </button>
          {DISCOUNT_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => set({ discount: filters.discount === d.value ? 0 : d.value })}
              className="flex w-full items-center gap-2.5 text-left text-sm text-neutral-700 hover:text-black"
            >
              {radio(filters.discount === d.value)}
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      {availableSizes.length > 0 && (
        <>
          <hr className="border-neutral-200" />
          <div>
            <h3 className="mb-3 text-sm font-bold text-black">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.filter((s) => availableSizes.includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleArray("sizes", s)}
                  className={cn(
                    "min-w-11 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors",
                    filters.sizes.includes(s)
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-black"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <>
          <hr className="border-neutral-200" />
          <div>
            <h3 className="mb-3 text-sm font-bold text-black">Color</h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleArray("colors", c)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    filters.colors.includes(c)
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-black"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Brand */}
      {availableBrands.length > 0 && (
        <>
          <hr className="border-neutral-200" />
          <div>
            <h3 className="mb-3 text-sm font-bold text-black">Brand</h3>
            <div className="space-y-2">
              {availableBrands.map((b) => (
                <label
                  key={b}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(b)}
                    onChange={() => toggleArray("brands", b)}
                    className="h-4 w-4 rounded accent-black"
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="rounded-md bg-neutral-100 px-4 py-3 text-xs text-neutral-500">
        Showing <span className="font-semibold text-black">{productCount}</span>{" "}
        product{productCount === 1 ? "" : "s"}
      </div>
    </div>
  );
}