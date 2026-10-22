"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  AlertCircle,
  ExternalLink,
  FileWarning,
  Flag,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedCard } from "@/components/ui/verified-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminReports, useReviewReport } from "@/hooks/useAdminReports";
import type { AdminReport, ReportStatus } from "@/hooks/useAdminReports";

const statuses: Array<{ value: ReportStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Removed" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All reports" },
];

const reportReasonLabels: Record<string, string> = {
  non_academic: "Not an academic resource",
  incorrect_file: "File does not match the description",
  copyright: "Copyright or ownership concern",
  inappropriate: "Inappropriate content",
  broken_file: "File is broken or unreadable",
  harassment: "Harassment or personal attack",
  spam: "Spam or promotional content",
  misinformation: "Misleading or fabricated information",
  personal_information: "Shares private information",
  other: "Other concern",
};

export default function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus>("pending");
  const { data: reports = [], isLoading, isError } = useAdminReports(status);
  const pendingCount = reports.filter((report) => report.status === "pending").length;

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Administration</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
              <Flag className="h-6 w-6 text-primary" /> Content reports
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review reports about resources and lecturer reviews, then decide whether the content stays up.
            </p>
          </div>
          {status === "pending" && (
            <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-600 dark:text-amber-400">
              {pendingCount} awaiting review
            </span>
          )}
        </header>

        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {statuses.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={status === item.value ? "default" : "outline"}
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reports…
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> Could not load reports. Ensure you have admin access and try again.
          </div>
        )}
        {!isLoading && !isError && reports.length === 0 && (
          <VerifiedCard className="border-dashed border-border p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h2 className="font-semibold text-foreground">No reports here</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {status === "pending" ? "New reports will appear here for review." : "There are no reports in this view."}
            </p>
          </VerifiedCard>
        )}

        <div className="space-y-4">
          {reports.map((report) => <ReportCard key={report._id} report={report} />)}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: AdminReport }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const reviewMutation = useReviewReport();
  const isPending = report.status === "pending";
  const resourceTarget = report.targetType === "resource"
    ? report.target as { _id: string; title: string; category: string; status: string; fileUrl: string; courseId?: { courseCode: string; title: string } }
    : null;
  const reviewTarget = report.targetType === "review"
    ? report.target as { _id: string; courseCode: string; content: string; authorAlias: string; lecturer?: { _id: string; name: string } }
    : null;

  const dismiss = async () => {
    setErrorMessage("");
    try {
      await reviewMutation.mutateAsync({ id: report._id, action: "dismiss" });
    } catch (error) {
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.error || "Could not dismiss report" : "Could not dismiss report");
    }
  };

  const removeContent = async () => {
    setErrorMessage("");
    try {
      await reviewMutation.mutateAsync({ id: report._id, action: "remove" });
      setConfirmOpen(false);
    } catch (error) {
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.error || "Could not remove content" : "Could not remove content");
    }
  };

  return (
    <VerifiedCard className="space-y-4 border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg bg-destructive/10 p-2 text-destructive">
            <FileWarning className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">{report.targetLabel}</h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                {report.targetType}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${report.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : report.status === "resolved" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                {report.status === "resolved" ? "removed" : report.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Reported by {report.reporterId?.name || "Student"} ({report.reporterId?.email || "No email"}) · {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {report.targetType === "resource" && resourceTarget?.fileUrl && (
          <a href={resourceTarget.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Open file <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {report.targetType === "review" && reviewTarget?.lecturer?._id && (
          <Link href={`/lecturers/${reviewTarget.lecturer._id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            View lecturer <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-background/60 p-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reason</p>
          <p className="mt-1 text-sm font-medium text-foreground">{reportReasonLabels[report.reason] || report.reason}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reported item</p>
          <p className="mt-1 text-sm text-foreground">{report.targetContext || "Content unavailable"}</p>
        </div>
        {report.details && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reporter’s details</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{report.details}</p>
          </div>
        )}
        {reviewTarget && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Review content</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{reviewTarget.content}</p>
          </div>
        )}
        {report.resolutionNote && (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resolution</p>
            <p className="mt-1 text-sm text-muted-foreground">{report.resolutionNote}</p>
          </div>
        )}
      </div>

      {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
      {isPending && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" disabled={reviewMutation.isPending} onClick={dismiss}>
            Dismiss report
          </Button>
          <Button variant="destructive" disabled={reviewMutation.isPending} onClick={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove content
          </Button>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={(open) => !reviewMutation.isPending && setConfirmOpen(open)}>
        <DialogContent className="gap-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Remove reported {report.targetType}?</DialogTitle>
            <DialogDescription>
              This permanently removes “{report.targetLabel}” from the public vault and resolves its pending reports.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={reviewMutation.isPending} onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={reviewMutation.isPending} onClick={removeContent}>
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VerifiedCard>
  );
}
