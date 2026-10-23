"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/store/useAuthStore";

const navLinks = [
  { name: "Resources", href: "/resources" },
  { name: "Lecturers", href: "/lecturers" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Rules & Conduct", href: "/rules" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const username = user?.name.toLowerCase().trim().replace(/\s+/g, "_");
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="LAUTECH Resource Bank home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            lrb<span className="ml-1 font-mono text-xs font-medium text-primary">vault</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <ThemeToggle />
          <span className="h-7 w-px bg-border" aria-hidden="true" />

          {user ? (
            <>
              <Link
                href="/dashboard"
                aria-current={isActive("/dashboard") ? "page" : undefined}
                className={`inline-flex max-w-40 items-center gap-2 truncate rounded-lg px-2 py-2 text-sm font-medium transition-colors ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title={`Dashboard for @${username}`}
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">@{username}</span>
              </Link>
              <Link
                href="/profile"
                aria-current={isActive("/profile") ? "page" : undefined}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                My Profile
              </Link>
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>Sign Out</Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}

          <Button asChild className="gap-2">
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Upload Resource
            </Link>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background p-4 shadow-xl xl:hidden">
          {user && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{username}</p>
              </div>
            </div>
          )}

          <nav aria-label="Mobile navigation" className="space-y-1">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive("/dashboard") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                >
                  My Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive("/profile") ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                >
                  My Profile
                </Link>
                <div className="my-2 border-t border-border" />
              </>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            <Button asChild className="w-full gap-2">
              <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                <Upload className="h-4 w-4" />
                Upload Resource
              </Link>
            </Button>
            {user ? (
              <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>Sign Out</Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
