import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function stockLabel(stock: number): { text: string; tone: "in" | "low" | "out" } {
  const n = Number(stock);
  if (!Number.isFinite(n) || n <= 0) return { text: "Out of Stock", tone: "out" };
  if (n <= 2) return { text: `Only ${n} left`, tone: "low" };
  if (n <= 5) return { text: `Only ${n} left`, tone: "low" };
  if (n <= 20) return { text: `Hurry, only ${n} left`, tone: "low" };
  return { text: "In Stock", tone: "in" };
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const { text, tone } = stockLabel(stock);
  const Icon = tone === "out" ? XCircle : tone === "low" ? AlertTriangle : CheckCircle2;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        tone === "out" && "text-red-600",
        tone === "low" && "text-amber-600",
        tone === "in" && "text-green-700",
        className
      )}
    >
      <Icon size={13} />
      {text}
    </span>
  );
}