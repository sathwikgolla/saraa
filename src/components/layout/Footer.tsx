"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Globe, Mail, MessageCircle, RotateCcw, Send, ShieldCheck, Truck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useStore } from "@/context/StoreContext";

export function Footer() {
  const pathname = usePathname();
  const { products } = useStore();
  
  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.map((p: any) => (p as any).categoryId))
  ).map((id, i) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    slug: id.toLowerCase(),
  }));
  
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 pb-20 lg:pb-0">
      {/* Trust bar */}
      <div className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: Truck,
              title: "Fast Delivery",
              text: "Ships within 24 hours · Cash on Delivery",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              text: "7-day no-questions-asked returns",
            },
            {
              icon: CreditCard,
              title: "Secure Payments",
              text: "UPI, cards, net banking & COD",
            },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                <b.icon size={20} className="text-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">{b.title}</p>
                <p className="text-xs text-neutral-500">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            Miracle Collections is your premier single-store fashion and footwear destination — quality styles at honest prices.
          </p>
          <div className="mt-4 flex gap-2">
            {[Send, MessageCircle, Globe].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-600 hover:border-black hover:text-black"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-black">Shop</h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.id}`} className="hover:text-black">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-black">My Account</h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li>
              <Link href="/profile" className="hover:text-black">
                My Profile
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-black">
                My Orders
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-black">
                My Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-black">
                My Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-black">Help</h4>
          <ul className="space-y-2 text-sm text-neutral-500">
            <li>
              <Link href="/orders" className="hover:text-black">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-black">
                Returns & Refunds
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-black">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-black">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-neutral-400 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Miracle Collections. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Mail size={12} /> Curated Fashion & Footwear
          </p>
        </div>
      </div>
    </footer>
  );
}