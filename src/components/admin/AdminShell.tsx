"use client";

import { useState } from "react";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

function AdminToasts() {
  const { toasts } = useAdmin();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-lg px-4 py-3 text-xs font-semibold shadow-lg border animate-slide-up bg-white text-black border-neutral-200 ${
            t.type === "success"
              ? "border-emerald-200 bg-emerald-50/50"
              : t.type === "error"
              ? "border-rose-200 bg-rose-50/50"
              : "border-neutral-200 bg-white"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : t.type === "error" ? (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-neutral-600 shrink-0" />
          )}
          <span className="text-black">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-black flex flex-col lg:flex-row antialiased">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-neutral-50/60">
        <AdminTopbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AdminToasts />
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProvider>
  );
}
