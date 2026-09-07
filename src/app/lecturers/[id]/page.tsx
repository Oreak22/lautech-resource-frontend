"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { useLecturerProfile } from "@/hooks/useLecturerProfile";
import { ReviewFeed } from "@/components/lecturers/ReviewFeed";
import {
  GraduationCap,
  Building2,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LecturerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Extract isError to detect 404s or failed API requests
  const { data: profile, isLoading, isError } = useLecturerProfile(id);
  const [activeTab, setActiveTab] = useState<"materials" | "reviews">(
    "reviews",
  );
  console.log(id, profile)

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-border" />
            <div className="h-4 w-48 bg-border rounded" />
            <div className="h-4 w-32 bg-border rounded" />
          </div>
        </div>
      </>
    );
  }

  // Graceful 404 / Error State
  if (isError || !profile) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
          <VerifiedCard className="p-8 max-w-md w-full text-center border-border shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Lecturer Not Found
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              The profile you are looking for doesn&apos;t exist or may have
              been removed from the directory.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Button>
          </VerifiedCard>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <VerifiedCard
            className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border-border"
            isVerified={profile.isVerified}
          >
            <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 relative overflow-hidden">
              <GraduationCap className="h-10 w-10 text-primary" />
              {profile.isVerified && (
                <div className="absolute bottom-0 w-full bg-primary py-0.5 flex justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-2 w-2" /> Verified
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.name}
                </h1>
                <span className="px-2 py-0.5 rounded-sm bg-secondary/10 text-secondary border border-secondary/20 text-xs font-mono">
                  {profile.title}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {profile.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {profile.faculty}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="px-3 py-1.5 rounded-md bg-background border border-border flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">
                    {profile.resources?.length || 0}{" "}
                    <span className="font-normal text-muted-foreground text-xs">
                      Linked Resources
                    </span>
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-background border border-border flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {profile.reviews?.length || 0}{" "}
                    <span className="font-normal text-muted-foreground text-xs">
                      Student Reviews
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </VerifiedCard>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "materials" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Course Materials ({profile.resources?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Student Reviews & Thoughts ({profile.reviews?.length || 0})
                </button>
              </div>

              <div className="pt-4">
                {activeTab === "materials" ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      Course materials grid will render here.
                    </p>
                  </div>
                ) : (
                  <ReviewFeed
                    lecturerId={profile._id}
                    reviews={profile.reviews || []}
                  />
                )}
              </div>
            </div>

            {/* Sidebar Tags & Guidelines */}
            <div className="space-y-6">
              <VerifiedCard className="p-5 border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Teaching Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.teachingTags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-background border border-border rounded-md text-xs font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {(!profile.teachingTags ||
                    profile.teachingTags.length === 0) && (
                    <span className="text-xs text-muted-foreground">
                      No tags available.
                    </span>
                  )}
                </div>
              </VerifiedCard>

              <VerifiedCard className="p-5 border-border bg-background/50">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Review
                  Guidelines
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                  <li>Keep it constructive and respectful.</li>
                  <li>Focus on teaching style, materials, and fairness.</li>
                  <li>
                    Personal attacks or inappropriate language will be
                    automatically flagged and removed.
                  </li>
                  <li>Anonymity is guaranteed by the LRB platform.</li>
                </ul>
              </VerifiedCard>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
