"use client";

import { CheckCircle2, ChevronRight, User, ThumbsUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosClient } from "@/lib/api/axiosClient";

interface ResourceMetadataSidebarProps {
  category: string;
  courseCode: string;
  session: string;
  courseTitle: string;
  aiSnippet: string;
  aiTags: string[];
  lecturerName: string;
  lecturerDept: string;
  uploaderName: string;
  uploadDate: string;
  likes: number;
  lecturerId: string;
  resourceId: string;
  likedBy: string[];
  dislikedBy: string[];
}

export function ResourceMetadataSidebar({
  category,
  courseCode,
  session,
  courseTitle,
  aiSnippet,
  aiTags,
  lecturerName,
  lecturerDept,
  uploaderName,
  uploadDate,
  likes,
  lecturerId,
  resourceId,
  likedBy,
  dislikedBy
}: ResourceMetadataSidebarProps) {
  const { user } = useAuthStore();
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentDislikes, setCurrentDislikes] = useState(dislikedBy.length);
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
    // Optimistic update
    const prevVote = userVote;
    const prevLikes = currentLikes;
    const prevDislikes = currentDislikes;

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
      const res = await axiosClient.put(`/resources/${resourceId}/vote`, { voteType: type });
      // Update with actual server data to ensure sync
      if (res.data.success) {
        setCurrentLikes(res.data.data.likes);
        setCurrentDislikes(res.data.data.dislikes);
        setUserVote(res.data.data.userVote);
      }
    } catch (error) {
      // Revert on failure
      setUserVote(prevVote);
      setCurrentLikes(prevLikes);
      setCurrentDislikes(prevDislikes);
      console.error("Failed to record your vote:", error);
      alert("Failed to record your vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6">
      
      {/* Details Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>VERIFIED ACADEMIC MATERIAL</span>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">CATEGORY</div>
            <div className="text-sm font-medium">{category}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">COURSE CODE</div>
              <div className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded w-fit">{courseCode}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">SESSION</div>
              <div className="text-sm">{session}</div>
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">COURSE TITLE</div>
            <div className="text-sm font-medium">{courseTitle}</div>
          </div>
        </div>
      </div>

      {/* AI Inspection Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-5 h-5 flex items-center justify-center bg-blue-500 rounded text-white">
               {/* Custom AI icon placeholder */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <span>AI Inspection</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> GEMINI FLASH
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {aiSnippet}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {aiTags.map((tag, i) => (
            <span key={i} className="text-[10px] font-mono text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded-sm">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Lecturer Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">ASSOCIATED LECTURER</div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
             {/* <h3 className="text-xs font-semibold text-muted-foreground">{lecturerName.charAt(1).toUpperCase()}</h3> */}
             <h2>{lecturerName.split(' ')[1].charAt(0).toUpperCase()}</h2>
          </div>
          <div>
            <div className="font-semibold text-sm">{lecturerName}</div>
            <div className="text-xs text-muted-foreground">{lecturerDept}</div>
          </div>
        </div>
        
        <Button variant="outline" className="w-full justify-between bg-background border-border hover:bg-background/80 text-xs h-9" asChild>
          <Link href={`/lecturers/${lecturerId}`}>

            View Profile & Reviews
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </Button>
      </div>

      {/* Uploader Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-background border border-border flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">UPLOADED BY</div>
              <div className="text-xs font-semibold">{uploaderName}</div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">{uploadDate}</div>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Button 
            variant="outline" 
            onClick={() => handleVote("up")}
            disabled={isVoting}
            className={`flex-1 gap-2 h-9 text-xs transition-colors ${
              userVote === "up" 
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400" 
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Like ({currentLikes})
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleVote("down")}
            disabled={isVoting}
            className={`w-9 h-9 p-0 flex-shrink-0 transition-colors ${
               userVote === "down"
                ? "bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-400"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            }`}
          >
             <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <a href="#" className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border hover:decoration-muted-foreground transition-colors">
            Report Bad/Non-Academic File
          </a>
        </div>
      </div>

    </div>
  );
}
