"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Review } from "@/hooks/useLecturerProfile";

const reviewSchema = z.object({
  courseCode: z.string().min(2, "Course code is required"),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review is too long"),
  isAnonymous: z.boolean(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFeedProps {
  lecturerId: string;
  reviews: Review[];
}

export function ReviewFeed({ lecturerId, reviews }: ReviewFeedProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { isAnonymous: true },
  });

  // Mutation for posting a new review
  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const response = await axiosClient.post(
        `/lecturers/${lecturerId}/reviews`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      reset();
      setErrorMsg("");
      // Refetch the lecturer profile to show the new review instantly
      queryClient.invalidateQueries({ queryKey: ["lecturer", lecturerId] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(error.response?.data?.error || "Failed to submit review");
    },
  });

  const onSubmit: SubmitHandler<ReviewFormValues> = (data) => {
    submitReviewMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <VerifiedCard className="p-5 border-border bg-card">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Submit an Academic Review
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
              Course Code
            </label>
            <Input
              placeholder="e.g. CSE 301"
              {...register("courseCode")}
              className="max-w-[200px]"
            />
            {errors.courseCode && (
              <p className="text-xs text-destructive mt-1">
                {errors.courseCode.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
              Your Thoughts
            </label>
            <textarea
              placeholder="Discuss their teaching style, material clarity, and grading fairness..."
              {...register("content")}
              className="flex min-h-[100px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_10px_rgba(78,222,163,0.15)] resize-y"
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anon"
                {...register("isAnonymous")}
                className="rounded border-border bg-input"
              />
              <label htmlFor="anon" className="text-xs text-muted-foreground">
                Post Anonymously
              </label>
            </div>
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending}
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              {submitReviewMutation.isPending ? "Posting..." : "Publish Review"}
              {!submitReviewMutation.isPending && <Send className="h-3 w-3" />}
            </Button>
          </div>
        </form>
      </VerifiedCard>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              lecturerId={lecturerId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewItem({
  review,
  lecturerId,
}: {
  review: Review;
  lecturerId: string;
}) {
  const queryClient = useQueryClient();

  // Mutation for upvoting/downvoting
  const voteMutation = useMutation({
    mutationFn: async (voteType: "up" | "down") => {
      const response = await axiosClient.put(`/reviews/${review._id}/vote`, {
        voteType,
      });
      return response.data;
    },
    onSuccess: () => {
      // Instantly refresh the parent query to show new vote totals
      queryClient.invalidateQueries({ queryKey: ["lecturer", lecturerId] });
    },
  });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-5 rounded-lg border border-border bg-background transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-foreground">
            {review.authorAlias}
          </span>
          <span className="mx-2 text-muted-foreground text-xs">•</span>
          <span className="text-xs font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded-sm">
            {review.courseCode}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(review.createdAt)}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
        {review.content}
      </p>

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <button
          onClick={() => voteMutation.mutate("up")}
          disabled={voteMutation.isPending}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors text-muted-foreground hover:text-primary"
        >
          <ThumbsUp className="h-4 w-4" /> {review.upvotes}
        </button>
        <button
          onClick={() => voteMutation.mutate("down")}
          disabled={voteMutation.isPending}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors text-muted-foreground hover:text-destructive"
        >
          <ThumbsDown className="h-4 w-4" /> {review.downvotes}
        </button>

        <button className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <AlertCircle className="h-3 w-3" /> Report
        </button>
      </div>
    </div>
  );
}
