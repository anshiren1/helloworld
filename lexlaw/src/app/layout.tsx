import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LexLaw - Practice Management",
  description: "Manage clients, cases, time, and billing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b bg-gray-50">
          <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
            <Link className="font-semibold" href="/">LexLaw</Link>
            <Link className="text-sm hover:underline" href="/clients">Clients</Link>
            <Link className="text-sm hover:underline" href="/cases">Cases</Link>
            <Link className="text-sm hover:underline" href="/time">Time</Link>
            <Link className="text-sm hover:underline" href="/invoices">Invoices</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
