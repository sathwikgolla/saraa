"use client";

import Link from "next/link";
import { GitCompareArrows, ShoppingCart, Trash2, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getProductById } from "@/data/products";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { StockBadge } from "@/components/product/StockBadge";
import { discountPercent, handleImageError } from "@/lib/utils";

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare, addToCart, toast, hydrated } = useStore();
  const products = compare.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (hydrated && products.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <EmptyState
          icon={GitCompareArrows}
          title="Nothing to compare yet"
          description="Tap the compare icon on any product to add it here. You can compare up to 4 products side by side."
          action={
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          }
        />
      </main>
    );
  }

  const fields: { label: string; render: (p: NonNullable<typeof products[number]>) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (p) => <PriceDisplay price={p.price} mrp={p.mrp} size="md" />,
    },
    { label: "Rating", render: (p) => <Rating value={p.rating} size={13} showValue /> },
    {
      label: "Discount",
      render: (p) => <span className="text-sm font-bold text-green-700">{discountPercent(p.mrp, p.price)}% off</span>,
    },
    { label: "Brand", render: (p) => <span className="text-sm text-neutral-700">{p.brand}</span> },
    {
      label: "Sizes",
      render: (p) => <span className="text-sm text-neutral-700">{p.sizes.length ? p.sizes.join(", ") : "—"}</span>,
    },
    {
      label: "Colors",
      render: (p) => <span className="text-sm text-neutral-700">{p.colors.length ? p.colors.join(", ") : "—"}</span>,
    },
    { label: "Availability", render: (p) => <StockBadge stock={p.stock} /> },
  ];

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-black sm:text-2xl">
          Compare <span className="text-base font-medium text-neutral-400">({products.length} products)</span>
        </h1>
        <Button variant="outline" size="sm" onClick={clearCompare}>
          <Trash2 size={14} /> Clear All
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="w-32 p-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400" />
              {products.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <div className="relative">
                    <Link href={`/products/${p.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt={p.name} onError={handleImageError} className="h-28 w-28 rounded-lg border border-neutral-100 object-cover" />
                    </Link>
                    <button
                      onClick={() => toggleCompare(p.id)}
                      aria-label="Remove from compare"
                      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <Link href={`/products/${p.slug}`} className="mt-2 block line-clamp-2 font-bold text-black hover:underline">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.label} className={i % 2 ? "bg-neutral-50" : ""}>
                <td className="p-3 font-semibold text-neutral-500">{f.label}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">{f.render(p)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-3 font-semibold text-neutral-500">Specifications</td>
              {products.map((p) => (
                <td key={p.id} className="p-3">
                  <ul className="space-y-1 text-xs text-neutral-600">
                    {p.specifications.slice(0, 4).map((s) => (
                      <li key={s.label}>
                        <span className="text-neutral-400">{s.label}:</span> {s.value}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3" />
              {products.map((p) => (
                <td key={p.id} className="p-3">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={p.stock === 0}
                    onClick={() => { addToCart(p.id); toast("Added to cart"); }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}