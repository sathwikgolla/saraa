import { ShieldCheck, CreditCard, Truck, RefreshCw, Headphones } from "lucide-react";

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Quality",
    subtitle: "Direct-from-brand verified",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    subtitle: "UPI, Cards & Cash on Delivery",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "Free shipping over ₹499",
  },
  {
    icon: RefreshCw,
    title: "Easy 7-Day Returns",
    subtitle: "Instant doorstep pickups",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    subtitle: "Mon - Sat 9 AM to 8 PM",
  },
];

export function QuickBenefits() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:grid-cols-3 lg:grid-cols-5 lg:gap-4 lg:p-5">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-neutral-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-black">
              <b.icon size={19} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-black sm:text-sm">
                {b.title}
              </p>
              <p className="truncate text-[11px] text-neutral-500">
                {b.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
