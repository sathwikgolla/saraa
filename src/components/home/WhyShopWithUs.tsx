import { CheckCircle2, Award, ShieldCheck, Truck, RefreshCw, HeadphonesIcon } from "lucide-react";

const REASONS = [
  {
    icon: Award,
    title: "100% Quality Guaranteed",
    description: "Every clothing garment and footwear pair undergoes strict fabric, stitching, and finishing checks before dispatch.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Encrypted Shopping",
    description: "Pay with complete confidence using verified UPI, credit/debit cards, net banking, or choose Cash on Delivery.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable Shipping",
    description: "Orders are dispatched within 24 hours with real-time SMS & WhatsApp tracking updates right to your doorstep.",
  },
  {
    icon: RefreshCw,
    title: "Hassle-Free 7-Day Returns",
    description: "Didn't fit quite right? Schedule an effortless doorstep exchange or full refund with zero cancellation penalties.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Single-Store Support",
    description: "Reach our in-house Miracle Collections customer support team directly for styling advice, order queries, or sizing help.",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
      <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:p-10 lg:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-800 shadow-xs">
            <CheckCircle2 size={13} className="text-black" />
            The Miracle Collections Commitment
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">
            Why Shop With Us
          </h2>
          <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
            We are dedicated to making contemporary fashion accessible, reliable, and delightful for every shopper
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.slice(0, 3).map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <r.icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-extrabold text-black">
                {r.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REASONS.slice(3).map((r) => (
            <div
              key={r.title}
              className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                <r.icon size={20} />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-black">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">
                  {r.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
