"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const { cart, wishlist, user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cart.reduce((n, i) => n + i.qty, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Categories", icon: LayoutGrid },
    { href: "/wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-neutral-500 transition-colors",
                active && "text-black"
              )}
            >
              <span className="relative">
                <item.icon size={22} strokeWidth={active ? 2.4 : 2} />
                {item.badge ? (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className={cn("text-[10px] font-medium", active && "font-bold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}