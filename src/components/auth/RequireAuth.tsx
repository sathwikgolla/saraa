"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LockKeyhole, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Skeleton } from "@/components/ui/LoadingSkeleton";

/** Centered "please login to continue" prompt that links back to the current page after login. */
export function LoginRequired({
  message = "Please login to continue",
}: {
  message?: string;
}) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <LockKeyhole size={28} className="text-neutral-500" />
      </div>
      <h1 className="mt-5 text-xl font-extrabold text-black">{message}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Login to your Saara account to continue. You&apos;ll be brought back here
        automatically.
      </p>
      <div className="mt-7 flex w-full flex-col gap-3">
        <Link
          href={`/login?next=${next}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-md bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800"
        >
          Login
        </Link>
        <Link
          href={`/register?next=${next}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-md border border-neutral-300 bg-white text-sm font-semibold text-black transition-colors hover:border-black"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

/** Wrap protected page content so logged-out users see a login prompt. */
export function RequireAuth({
  children,
  message,
}: {
  children: ReactNode;
  message?: string;
}) {
  const { user, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <LoginRequired message={message} />
      </main>
    );
  }

  return <>{children}</>;
}

export function EmptyCartNote() {
  const { cart } = useStore();
  if (cart.length === 0) {
    return (
      <p className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-500">
        <ShoppingBag size={15} /> Your cart is empty — add items before checking out.
      </p>
    );
  }
  return null;
}