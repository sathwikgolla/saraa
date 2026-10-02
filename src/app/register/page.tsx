import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Saara account.",
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

function safeNext(raw: string | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default async function RegisterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <RegisterForm next={next} />
    </main>
  );
}