"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-md border bg-white px-4 py-3 text-sm font-medium text-black shadow-lg animate-slide-down",
            t.type === "success" && "border-green-200",
            t.type === "error" && "border-red-200",
            t.type === "info" && "border-neutral-200"
          )}
        >
          {t.type === "success" && <CheckCircle2 size={18} className="shrink-0 text-green-600" />}
          {t.type === "error" && <XCircle size={18} className="shrink-0 text-red-600" />}
          {t.type === "info" && <Info size={18} className="shrink-0 text-neutral-500" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}