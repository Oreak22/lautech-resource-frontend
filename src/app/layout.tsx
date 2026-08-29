import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LAUTECH Resources",
  description:
    "Student study materials, past questions, and project repository.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          {/* Layout scaffolding like Navbar can go here later */}
          <main className="min-h-dvh bg-slate-50">{children}</main>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
