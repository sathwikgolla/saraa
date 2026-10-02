"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, PenLine } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { formatCount } from "@/lib/utils";

export function ReviewsSection({ product }: { product: Product }) {
  const { userReviews, addReview, orders } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submitted = userReviews[product.id] ?? [];
  const all = [...submitted, ...product.reviewsList];
  const hasPurchased = orders.some((o) => o.items.some((i) => i.productId === product.id));

  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1];
    const total = Math.max(1, all.length);
    return buckets.map((star) => {
      const count = all.filter((r) => Math.round(r.rating) === star).length;
      return { star, count, pct: (count / total) * 100 };
    });
  }, [all]);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim() || !title.trim()) return;
    addReview(product.id, {
      author: name.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
      date: "Just now",
      verified: true,
    });
    setName("");
    setTitle("");
    setBody("");
    setFormOpen(false);
  };

  return (
    <div className="mt-6 rounded-lg border border-neutral-200">
      {/* Header + summary */}
      <div className="flex flex-wrap items-center gap-6 border-b border-neutral-200 px-5 py-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold text-black">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} size={12} className="mt-1" />
        </div>
        <div className="flex-1 text-sm text-neutral-500">
          <p className="font-semibold text-black">
            {formatCount(product.reviews)} ratings & {all.length} reviews
          </p>
          {/* Distribution */}
          <div className="mt-2 max-w-xs space-y-1">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="w-6 text-xs text-neutral-500">{d.star}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-black" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-neutral-400">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setFormOpen((o) => !o)} disabled={!hasPurchased}>
          <PenLine size={14} /> Write a Review
        </Button>
      </div>

      {!hasPurchased && (
        <p className="border-b border-neutral-100 bg-neutral-50 px-5 py-2 text-xs text-neutral-500">
          You can write a review for this product after purchasing it.
        </p>
      )}

      {formOpen && (
        <form onSubmit={submitReview} className="border-b border-neutral-100 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-black"
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="h-10 w-full cursor-pointer rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-black"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review headline"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-black sm:col-span-2"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black sm:col-span-2"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button type="submit" size="sm">Submit Review</Button>
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Review cards */}
      <div className="divide-y divide-neutral-100">
        {all.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">No reviews yet.</p>
        )}
        {all.map((r) => (
          <div key={r.id} className="px-5 py-4">
            <div className="flex items-center gap-2">
              <Rating value={r.rating} size={13} />
              <span className="text-sm font-bold text-black">{r.title}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{r.body}</p>
            <p className="mt-2 text-xs text-neutral-400">
              {r.author}
              {r.verified && (
                <span className="ml-2 inline-flex items-center gap-1 font-semibold text-green-700">
                  <BadgeCheck size={12} /> Verified Purchase
                </span>
              )}
              <span className="ml-2">· {r.date}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}