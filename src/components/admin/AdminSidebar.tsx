"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Layers,
  LayoutDashboard,
  Package,
  Palette,
  Percent,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeType?: "warning" | "danger" | "accent";
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { pendingPaymentCount, lowStockCount, settings } = useAdmin();

  const navGroups: NavGroup[] = [
    {
      label: "Main",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
          exact: true,
        },
        {
          href: "/admin/orders",
          label: "Orders",
          icon: ClipboardList,
          badge: null,
        },
        {
          href: "/admin/payments",
          label: "Payments / UTR",
          icon: CreditCard,
          badge: pendingPaymentCount > 0 ? `${pendingPaymentCount} pending` : null,
          badgeType: "warning" as const,
        },
        {
          href: "/admin/products",
          label: "Products",
          icon: Package,
          badge: null,
        },
        {
          href: "/admin/inventory",
          label: "Inventory & Stock",
          icon: Warehouse,
          badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
          badgeType: "danger" as const,
        },
        {
          href: "/admin/categories",
          label: "Categories & Filters",
          icon: Layers,
          badge: null,
        },
      ],
    },
    {
      label: "Store & Marketing",
      items: [
        {
          href: "/admin/customers",
          label: "Customers",
          icon: Users,
          badge: null,
        },
        {
          href: "/admin/coupons",
          label: "Coupons & Offers",
          icon: Percent,
          badge: null,
        },
        {
          href: "/admin/content",
          label: "Content & Theming",
          icon: Palette,
          badge: "Festive",
          badgeType: "accent" as const,
        },
      ],
    },
    {
      label: "Management & System",
      items: [
        {
          href: "/admin/reports",
          label: "Reports & Analytics",
          icon: BarChart3,
          badge: null,
        },
        {
          href: "/admin/staff",
          label: "Staff & Roles",
          icon: ShieldCheck,
          badge: null,
        },
        {
          href: "/admin/audit",
          label: "Audit Log",
          icon: FileText,
          badge: null,
        },
        {
          href: "/admin/settings",
          label: "Store Settings",
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs animate-fade-in lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-neutral-200 bg-white text-black transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header matching Ecommerce Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white shadow-sm">
              <ShoppingBag size={20} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-black leading-tight">
                {settings.storeName || "Miracle Collections"}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Admin Portal
                </span>
                <span className="rounded bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[9px] font-bold text-neutral-600">
                  v2.0
                </span>
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-150",
                      isActive
                        ? "bg-black text-white font-semibold shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-black font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-white" : "text-neutral-500 group-hover:text-black"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide border",
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : item.badgeType === "warning"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : item.badgeType === "danger"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-neutral-100 text-neutral-700 border-neutral-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Live Storefront Footer Link */}
        <div className="border-t border-neutral-200 p-3 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-100 hover:text-black"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Open Customer Store</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
          </Link>

          <div className="px-1 text-[11px] text-neutral-400 flex justify-between items-center">
            <span>Single Store</span>
            <span className="font-mono text-neutral-500">Merchant Hub</span>
          </div>
        </div>
      </aside>
    </>
  );
}
