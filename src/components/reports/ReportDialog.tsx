"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, Flag, Loader2, Send } from "lucide-react";
import { axiosClient } from "@/lib/api/axiosClient";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type ReportTargetType = "resource" | "review";

const reasonOptions: Record<ReportTargetType, Array<{ value: string; label: string }>> = {
  resource: [
    { value: "non_academic", label: "Not an academic resource" },
    { value: "incorrect_file", label: "File does not match the description" },
    { value: "copyright", label: "Copyright or ownership concern" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "broken_file", label: "File is broken or unreadable" },
    { value: "other", label: "Other concern" },
  ],
  review: [
    { value: "harassment", label: "Harassment or personal attack" },
    { value: "spam", label: "Spam or promotional content" },
    { value: "misinformation", label: "Misleading or fabricated information" },
    { value: "personal_information", label: "Shares private information" },
    { value: "other", label: "Other concern" },
  ],
};

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  triggerLabel?: string;
  iconOnly?: boolean;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export function ReportDialog({
  targetType,
  targetId,
  targetLabel,
  triggerLabel = "Report",
  iconOnly = false,
  variant = "link",
  size = "sm",
  className,
}: ReportDialogProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async () => {
    if (!reason) {
      setErrorMessage("Choose a reason for this report.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const { data } = await axiosClient.post("/reports", {
        targetType,
        targetId,
        reason,
        details,
      });
      toast.add({
        title: "Report submitted",
        description: data.message || "Our team will review it.",
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["reports", "mine", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (error) {
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Could not submit your report. Try again."
          : "Could not submit your report. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && setOpen(nextOpen)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(!iconOnly && "gap-1.5", className)}
        aria-label={iconOnly ? `Report ${targetLabel}` : undefined}
        onClick={() => {
          setErrorMessage("");
          setOpen(true);
        }}
      >
        {iconOnly ? <Flag className="h-4 w-4" /> : <><AlertCircle className="h-3.5 w-3.5" />{triggerLabel}</>}
      </Button>
      <DialogContent className="gap-5 sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>{user ? "Report content" : "Sign in to report"}</DialogTitle>
          <DialogDescription>
            {user
              ? `Tell our moderation team what is wrong with “${targetLabel}”. Reports are reviewed privately.`
              : "Reports help keep the resource vault useful and safe. Sign in to send a report to the moderation team."}
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`report-reason-${targetId}`}>Reason</Label>
              <select
                id={`report-reason-${targetId}`}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                disabled={isSubmitting}
              >
                <option value="">Choose a reason</option>
                {reasonOptions[targetType].map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`report-details-${targetId}`}>Details <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <textarea
                id={`report-details-${targetId}`}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={1000}
                placeholder="Add context to help us review this report."
                className="min-h-24 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                disabled={isSubmitting}
              />
              <p className="text-right text-xs text-muted-foreground">{details.length}/1000</p>
            </div>
            {errorMessage && (
              <p className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMessage}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={isSubmitting} onClick={submitReport}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit report
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
