"use client";

import { DocumentPreviewer } from "@/components/resources/DocumentPreviewer";
import { ResourceMetadataSidebar } from "@/components/resources/ResourceMetadataSidebar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetResource } from "@/hooks/useGetResource";
import { use, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { recordRecentResource } from "@/lib/recentResources";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { ShareMenu } from "@/components/share/ShareMenu";
interface PageProps {
  params: Promise<{ id: string }>;
}
export default function ResourcePreviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: resource, isLoading, isError } = useGetResource(id);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!resource || !userId) return;

    recordRecentResource(userId, {
      id: resource._id,
      title: resource.title,
      category: resource.category,
      courseCode: resource.courseId?.courseCode || "",
    });
  }, [resource, userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Resource not found</h1>
        <p className="text-muted-foreground mb-6">The resource you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/resources">Return to Vault</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mx-auto max-w-[1600px] flex flex-col font-sans">
      {/* Top Header / Nav Bar specific to preview */}
      <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-100">
        <div className="flex items-center gap-4">
          <Link href="/resources" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Link>
          <div className="h-4 w-px bg-border mx-2"></div>
          <h1 className="text-lg font-semibold text-foreground truncate max-w-lg hidden sm:block">
            {resource.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ShareMenu
            path={`/resources/${resource._id}`}
            title={resource.title}
            description={`${resource.category} · ${resource.courseId?.courseCode || "LAUTECH course resource"}${resource.courseId?.title ? ` — ${resource.courseId.title}` : ""}${resource.aiSummary ? `\n${resource.aiSummary}` : ""}`}
            className="h-9 w-9 bg-card border-border hover:bg-background/80"
          />
          <ReportDialog
            targetType="resource"
            targetId={resource._id}
            targetLabel={resource.title}
            iconOnly
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-card"
          />
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center lg:flex-row gap-8">
        {/* Left/Center: Document Preview */}
        <DocumentPreviewer 
          title={resource.title} 
          fileUrl={resource.fileUrl} 
          fileFormat={resource.fileFormat}
        />

        {/* Right: Metadata Sidebar */}
        <ResourceMetadataSidebar 
          category={resource.category}
          courseCode={resource.courseId?.courseCode || "Unknown"}
          session={resource.session || "Any"}
          courseTitle={resource.courseId?.title || "Unknown"}
          aiSnippet={resource.aiSummary || "No AI summary available."}
          aiTags={resource.keywords || []}
          lecturerName={resource.lecturerId?.name || "Unknown"}
          lecturerDept={resource.courseId?._id ? "Assigned Dept" : "Unknown"}
          uploaderName={resource.uploaderId?.name || "Anonymous"}
          uploadDate={new Date(resource.createdAt).toLocaleDateString()}
          likes={resource.likes }
          lecturerId={resource.lecturerId?._id}
          resourceId={resource._id}
          likedBy={resource.likedBy || []}
          dislikedBy={resource.dislikedBy || []}
        />
      </main>
    </div>
  );
}
