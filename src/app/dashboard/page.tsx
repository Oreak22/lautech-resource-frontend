"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";
import {
  MyDashboardReview,
  useDeleteMyResource,
  useDeleteMyReview,
  useMyDashboard,
  useUpdateMyReview,
} from "@/hooks/useMyDashboard";
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Flag,
  GraduationCap,
  IdCard,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import {
  getRecentResources,
  RecentResourceEntry,
} from "@/lib/recentResources";
import { useMyReports } from "@/hooks/useMyReports";
import { useMyProfile } from "@/hooks/useMyProfile";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusStyles: Record<string, string> = {
  approved: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError } = useMyDashboard(user?.id);
  const { profileQuery } = useMyProfile(user?.id);
  const { data: reports = [], isLoading: reportsLoading } = useMyReports(user?.id);
  const [recentResources, setRecentResources] = useState<RecentResourceEntry[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<{
    kind: "resource" | "review";
    id: string;
    label: string;
  } | null>(null);
  const deleteResource = useDeleteMyResource();
  const deleteReview = useDeleteMyReview();
  const updateReview = useUpdateMyReview();
  const isDeleting = deleteResource.isPending || deleteReview.isPending;

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;

    try {
      if (pendingRemoval.kind === "resource") {
        await deleteResource.mutateAsync(pendingRemoval.id);
      } else {
        await deleteReview.mutateAsync(pendingRemoval.id);
      }
      setPendingRemoval(null);
    } catch {
      // The mutation hooks show an error toast; keep the dialog open so the user can retry.
    }
  };

  useEffect(() => {
    setRecentResources(user?.id ? getRecentResources(user.id) : []);
  }, [user?.id]);

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <VerifiedCard className="p-8 border-border">
            <h1 className="text-2xl font-bold text-foreground">Sign in to view your dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your uploads, reviews, and recently viewed resources are available after signing in.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth">Sign In</Link>
            </Button>
          </VerifiedCard>
        </main>
      </>
    );
  }

  const resources = data?.resources ?? [];
  const reviews = data?.reviews ?? [];
  const profile = profileQuery.data ?? user;
  const profileReady = profileQuery.isSuccess || profileQuery.isError;
  const missingProfileFields = [
    !profile.matricNumber?.trim() && "matric number",
    !profile.phone?.trim() && "phone number",
    !profile.department?.trim() && "department",
    !profile.faculty?.trim() && "faculty",
    !profile.currentLevel?.trim() && "current level",
  ].filter((field): field is string => Boolean(field));
  const completedProfileFields = 5 - missingProfileFields.length;
  const approvedCount = resources.filter((resource) => resource.status === "approved").length;
  const pendingCount = resources.filter((resource) => resource.status === "pending").length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Student activity</p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">
                Welcome, {user.name}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage uploads, lecturer reviews, and recently viewed resources.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/upload"><Upload className="h-4 w-4" /> Upload Resource</Link>
            </Button>
          </header>

          {isError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> Could not load your activity. Please refresh and try again.
            </div>
          )}

          <section aria-labelledby="student-profile-heading">
            <VerifiedCard className="space-y-5 border-border p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Your account</p>
                  <h2 id="student-profile-heading" className="mt-1 text-xl font-semibold text-foreground">
                    Student profile
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep your academic details current to get more relevant resources.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/profile"><Pencil className="h-4 w-4" /> Edit profile</Link>
                </Button>
              </div>

              {profileReady && missingProfileFields.length > 0 && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-medium text-foreground">Your profile needs an update</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add your {missingProfileFields.join(", ")} to complete your student profile.
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <Link href="/profile">Complete profile</Link>
                  </Button>
                </div>
              )}

              {profileQuery.isLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-muted" aria-label="Loading profile details" />
              ) : (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Profile completeness</span>
                      <span className="font-medium text-foreground">{completedProfileFields} of 5 details</span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label="Profile completeness"
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-valuenow={completedProfileFields}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${completedProfileFields * 20}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ProfileDetail icon={<IdCard className="h-4 w-4" />} label="Matric number" value={profile.matricNumber} />
                    <ProfileDetail icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
                    <ProfileDetail icon={<Building2 className="h-4 w-4" />} label="Department" value={profile.department} />
                    <ProfileDetail icon={<GraduationCap className="h-4 w-4" />} label="Faculty" value={profile.faculty} />
                    <ProfileDetail
                      icon={<BookOpen className="h-4 w-4" />}
                      label="Current level"
                      value={profile.currentLevel ? (profile.currentLevel === "postgraduate" ? "Postgraduate" : `${profile.currentLevel} Level`) : undefined}
                    />
                    <ProfileDetail icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
                  </div>
                  {profile.bio?.trim() && (
                    <div className="flex gap-3 border-t border-border pt-4">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">About you</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              {profileQuery.isError && (
                <p className="text-xs text-muted-foreground" role="status">
                  Could not refresh your profile. These are the details saved with your account.
                </p>
              )}
            </VerifiedCard>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Activity summary">
            <SummaryCard icon={<FileText className="h-5 w-5" />} label="Your uploads" value={isLoading ? "…" : resources.length} />
            <SummaryCard icon={<CheckCircle2 className="h-5 w-5" />} label="Approved" value={isLoading ? "…" : approvedCount} />
            <SummaryCard icon={<Clock3 className="h-5 w-5" />} label="Pending review" value={isLoading ? "…" : pendingCount} />
          </section>

          <section className="space-y-4">
            <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="Your uploads" count={resources.length} />
            {isLoading ? (
              <LoadingPanel />
            ) : resources.length === 0 ? (
              <EmptyPanel message="You have not uploaded any resources yet." action={<Button asChild variant="outline"><Link href="/upload">Upload your first resource</Link></Button>} />
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <VerifiedCard key={resource._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-border">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{resource.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resource.courseId?.courseCode || "Course"} · {resource.category} · Uploaded {formatDate(resource.createdAt)}
                      </p>
                      {resource.status === "rejected" && resource.rejectReason && (
                        <p className="mt-2 text-xs text-destructive">Reason: {resource.rejectReason}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${statusStyles[resource.status] ?? "border-border text-muted-foreground"}`}>
                        {resource.status}
                      </span>
                      {resource.status === "approved" && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/resources/${resource._id}`}>View</Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        aria-label={`Remove ${resource.title}`}
                        onClick={() => setPendingRemoval({
                          kind: "resource",
                          id: resource._id,
                          label: resource.title,
                        })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </VerifiedCard>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading icon={<MessageSquare className="h-5 w-5" />} title="Your lecturer reviews" count={reviews.length} />
            {isLoading ? (
              <LoadingPanel />
            ) : reviews.length === 0 ? (
              <EmptyPanel message="You have not posted any lecturer reviews yet." />
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewActivity
                    key={review._id}
                    review={review}
                    isSaving={updateReview.isPending}
                    isDeleting={deleteReview.isPending}
                    onSave={(content) => updateReview.mutateAsync({ id: review._id, content })}
                    onDelete={() => setPendingRemoval({
                      kind: "review",
                      id: review._id,
                      label: `${review.courseCode} review for ${review.lecturer?.name || "Lecturer"}`,
                    })}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading icon={<Flag className="h-5 w-5" />} title="Your reports" count={reports.length} />
            {reportsLoading ? (
              <LoadingPanel />
            ) : reports.length === 0 ? (
              <EmptyPanel message="Reports you submit about resources or reviews will appear here." />
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <VerifiedCard key={report._id} className="flex flex-col gap-3 border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{report.targetLabel}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {report.targetType} · Reported {formatDate(report.createdAt)} · {report.targetContext}
                      </p>
                      {report.resolutionNote && (
                        <p className="mt-2 text-xs text-muted-foreground">{report.resolutionNote}</p>
                      )}
                    </div>
                    <span className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs capitalize ${report.status === "pending" ? statusStyles.pending : report.status === "resolved" ? statusStyles.approved : "border-border text-muted-foreground"}`}>
                      {report.status === "resolved" ? "Resolved · content removed" : report.status}
                    </span>
                  </VerifiedCard>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading icon={<Eye className="h-5 w-5" />} title="Recently viewed" count={recentResources.length} />
            {recentResources.length === 0 ? (
              <EmptyPanel message="Resources you preview while signed in will appear here." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recentResources.map((resource) => (
                  <VerifiedCard key={resource.id} className="p-4 border-border">
                    <Link href={`/resources/${resource.id}`} className="font-semibold text-foreground hover:text-primary">
                      {resource.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {resource.courseCode || "Course"} · {resource.category} · Viewed {formatDate(resource.viewedAt)}
                    </p>
                  </VerifiedCard>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Dialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingRemoval(null);
        }}
      >
        <DialogContent className="gap-5 sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader className="pr-8">
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Remove {pendingRemoval?.kind === "resource" ? "this resource" : "this review"}?
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {pendingRemoval?.kind === "resource"
                ? `“${pendingRemoval.label}” will be removed from your uploads and the resource library. This action cannot be undone.`
                : `Your “${pendingRemoval?.label}” will be removed from the lecturer’s profile. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setPendingRemoval(null)}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmRemoval}
            >
              {isDeleting ? (
                <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />Removing…</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" />Remove</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <VerifiedCard className="flex items-center gap-4 p-4 border-border">
      <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </VerifiedCard>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-background p-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-foreground">{value?.trim() || "Not added yet"}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <span className="text-primary">{icon}</span>{title}
      </h2>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

function EmptyPanel({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

function LoadingPanel() {
  return <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />;
}

function ReviewActivity({
  review,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
}: {
  review: MyDashboardReview;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: (content: string) => Promise<unknown>;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(review.content);
  const [saveError, setSaveError] = useState("");

  return (
    <VerifiedCard className="space-y-3 p-4 border-border">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href={`/lecturers/${review.lecturer?._id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            {review.lecturer?.name || "Lecturer"}
          </Link>
          <span className="ml-2 rounded-sm bg-secondary/10 px-2 py-1 text-xs text-secondary">{review.courseCode}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
            className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => { setContent(review.content); setSaveError(""); setIsEditing(false); }}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSaving || content.trim().length < 10}
              onClick={async () => {
                try {
                  await onSave(content.trim());
                  setSaveError("");
                  setIsEditing(false);
                } catch {
                  setSaveError("Could not save your review. Please try again.");
                }
              }}
            >
              <Save className="mr-1 h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{review.content}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
            <Button variant="ghost" size="sm" disabled={isDeleting} onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Remove
            </Button>
          </div>
        </>
      )}
    </VerifiedCard>
  );
}
