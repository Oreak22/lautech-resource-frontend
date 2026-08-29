"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Upload, Menu } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Resource Vault", href: "/" },
    { name: "Lecturer Directory", href: "/lecturers" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "Rules & Conduct", href: "/rules" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-foreground text-lg">
            lrb
            <span className="text-primary font-mono text-xs ml-1">vault</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Sign In / Upload */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-mono text-muted-foreground hover:text-foreground"
              >
                @{user.name.toLowerCase().replace(/\s+/g, "_")}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
          )}

          <Link href="/upload">
            <Button className="gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Upload className="h-4 w-4" />
              Upload Resource
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-primary py-2"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Upload Resource
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
