"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption =
  | "popular"
  | "newest"
  | "price-low"
  | "price-high"
  | "rating"
  | "reviews"
  | "discount";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "reviews", label: "Customer Reviews" },
  { value: "discount", label: "Discount" },
];

export const VALID_SORTS: SortOption[] = SORT_OPTIONS.map((o) => o.value);

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
        Sort by
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort products"
        className="h-10 w-full cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white pl-[4.25rem] pr-9 text-sm font-medium text-black outline-none transition-colors hover:border-black focus:border-black sm:w-52"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
    </div>
  );
}