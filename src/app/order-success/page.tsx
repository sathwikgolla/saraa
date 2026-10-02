import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccessClient } from "@/components/orders/OrderSuccessClient";

export const metadata: Metadata = {
  title: "Order Placed",
  description: "Your order was placed successfully.",
};

export default function OrderSuccessPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Suspense fallback={<p className="py-10 text-center text-sm text-neutral-400">Loading...</p>}>
        <OrderSuccessClient />
      </Suspense>
    </main>
  );
}