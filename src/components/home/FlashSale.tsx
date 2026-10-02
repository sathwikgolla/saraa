"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { discountPercent } from "@/lib/utils";

function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      let diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      diff %= 3600;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTime({ h, m, s });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function FlashSale({ products }: { products: Product[] }) {
  const { h, m, s } = useCountdown();

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black">
              <Zap size={18} className="fill-white text-white" />
            </span>
            <h2 className="text-lg font-extrabold text-black sm:text-xl">Flash Sale</h2>
            <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
              Up to {Math.max(...products.map((p) => discountPercent(p.mrp, p.price)))}% off
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-sm">
            <span className="text-neutral-500">Ends in</span>
            <span className="flex items-center gap-1 font-mono font-bold text-black">
              <span className="rounded bg-black px-2 py-1 text-white">{pad(h)}</span>
              <span className="text-neutral-400">:</span>
              <span className="rounded bg-black px-2 py-1 text-white">{pad(m)}</span>
              <span className="text-neutral-400">:</span>
              <span className="rounded bg-black px-2 py-1 text-white">{pad(s)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}