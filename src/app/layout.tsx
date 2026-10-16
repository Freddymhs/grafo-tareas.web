import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + TanStack Template",
  description: "Next.js 16 with TanStack Query and TanStack Table",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <nav className="border-b border-gray-200 px-6 py-3 flex items-center gap-6 text-sm">
            <Link href="/" className="font-semibold text-gray-900">
              TanStack Template
            </Link>
            <Link href="/posts" className="text-gray-500 hover:text-gray-900">
              Posts
            </Link>
            <Link href="/table" className="text-gray-500 hover:text-gray-900">
              Table
            </Link>
          </nav>
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
