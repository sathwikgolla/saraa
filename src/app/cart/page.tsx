"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CartItem } from "@/components/product/CartItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatPrice, getProductStock } from "@/lib/utils";

const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 499;

export default function CartPage() {
  const { cart, hydrated, products } = useStore();

  if (hydrated && cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our best deals and fill it up!"            action={
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            }
        />
      </main>
    );
  }

  const getProductById = (id: string) => products.find((p: any) => p.id === id);
  const items = cart
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((x) => x.product);

  const mrpTotal = items.reduce(
    (sum, { item, product }) => sum + (product!.mrp * item.qty),
    0
  );
  const itemTotal = items.reduce(
    (sum, { item, product }) => sum + (product!.price * item.qty),
    0
  );
  const discount = mrpTotal - itemTotal;
  const deliveryCharge = itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = itemTotal + deliveryCharge;

  const hasOutOfStockItems = items.some(({ item, product }) => {
    const stock = getProductStock(product!, item.color, item.size);
    return stock <= 0 || item.qty > stock;
  });

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-xl font-extrabold text-black sm:text-2xl">
        My Cart{" "}
        <span className="text-base font-medium text-neutral-400">
          ({cart.reduce((n, i) => n + i.qty, 0)} items)
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {items.map(({ item }, i) => (
            <div key={item.key} className={i > 0 ? "border-t border-neutral-100" : ""}>
              <CartItem item={item} />
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
            <span>
              {deliveryCharge === 0
                ? "🎉 You've unlocked FREE delivery"
                : `Add ${formatPrice(FREE_DELIVERY_THRESHOLD - itemTotal)} more for FREE delivery`}
            </span>
          </div>
        </div>

        {/* Price details */}
        <div className="h-fit rounded-lg border border-neutral-200 bg-white p-5 lg:sticky lg:top-40">
          <h2 className="text-base font-bold text-black">Price Details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Price ({items.length} items)</span>
              <span className="font-medium text-black">{formatPrice(mrpTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Discount</span>
              <span className="font-medium text-green-700">− {formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Delivery charge</span>
              <span className="font-medium text-black">
                {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed border-neutral-300 pt-3 text-base font-bold text-black">
              <span>Total Amount</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <Tag size={13} /> You will save {formatPrice(discount)} on this order
          </p>

          {hasOutOfStockItems ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span>Some items in your cart are out of stock or exceed available quantity. Please adjust or remove them before proceeding.</span>
              </div>
              <Button disabled fullWidth size="lg" className="opacity-60 cursor-not-allowed">
                Proceed to Checkout
              </Button>
            </div>
          ) : (
            <Button asChild fullWidth size="lg" className="mt-5">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
            </Button>
          )}

          <Link
            href="/products"
            className="mt-3 block text-center text-sm font-semibold text-neutral-600 hover:text-black"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}