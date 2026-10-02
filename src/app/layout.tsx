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
    default: "Saara — Online Shopping for Fashion, Electronics & More",
    template: "%s | Saara",
  },
  description:
    "Saara is an online marketplace for fashion, electronics, home essentials and more. Quality products at honest prices.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white pb-16 font-sans text-black lg:pb-0">
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