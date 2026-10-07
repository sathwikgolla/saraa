import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/context/StoreContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Miracle Collections — Fashion, Clothing & Footwear",
    template: "%s | Miracle Collections",
  },
  description:
    "Miracle Collections is your premier single-store online destination for Women's, Men's, Kids' clothing and Footwear. Quality styles at honest prices.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-full flex-col bg-white pb-16 font-sans text-black lg:pb-0" suppressHydrationWarning>
        <StoreProvider>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <ToastContainer />
          {children}
          <Footer />
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}