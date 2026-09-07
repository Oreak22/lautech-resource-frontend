"use client";

import { useState } from "react";
import { Resource } from "@/types/resource";
import { VerifiedCard } from "@/components/ui/verified-card";
import { ThumbsUp, ThumbsDown, Download, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosClient } from "@/lib/api/axiosClient";

export function ResourceCard({ resource }: { resource: Resource }) {
  const { user } = useAuthStore();
  const isPastQuestion = resource.category === "Past Question";
  const aiSnippet = resource.aiSummary || "Covers essential topics related to this course.";
  const aiMatch = resource.aiConfidenceScore ? `${Math.round(resource.aiConfidenceScore * 100)}% Academic Match` : "AI Checked";
  const session = resource.session || "Any Session";
  const uploader = resource.uploaderId?.name || "Anonymous Student";

  const likedBy = resource.likedBy || [];
  const dislikedBy = resource.dislikedBy || [];

  const [currentLikes, setCurrentLikes] = useState(resource.likes || 0);
  const [currentDislikes, setCurrentDislikes] = useState(resource.dislikes || 0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    user ? (likedBy.includes(user.id) ? "up" : dislikedBy.includes(user.id) ? "down" : null) : null
  );
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (!user) {
      alert("Please sign in to vote on resources.");
      return;
    }

    setIsVoting(true);
    const prevVote = userVote;
    const prevLikes = currentLikes;
    const prevDislikes = currentDislikes;

    // Optimistic update
    if (type === "up") {
      if (userVote === "up") {
        setUserVote(null);
        setCurrentLikes((prev) => prev - 1);
      } else {
        setUserVote("up");
        setCurrentLikes((prev) => prev + 1);
        if (userVote === "down") setCurrentDislikes((prev) => prev - 1);
      }
    } else {
      if (userVote === "down") {
        setUserVote(null);
        setCurrentDislikes((prev) => prev - 1);
      } else {
        setUserVote("down");
        setCurrentDislikes((prev) => prev + 1);
        if (userVote === "up") setCurrentLikes((prev) => prev - 1);
      }
    }

    try {
      const res = await axiosClient.put(`/resources/${resource._id}/vote`, { voteType: type });
      if (res.data.success) {
        setCurrentLikes(res.data.data.likes);
        setCurrentDislikes(res.data.data.dislikes);
        setUserVote(res.data.data.userVote);
      }
    } catch (error) {
      setUserVote(prevVote);
      setCurrentLikes(prevLikes);
      setCurrentDislikes(prevDislikes);
      console.error("Failed to vote:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <VerifiedCard
      className="p-5 flex flex-col h-full bg-card border-border hover:border-primary/50 transition-colors rounded-xl"
      isVerified={true}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-sm border ${isPastQuestion ? "text-purple-400 border-purple-400/30 bg-purple-400/10" : "text-blue-400 border-blue-400/30 bg-blue-400/10"}`}>
          {resource.category}
        </span>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-sm border border-border bg-background/50 text-foreground">
          {session}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-4 leading-tight">
          {resource.title}
        </h3>

        {isPastQuestion ? (
          <div className="border-l-2 border-emerald-500 pl-3 mb-4">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold text-emerald-400 not-italic mr-1">AI Snippet:</span>
              {aiSnippet}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded flex items-center w-fit gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              AI Checked: {aiMatch}
            </span>
          </div>
        )}

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{resource.lecturerId.name}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <User className="w-3.5 h-3.5" />
            <span>{uploader}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.keywords.map((keyword, i) => (
            <span
              key={i}
              className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-sm"
            >
              #{keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              userVote === "up"
                ? "text-emerald-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{currentLikes}</span>
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              userVote === "down"
                ? "text-rose-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{currentDislikes}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-4 bg-transparent border-border hover:bg-background/50"
            asChild
          >
            <Link href={`/resources/${resource._id}`}>
              Preview
            </Link>
          </Button>
          {isPastQuestion && (
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-white"
              asChild
            >
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </VerifiedCard>
  );
}
