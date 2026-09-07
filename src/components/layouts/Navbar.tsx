"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Upload, Menu, X, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Resource Vault", href: "/resources" },
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

        {/* Desktop / Large Tablet Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
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

        {/* Actions: Sign In / Upload (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                @{user.name.toLowerCase().replace(/\s+/g, "_")}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
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

        {/* Mobile / Tablet Menu Toggle & Theme */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-foreground p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full border-b border-border bg-background p-4 space-y-4 shadow-xl">
          
          {/* Auth State in Mobile */}
          {user ? (
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 overflow-hidden">
                <User className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-mono truncate">
                  @{user.name.toLowerCase().replace(/\s+/g, "_")}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Upload Button */}
          <div className="pt-2 border-t border-border">
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