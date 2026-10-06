"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  X,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import type { Address, PaymentStatus } from "@/lib/types";
import { cn, formatPrice, handleImageError } from "@/lib/utils";

const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_THRESHOLD = 499;

type PaymentMethod = "upi" | "card" | "netbanking" | "cod";
type Step = 0 | 1 | 2;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Banknote },
  { id: "cod", label: "Cash on Delivery", icon: ShieldCheck },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

interface Coupon {
  code: string;
  label: string;
  discount: (subtotal: number) => number;
}

const COUPONS: Coupon[] = [
  { code: "SAVE10", label: "10% off (up to ₹200)", discount: (s) => Math.min(200, Math.round(s * 0.1)) },
  { code: "WELCOME20", label: "Flat ₹20 off", discount: () => 20 },
  { code: "FLAT100", label: "Flat ₹100 off", discount: () => 100 },
];

const EMPTY_ADDRESS: Omit<Address, "id"> = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function CheckoutInner() {
  const router = useRouter();
  const { cart, hydrated, addresses, addAddress, placeOrder, toast, products } = useStore();
  const [step, setStep] = useState<Step>(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses[0]?.id ?? null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id">>(EMPTY_ADDRESS);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState(BANKS[0]);
  const [processing, setProcessing] = useState(false);

  const getProductById = (id: string) => products.find((p: any) => p.id === id);
  const items = cart
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((x) => x.product);

  const mrpTotal = items.reduce((s, { item, product }) => s + product!.mrp * item.qty, 0);
  const itemTotal = items.reduce((s, { item, product }) => s + product!.price * item.qty, 0);
  const discount = mrpTotal - itemTotal;
  const deliveryCharge = itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount(itemTotal) : 0;
  const total = Math.max(0, itemTotal + deliveryCharge - couponDiscount);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (hydrated && cart.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingBag size={28} className="text-neutral-400" />
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-black">Your cart is empty</h1>
        <p className="mt-1 text-sm text-neutral-500">Add some products before checking out.</p>
        <Button asChild className="mt-6">
          <a href="/products">Go Shopping</a>
        </Button>
      </div>
    );
  }

  const saveAddress = async () => {
    if (
      !addressForm.name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.line1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      toast("Please complete all required address fields", "error");
      return;
    }
    const saved = await addAddress(addressForm);
    if (saved) {
      setSelectedAddressId(saved.id);
      setShowAddressForm(false);
      setAddressForm(EMPTY_ADDRESS);
      toast("Address added");
    }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code);
    if (!found) {
      setCouponError("Invalid coupon code");
      return;
    }
    setAppliedCoupon(found);
    setCouponError("");
    toast(`Coupon ${found.code} applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const canPlace =
    step === 2 &&
    Boolean(selectedAddress) &&
    (payment === "cod" ||
      (payment === "upi" && upiId.trim()) ||
      (payment === "card" && card.number && card.holder && card.expiry && card.cvv) ||
      (payment === "netbanking" && bank));

  const placeOrderAction = async () => {
    if (!selectedAddress) {
      setStep(0);
      toast("Please select a delivery address", "error");
      return;
    }
    setProcessing(true);
    const paymentStatus: PaymentStatus = payment === "cod" ? "Pending" : "Paid";
    const order = await placeOrder({
      items: items.map(({ item, product }) => ({
        productId: product!.id,
        name: product!.name,
        brand: product!.brand,
        price: product!.price,
        qty: item.qty,
        image: product!.images[0],
        color: item.color,
        size: item.size,
      })),
      itemTotal,
      discount,
      deliveryCharge,
      coupon: appliedCoupon?.code ?? "",
      couponDiscount,
      total,
      status: "Confirmed",
      paymentStatus,
      deliveryBy: formatDelivery(5),
      address: formatAddress(selectedAddress),
      paymentMethod: PAYMENT_METHODS.find((p) => p.id === payment)!.label,
    }, selectedAddress);
    if (order) {
      setProcessing(false);
      router.replace(`/order-success?id=${order.id}`);
    } else {
      setProcessing(false);
      toast("Failed to place order", "error");
    }
  };

  const steps: { label: string }[] = [
    { label: "Address" },
    { label: "Order Summary" },
    { label: "Payment" },
  ];

  const input =
    "h-11 w-full rounded-md border border-neutral-300 px-3 text-sm text-black outline-none transition-colors focus:border-black";

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-xl font-extrabold text-black sm:text-2xl">Checkout</h1>

      {/* Steps indicator */}
      <div className="mb-6 flex items-center gap-2 sm:gap-3">
        {steps.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.label} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    done
                      ? "bg-black text-white"
                      : active
                        ? "border-2 border-black text-black"
                        : "border border-neutral-300 text-neutral-400"
                  )}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold sm:text-sm",
                    active ? "text-black" : "text-neutral-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="h-px w-6 bg-neutral-300 sm:w-12" />}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Step 0 — Address */}
          {step === 0 && (
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-black">
                <MapPin size={18} /> Delivery Address
              </h2>

              {addresses.length === 0 && !showAddressForm && (
                <p className="mb-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                  You have no saved addresses yet.
                </p>
              )}

              <div className="space-y-3">
                {addresses.map((a) => {
                  const active = selectedAddressId === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAddressId(a.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors",
                        active
                          ? "border-black bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          active ? "border-black" : "border-neutral-300"
                        )}
                      >
                        {active && <span className="h-2 w-2 rounded-full bg-black" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-bold text-black">{a.name}</span>
                          <span className="text-xs text-neutral-500">{a.phone}</span>
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-neutral-600">
                          {[a.line1, a.line2, a.landmark, a.city, `${a.state} - ${a.pincode}`]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {showAddressForm ? (
                <div className="mt-4 grid gap-3 rounded-md border border-neutral-200 p-4 sm:grid-cols-2">
                  <input placeholder="Full Name" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} className={input} />
                  <input placeholder="Mobile Number" inputMode="numeric" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={input} />
                  <input placeholder="House / Flat" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className={input} />
                  <input placeholder="Street" value={addressForm.line2 ?? ""} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} className={input} />
                  <input placeholder="Area / Landmark" value={addressForm.landmark ?? ""} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} className={input} />
                  <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className={input} />
                  <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className={input} />
                  <input placeholder="PIN Code" inputMode="numeric" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={input} />
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Button size="sm" onClick={saveAddress}>Save Address</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddressForm(true)}>
                  <Plus size={15} /> Add New Address
                </Button>
              )}

              <Button className="mt-5" onClick={() => setStep(1)} disabled={!selectedAddress}>
                Continue to Order Summary
              </Button>
            </section>
          )}

          {/* Step 1 — Order Summary */}
          {step === 1 && (
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-base font-bold text-black">Order Summary</h2>

              <div className="mb-4 rounded-md border border-neutral-200 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-black" />
                    <div>
                      <p className="text-sm font-bold text-black">{selectedAddress?.name}</p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        {selectedAddress ? formatAddress(selectedAddress) : "No address selected"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(0)}
                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-black hover:underline"
                  >
                    <Pencil size={13} /> Change
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {items.map(({ item, product }) => (
                  <div key={item.key} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product!.images[0]} alt={product!.name} onError={handleImageError} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-black">{product!.name}</p>
                      <p className="text-xs text-neutral-500">
                        Qty {item.qty}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                      <p className="text-xs text-neutral-400 line-through">{formatPrice(product!.mrp * item.qty)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black">{formatPrice(product!.price * item.qty)}</p>
                      <p className="text-xs font-semibold text-green-700">
                        {Math.round(((product!.mrp - product!.price) / product!.mrp) * 100)}% off
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-5" onClick={() => setStep(2)}>
                Continue to Payment
              </Button>
            </section>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-4 text-base font-bold text-black">Select Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors",
                      payment === m.id
                        ? "border-black bg-neutral-50 text-black"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                    )}
                  >
                    <m.icon size={18} className={payment === m.id ? "text-black" : "text-neutral-400"} />
                    {m.label}
                    <span
                      className={cn(
                        "ml-auto flex h-4 w-4 items-center justify-center rounded-full border",
                        payment === m.id ? "border-black" : "border-neutral-300"
                      )}
                    >
                      {payment === m.id && <span className="h-2 w-2 rounded-full bg-black" />}
                    </span>
                  </button>
                ))}
              </div>

              {payment === "upi" && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-black">UPI ID</label>
                  <div className="flex gap-2">
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="username@upi" className={input} />
                    <Button
                      variant="outline"
                      className="shrink-0"
                      onClick={() => (upiId.trim() ? toast("UPI verified") : toast("Enter a valid UPI ID", "error"))}
                    >
                      Verify UPI
                    </Button>
                  </div>
                </div>
              )}

              {payment === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-black">Card Number</label>
                    <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="1234 5678 9012 3456" inputMode="numeric" className={input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-black">Card Holder Name</label>
                    <input value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} placeholder="Name on card" className={input} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">Expiry Date</label>
                    <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className={input} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black">CVV</label>
                    <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="•••" type="password" className={input} />
                  </div>
                </div>
              )}

              {payment === "netbanking" && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-black">Select Bank</label>
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className={cn(input, "cursor-pointer")}>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              {payment === "cod" && (
                <p className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Pay when your order is delivered.
                </p>
              )}

              <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                <ShieldCheck size={14} className="text-black" /> Demo only — no real payment is processed and no card details are stored.
              </p>
            </section>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="h-fit rounded-lg border border-neutral-200 bg-white p-5 lg:sticky lg:top-40">
          <h2 className="text-base font-bold text-black">Price Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Price ({items.length} items)</span>
              <span className="font-medium text-black">{formatPrice(mrpTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Discount</span>
              <span className="font-medium text-green-700">− {formatPrice(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Delivery charge</span>
              <span className="font-medium text-black">{deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Coupon ({appliedCoupon?.code})</span>
                <span className="font-medium text-green-700">− {formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-neutral-300 pt-3 text-base font-bold text-black">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Coupon */}
          {appliedCoupon ? (
            <div className="mt-4 flex items-center justify-between rounded-md bg-green-50 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-green-700">
                <BadgeCheck size={15} /> {appliedCoupon.code}
                <span className="font-normal">· {appliedCoupon.label}</span>
              </span>
              <button onClick={removeCoupon} className="text-neutral-500 hover:text-black" aria-label="Remove coupon">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-black">Enter Coupon Code</label>
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className={cn(input, "uppercase")} />
                <Button variant="outline" className="shrink-0" onClick={applyCoupon}>Apply</Button>
              </div>
              {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
            </div>
          )}

          {/* Available coupons — shown regardless of applied state */}
          <p className="mb-2 mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-400">
            <Tag size={13} /> Available Coupons
          </p>
          <div className="space-y-2">
            {COUPONS.map((c) => {
              const active = appliedCoupon?.code === c.code;
              return (
                <div
                  key={c.code}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2",
                    active ? "border-green-500 bg-green-50" : "border-neutral-300"
                  )}
                >
                  <div>
                    <p className="text-sm font-extrabold text-black">{c.code}</p>
                    <p className="text-xs text-neutral-500">{c.label}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={active ? "ghost" : "outline"}
                    onClick={() => {
                      if (active) {
                        removeCoupon();
                      } else {
                        setCouponCode(c.code);
                        setAppliedCoupon(c);
                        setCouponError("");
                      }
                    }}
                  >
                    {active ? "Remove" : "Apply"}
                  </Button>
                </div>
              );
            })}
          </div>

          {step === 2 && (
            <Button size="lg" fullWidth className="mt-5" onClick={placeOrderAction} disabled={!canPlace || processing}>
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing payment...
                </>
              ) : (
                `Place Order · ${formatPrice(total)}`
              )}
            </Button>
          )}
          {step === 0 && (
            <Button size="lg" fullWidth className="mt-5" onClick={() => setStep(1)} disabled={!selectedAddress}>
              Continue
            </Button>
          )}
          {step === 1 && (
            <Button size="lg" fullWidth className="mt-5" onClick={() => setStep(2)}>
              Continue to Payment
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function formatAddress(a: Address): string {
  return [a.name, a.line1, a.line2, a.landmark, a.city, a.state + " - " + a.pincode]
    .filter(Boolean)
    .join(", ");
}

function formatDelivery(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutInner />
    </RequireAuth>
  );
}