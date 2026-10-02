import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2", className)}
      aria-label="Miracle Collections home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
        <ShoppingBag size={20} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-black">
          Miracle Collections
        </span>
      )}
    </Link>
  );
}