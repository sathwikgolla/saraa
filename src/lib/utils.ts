export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an amount in Indian Rupees, e.g. ₹1,299 */
export function formatPrice(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

/** Discount percentage between MRP and selling price */
export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0) return 0;
  return Math.max(0, Math.round(((mrp - price) / mrp) * 100));
}

export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Deterministic date label a few days from now, e.g. "Thursday, 10 Sep".
 * Built manually to avoid hydration mismatches between server/client Intl data.
 */
export function formatDeliveryDate(offsetDays = 4): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/**
 * Simple non-reversible hash for mock authentication (demo only — NOT real security).
 * Structurally mirrors how a real auth provider would store a password hash, so it can
 * be swapped for a genuine hashing/backend flow later without changing the call sites.
 */
export function mockHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return "h" + (h >>> 0).toString(36);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_RE = /^[6-9]\d{9}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  return MOBILE_RE.test(value.trim());
}

/** Accepts a valid email OR a 10-digit Indian mobile number. */
export function isValidIdentifier(value: string): boolean {
  const v = value.trim();
  return isValidEmail(v) || isValidMobile(v);
}

/** Password must be at least 8 chars with a letter and a number. */
export function passwordErrors(value: string): string[] {
  const errors: string[] = [];
  if (!value) {
    errors.push("Password is required");
  } else {
    if (value.length < 8) errors.push("Must be at least 8 characters");
    if (!/[A-Za-z]/.test(value)) errors.push("Must contain a letter");
    if (!/[0-9]/.test(value)) errors.push("Must contain a number");
  }
  return errors;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}