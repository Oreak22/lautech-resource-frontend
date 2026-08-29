import { Resource } from "@/types/resource";
import { VerifiedCard } from "@/components/ui/verified-card";
import {
  FileText,
  FileArchive,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResourceCard({ resource }: { resource: Resource }) {
  const getFileIcon = () => {
    if (resource.fileFormat.includes("pdf"))
      return <FileText className="h-5 w-5 text-secondary" />;
    if (
      resource.fileFormat.includes("zip") ||
      resource.fileFormat.includes("rar")
    )
      return <FileArchive className="h-5 w-5 text-warning" />;
    if (resource.fileFormat.includes("image"))
      return <ImageIcon className="h-5 w-5 text-primary" />;
    return <FileText className="h-5 w-5 text-secondary" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <VerifiedCard
      className="p-5 flex flex-col h-full border border-border group hover:border-primary/50"
      isVerified={true}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-background rounded-md border border-border">
          {getFileIcon()}
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded-sm">
          {resource.category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {resource.courseId.courseCode} • {resource.lecturerId.name}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.keywords.slice(0, 3).map((keyword, i) => (
            <span
              key={i}
              className="text-[10px] font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground font-mono">
          {formatSize(resource.fileSize)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 hover:text-primary hover:bg-primary/10"
          asChild
        >
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only text-xs">View</span>
          </a>
        </Button>
      </div>
    </VerifiedCard>
  );
}
