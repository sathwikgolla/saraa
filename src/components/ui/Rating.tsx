import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

/** Renders a star rating. Fractions >= 0.25 show a half star, >= 0.75 round up. */
export function Rating({ value, size = 14, showValue, className }: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const frac = clamped % 1;
  const full = Math.floor(clamped) + (frac >= 0.75 ? 1 : 0);
  const half = frac >= 0.25 && frac < 0.75;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) {
            return <Star key={i} size={size} className="fill-black text-black" />;
          }
          if (i === full && half) {
            return (
              <span key={i} className="relative inline-flex">
                <Star size={size} className="text-neutral-300" />
                <StarHalf
                  size={size}
                  className="absolute inset-0 fill-black text-black"
                />
              </span>
            );
          }
          return <Star key={i} size={size} className="text-neutral-300" />;
        })}
      </span>
      {showValue && (
        <span className="text-xs font-medium text-neutral-700">{clamped.toFixed(1)}</span>
      )}
    </span>
  );
}