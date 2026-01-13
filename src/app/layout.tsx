import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Shield } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Parking Enforcement Companion",
  description: "Mobile-first app for parking enforcement officers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50/50`}
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="mx-auto flex h-14 max-w-md items-center px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-primary" />
              <span>Parking Companion</span>
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
