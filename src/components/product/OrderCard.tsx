"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, ChevronRight, PackageSearch, RotateCcw } from "lucide-react";
import type { Order } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TrackingTimeline } from "@/components/orders/TrackingTimeline";
import { cn, formatPrice, handleImageError } from "@/lib/utils";

const STATUS_STYLES: Record<Order["status"], string> = {
  Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-amber-50 text-amber-700 border-amber-200",
  "Out for Delivery": "bg-purple-50 text-purple-700 border-purple-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const RETURN_REASONS = [
  "Wrong product",
  "Damaged product",
  "Size issue",
  "Product not as expected",
  "Other",
];

export function OrderCard({ order }: { order: Order }) {
  const { cancelOrder, requestReturn, returns } = useStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [submitted, setSubmitted] = useState(false);

  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const cancellable = order.status !== "Cancelled" && order.status !== "Delivered";
  const returnable = order.status === "Delivered";
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const paymentStatus = order.paymentStatus ?? "Paid";
  const returnRec = returns[order.id];

  const submitReturn = () => {
    requestReturn(order.id, returnReason);
    setReturnOpen(false);
    setSubmitted(true);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-neutral-500">
          <span>
            Order <span className="font-semibold text-black">{order.id}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {placed}
          </span>
          <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-bold",
              STATUS_STYLES[order.status]
            )}
          >
            {order.status}
          </span>
          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            {paymentStatus}
          </span>
        </div>
      </div>

      {/* Tracking timeline */}
      {order.status !== "Cancelled" && (
        <div className="border-b border-neutral-100 px-4 py-4">
          <TrackingTimeline status={order.status} />
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-neutral-100">
        {order.items.map((item) => (
          <div key={item.productId + item.size + item.color} className="flex items-center gap-3 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} onError={handleImageError} className="h-16 w-16 rounded border border-neutral-100 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-black">{item.name}</p>
              <p className="text-xs text-neutral-500">
                {item.brand} · Qty {item.qty}
                {item.size ? ` · ${item.size}` : ""}
                {item.color ? ` · ${item.color}` : ""}
              </p>
              <p className="mt-0.5 text-sm font-bold text-black">{formatPrice(item.price * item.qty)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Return status banner */}
      {returnRec && (
        <div className="flex items-center gap-2 border-t border-green-200 bg-green-50 px-4 py-2.5 text-xs font-medium text-green-700">
          <RotateCcw size={14} />
          Return requested · {returnRec.status} · Reason: {returnRec.reason}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
        <p className="text-sm text-neutral-500">
          {order.status === "Cancelled" ? (
            "This order was cancelled"
          ) : (
            <>
              Estimated delivery: <span className="font-semibold text-black">{order.deliveryBy}</span>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {cancellable && (
            <Button variant="outline" size="sm" onClick={() => setConfirmCancel(true)}>
              Cancel Order
            </Button>
          )}
          {returnable && (
            <Button variant="outline" size="sm" onClick={() => setReturnOpen(true)}>
              <RotateCcw size={14} /> Return Product
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/orders/${order.id}`}>
              Track Order <ChevronRight size={14} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Cancel confirm modal */}
      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel order?">
        <p className="text-sm text-neutral-600">
          Are you sure you want to cancel order <span className="font-semibold text-black">{order.id}</span>?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setConfirmCancel(false)}>
            Keep Order
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              cancelOrder(order.id);
              setConfirmCancel(false);
            }}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal open={returnOpen} onClose={() => setReturnOpen(false)} title="Return Product">
        {!submitted ? (
          <>
            <p className="mb-3 text-sm text-neutral-600">Why are you returning this product?</p>
            <div className="space-y-2">
              {RETURN_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReturnReason(r)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm",
                    returnReason === r ? "border-black bg-neutral-50 font-semibold text-black" : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      returnReason === r ? "border-black" : "border-neutral-300"
                    )}
                  >
                    {returnReason === r && <span className="h-2 w-2 rounded-full bg-black" />}
                  </span>
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setReturnOpen(false)}>
                Back
              </Button>
              <Button fullWidth onClick={submitReturn}>
                Submit Return
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <PackageSearch size={36} className="text-black" />
            <h3 className="mt-3 text-base font-bold text-black">Return requested</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Your return for this order is now being processed. Our team will pick it up shortly.
            </p>
            <Button className="mt-5" onClick={() => setSubmitted(false)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}