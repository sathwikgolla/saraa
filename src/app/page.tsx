"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { GuestHome } from "@/components/home/GuestHome";
import { AuthenticatedHome } from "@/components/home/AuthenticatedHome";

export default function Home() {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && user) {
    return <AuthenticatedHome user={user} />;
  }

  return <GuestHome />;
}