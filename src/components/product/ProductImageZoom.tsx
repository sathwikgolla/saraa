"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn, discountPercent, handleImageError } from "@/lib/utils";

export function ProductImageZoom({
  images,
  price,
  mrp,
  alt,
}: {
  images: string[];
  price: number;
  mrp: number;
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const pct = discountPercent(mrp, price);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const next = () => setActive((a) => (a + 1) % images.length);
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div
          className="relative aspect-square w-full cursor-zoom-in overflow-hidden"
          onMouseMove={onMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setOrigin("50% 50%");
          }}
          onClick={() => setZoom(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={alt}
            decoding="async"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-200"
            style={{ transformOrigin: origin, transform: isHovered && !zoom ? "scale(1.6)" : "scale(1)" }}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
            <ZoomIn size={12} /> Click to zoom
          </span>
        </div>
        {pct > 0 && (
          <span className="absolute left-3 top-3 rounded bg-green-700 px-2 py-1 text-xs font-bold text-white">
            {pct}% OFF
          </span>
        )}

        {/* Prev/next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white",
                active === i ? "border-black ring-1 ring-black" : "border-neutral-200 hover:border-neutral-400"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen zoom modal */}
      {zoom && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={() => setZoom(false)}>
          <button
            onClick={() => setZoom(false)}
            aria-label="Close zoom"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={alt}
            decoding="async"
            onError={handleImageError}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
}