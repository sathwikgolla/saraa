import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "@/components/product/ShopClient";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = {
  title: "Shop Products",
  description: "Browse and shop products across fashion, electronics, home and more.",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6">
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <ShopClient />
      </Suspense>
    </main>
  );
}