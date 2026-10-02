import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Saara account.",
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

function safeNext(raw: string | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <LoginForm next={next} />
    </main>
  );
}