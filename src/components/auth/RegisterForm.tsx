"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { isValidEmail, isValidMobile, passwordErrors } from "@/lib/utils";

interface Errors {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string[];
  confirm?: string;
  terms?: string;
  form?: string;
}

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const { register, toast } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address";
    if (!mobile.trim()) e.mobile = "Mobile number is required";
    else if (!isValidMobile(mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    const pw = passwordErrors(password);
    if (pw.length) e.password = pw;
    if (!confirm) e.confirm = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    if (!terms) e.terms = "You must accept the Terms & Conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    window.setTimeout(() => {
      const result = register({ name, email, mobile, password });
      setLoading(false);
      if (result.ok) {
        toast("Account created successfully");
        router.push(next);
      } else {
        setErrors({ form: result.error });
      }
    }, 700);
  };

  const inputCls =
    "h-12 w-full rounded-md border border-neutral-300 bg-white px-3.5 text-sm text-black outline-none transition-colors focus:border-black";
  const labelCls = "mb-1.5 block text-sm font-medium text-black";
  const errCls = "mt-1.5 text-xs text-red-600";

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-black">Create Account</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Join Saara in less than a minute
      </p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {errors.form && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            {errors.form}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelCls}>
            Full Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className={inputCls}
            autoComplete="name"
          />
          {errors.name && <p className={errCls}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
            autoComplete="email"
          />
          {errors.email && <p className={errCls}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="mobile" className={labelCls}>
            Mobile Number
          </label>
          <input
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            className={inputCls}
            autoComplete="tel"
          />
          {errors.mobile && <p className={errCls}>{errors.mobile}</p>}
        </div>

        <div>
          <label htmlFor="reg-password" className={labelCls}>
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className={inputCls}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password?.map((e) => (
            <p key={e} className={errCls}>
              • {e}
            </p>
          ))}
        </div>

        <div>
          <label htmlFor="confirm" className={labelCls}>
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            className={inputCls}
            autoComplete="new-password"
          />
          {errors.confirm && <p className={errCls}>{errors.confirm}</p>}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-black"
            />
            <span>
              I agree to the <span className="font-semibold text-black">Terms & Conditions</span>{" "}
              and <span className="font-semibold text-black">Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <p className={errCls}>{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-bold text-black hover:underline"
        >
          Login
        </Link>
      </p>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <CheckCircle2 size={13} /> Demo only — no real password is stored.
      </p>
    </div>
  );
}