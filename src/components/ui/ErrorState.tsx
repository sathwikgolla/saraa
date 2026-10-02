"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <AlertTriangle size={28} className="text-neutral-400" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-black">{message}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        We couldn&apos;t load this content. Please try again.
      </p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}