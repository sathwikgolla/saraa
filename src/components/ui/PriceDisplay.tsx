import { cn, discountPercent, formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { price: "text-sm", mrp: "text-xs", pct: "text-xs" },
  md: { price: "text-lg", mrp: "text-sm", pct: "text-xs" },
  lg: { price: "text-2xl", mrp: "text-base", pct: "text-sm" },
};

export function PriceDisplay({ price, mrp, size = "md", className }: PriceDisplayProps) {
  const s = sizes[size];
  const pct = discountPercent(mrp, price);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-black", s.price)}>{formatPrice(price)}</span>
      {mrp > price && (
        <span className={cn("text-neutral-400 line-through", s.mrp)}>
          {formatPrice(mrp)}
        </span>
      )}
      {pct > 0 && (
        <span className={cn("font-semibold text-green-700", s.pct)}>{pct}% off</span>
      )}
    </div>
  );
}