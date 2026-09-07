"use client";

import { useState } from "react";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import {
  useModerationQueue,
  useApproveResource,
  useRejectResource,
  PendingResource,
} from "@/hooks/useModerationQueue";
import {
  ShieldCheck,
  FileText,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { Database, Users, GraduationCap, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: queue, isLoading, isError } = useModerationQueue();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  return (
    <div className="py-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Moderation Queue
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve AI-extracted resources before they go public.
              </p>
            </div>

            <div className="px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-md">
              <span className="text-sm font-mono text-secondary">
                {queue?.length || 0} Pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <VerifiedCard className="p-4 border-border flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">
                  Approved Docs
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsLoading
                    ? "..."
                    : (analytics?.approvedResources ?? 0)}
                </p>
              </div>
            </VerifiedCard>

            <VerifiedCard className="p-4 border-border flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">
                  Pending Queue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsLoading
                    ? "..."
                    : (analytics?.pendingResources ?? 0)}
                </p>
              </div>
            </VerifiedCard>

            <VerifiedCard className="p-4 border-border flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">
                  Verified Lecturers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsLoading
                    ? "..."
                    : `${analytics?.verifiedLecturers ?? 0}/${analytics?.totalLecturers ?? 0}`}
                </p>
              </div>
            </VerifiedCard>

            <VerifiedCard className="p-4 border-border flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsLoading ? "..." : (analytics?.totalStudents ?? 0)}
                </p>
              </div>
            </VerifiedCard>
          </div>

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              Loading queue...
            </div>
          )}

          {isError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
              Failed to load the moderation queue. Ensure you have admin
              privileges.
            </div>
          )}

          {queue?.length === 0 && (
            <VerifiedCard className="p-12 text-center border-dashed border-border">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground">
                Queue is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                All resources have been moderated.
              </p>
            </VerifiedCard>
          )}

          <div className="space-y-6">
            {queue?.map((resource) => (
              <ModerationItem key={resource._id} resource={resource} />
            ))}
          </div>
        </div>
    </div>
  );
}

// Extracted Card Component for localized rejection state
function ModerationItem({ resource }: { resource: PendingResource }) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const approveMutation = useApproveResource();
  const rejectMutation = useRejectResource();

  const handleApprove = () => approveMutation.mutate(resource._id);

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ id: resource._id, reason: rejectReason });
  };

  return (
    <VerifiedCard className="p-6 border-border flex flex-col md:flex-row gap-6 transition-all">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              {resource.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-muted-foreground">
              <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-sm">
                {resource.courseId.courseCode}
              </span>
              <span>•</span>
              <span>{resource.lecturerId.name}</span>
              <span>•</span>
              <span>Uploaded by: {resource.uploaderId.name}</span>
            </div>
          </div>

          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View File <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="p-4 bg-background/50 border border-border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-secondary" /> AI Summary
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-sm flex items-center gap-1 ${resource.aiConfidenceScore > 0.8 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}
            >
              {resource.aiConfidenceScore > 0.8 ? (
                <Check className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              Conf: {(resource.aiConfidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {resource.aiSummary || "No AI summary generated for this document."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {resource.keywords.map((kw, i) => (
              <span
                key={i}
                className="text-[10px] uppercase font-mono text-muted-foreground bg-input px-2 py-1 rounded-sm"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex md:flex-col gap-3 justify-end md:min-w-[160px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
        {!isRejecting ? (
          <>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRejecting(true)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" /> Reject
            </Button>
          </>
        ) : (
          <div className="w-full space-y-2 animate-in fade-in slide-in-from-right-4">
            <Input
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsRejecting(false)}
                className="w-full text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </VerifiedCard>
  );
}
