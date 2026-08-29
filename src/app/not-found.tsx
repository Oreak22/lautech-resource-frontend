import Link from "next/link";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
        <VerifiedCard className="p-8 max-w-md w-full text-center border-border shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <FileQuestion className="h-8 w-8 text-secondary" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2 font-mono tracking-tight">
            404
          </h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Lost in the Vault?
          </h2>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The academic resource, lecturer profile, or page you are looking for
            doesn&apos;t exist, has been moved, or is currently restricted.
          </p>

          <Button asChild className="w-full gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
        </VerifiedCard>
      </main>
    </>
  );
}
