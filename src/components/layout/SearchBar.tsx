"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock, Search, TrendingUp } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

const POPULAR = [
  "shirt",
  "shirt for men",
  "black shirt",
  "kurta",
  "anarkali kurta",
  "formal shoes",
  "running shoes",
  "sneakers",
  "loafers",
  "trousers",
  "cotton t-shirt",
  "wedding sherwani",
];

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches, products } = useStore();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setValue(q);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const term = value.trim().toLowerCase();
  const suggestions = useMemoSuggestions(term, products);

  const go = (q: string) => {
    const t = q.trim();
    addRecentSearch(t);
    setOpen(false);
    router.push(t ? `/products?q=${encodeURIComponent(t)}` : "/products");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (open && highlight >= 0 && suggestions[highlight]) {
      go(suggestions[highlight]);
      return;
    }
    go(value);
  };

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search" className="relative flex w-full items-center">
        <Search size={18} className="pointer-events-none absolute left-3.5 text-neutral-400" />
        <input
          suppressHydrationWarning
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(suggestions.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            }
          }}
          placeholder="Search for products, brands and more"
          autoFocus={autoFocus}
          className="h-11 w-full rounded-md border border-neutral-300 bg-neutral-50 pl-10 pr-16 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:bg-white"
        />
        <button
          suppressHydrationWarning
          type="submit"
          className="absolute right-1 top-1 h-9 rounded px-3 text-sm font-semibold text-neutral-500 hover:bg-neutral-200/60 hover:text-black"
        >
          Search
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg animate-fade-in">
          {term.length === 0 ? (
            <>
              {recentSearches.length > 0 && (
                <div className="pb-1">
                  <div className="flex items-center justify-between px-4 py-1.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">
                      <Clock size={13} /> Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs font-semibold text-neutral-500 hover:text-black"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => go(s)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Clock size={14} className="text-neutral-300" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <p className="flex items-center gap-1.5 px-4 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
                <TrendingUp size={13} /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {POPULAR.map((s) => (
                  <button
                    key={s}
                    onClick={() => go(s)}
                    className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-black hover:text-black"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => go(s)}
                    onMouseEnter={() => setHighlight(i)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700",
                      highlight === i ? "bg-neutral-50" : "hover:bg-neutral-50"
                    )}
                  >
                    <Search size={14} className="text-neutral-300" />
                    {s}
                  </button>
                ))
              ) : (
                <p className="px-4 py-4 text-center text-sm text-neutral-400">
                  No suggestions. Press Enter to search &quot;{value}&quot;.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function useMemoSuggestions(term: string, productList: { name: string; brand: string }[] = []): string[] {
  if (!term) return [];
  const fromPopular = POPULAR.filter((s) => s.toLowerCase().includes(term));
  const fromProducts = productList
    .map((p) => p.name.toLowerCase())
    .filter((n) => n.includes(term))
    .slice(0, 5);
  const fromBrands = productList
    .map((p) => p.brand)
    .filter((b, i, arr) => arr.indexOf(b) === i && b.toLowerCase().includes(term));
  return Array.from(new Set([...fromPopular, ...fromBrands, ...fromProducts])).slice(0, 8);
}