"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { OrderCard } from "@/components/product/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function OrdersPage() {
  const { orders, hydrated } = useStore();

  return (
    <RequireAuth>
      <main className="mx-auto max-w-4xl flex-1 px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-xl font-extrabold text-black sm:text-2xl">
          My Orders{" "}
          <span className="text-base font-medium text-neutral-400">({orders.length})</span>
        </h1>
        {hydrated && orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will show up here with live delivery status."
            action={
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </main>
    </RequireAuth>
  );
}