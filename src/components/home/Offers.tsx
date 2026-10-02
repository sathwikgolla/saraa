import Link from "next/link";
import { ArrowRight, BadgePercent, Truck, Tag, UserPlus, PartyPopper } from "lucide-react";

const OFFERS = [
  { icon: BadgePercent, title: "20% OFF", subtitle: "On your first 3 items", code: "SAVE10", href: "/products?sort=discount" },
  { icon: Tag, title: "₹100 OFF", subtitle: "On orders above ₹1,999", code: "FLAT100", href: "/products?sort=discount" },
  { icon: Truck, title: "Free Delivery", subtitle: "On orders over ₹499", href: "/products" },
  { icon: UserPlus, title: "New User Offer", subtitle: "Extra 10% off for new users", code: "WELCOME20", href: "/register" },
  { icon: PartyPopper, title: "Weekend Sale", subtitle: "Up to 70% off this weekend", href: "/products?sort=discount" },
];

export function Offers() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black sm:text-xl">Offers & Coupons</h2>
        <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-black hover:underline">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-5">
        {OFFERS.map((o) => (
          <Link
            key={o.title}
            href={o.href}
            className="flex w-52 shrink-0 items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md sm:w-auto"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black">
              <o.icon size={18} className="text-white" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-black">{o.title}</p>
              <p className="text-xs text-neutral-500">{o.subtitle}</p>
              {o.code && (
                <span className="mt-1.5 inline-block rounded border border-dashed border-neutral-400 px-1.5 py-0.5 text-[11px] font-bold text-neutral-600">
                  {o.code}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}