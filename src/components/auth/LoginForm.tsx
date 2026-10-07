"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { isValidIdentifier } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { login, toast } = useStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = "Email or mobile number is required";
    else if (!isValidIdentifier(identifier)) e.identifier = "Enter a valid email or 10-digit mobile number";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (result.ok) {
      // Clear separation: Admins go to /admin; Customers stay in the storefront
      let destination: string;
      if (result.isAdmin) {
        destination = "/admin";
      } else {
        destination = next && !next.startsWith("/admin") && next !== "/login" ? next : "/";
      }
      toast("Logged in successfully");
      if (destination.startsWith("/admin")) {
        window.location.href = destination;
      } else {
        router.push(destination);
      }
    } else {
      setErrors({ form: result.error });
    }
  };

  const inputCls =
    "h-12 w-full rounded-md border border-neutral-300 bg-white px-3.5 text-sm text-black outline-none transition-colors focus:border-black";
  const labelCls = "mb-1.5 block text-sm font-medium text-black";

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-black">Welcome back</h1>
      <p className="mt-1 text-sm text-neutral-500">Login to your Miracle Collections account</p>

      {next.startsWith("/admin") && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">Admin Portal Demo Access</p>
          <p className="mt-0.5 text-amber-800">
            Email: <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-semibold">admin@miraclecollections.in</code> &bull; Password: <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-semibold">admin123</code>
          </p>
          <button
            type="button"
            onClick={() => {
              setIdentifier("admin@miraclecollections.in");
              setPassword("admin123");
            }}
            className="mt-2 inline-block rounded bg-amber-200/70 px-2 py-1 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200"
          >
            Auto-fill admin credentials
          </button>
        </div>
      )}

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {errors.form && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
            {errors.form}
          </div>
        )}

        <div>
          <label htmlFor="identifier" className={labelCls}>
            Email or Mobile number
          </label>
          <input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com or 9876543210"
            className={inputCls}
            autoComplete="username"
          />
          {errors.identifier && (
            <p className="mt-1.5 text-xs text-red-600">{errors.identifier}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className={labelCls}>
              Password
            </label>
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-600 hover:text-black"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={inputCls}
              autoComplete="current-password"
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded accent-black"
          />
          Remember me
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-bold text-black hover:underline"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}