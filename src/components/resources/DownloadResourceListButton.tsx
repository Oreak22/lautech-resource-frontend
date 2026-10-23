"use client";

import { useState } from "react";
import { ChevronDown, Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { downloadResourceList } from "@/lib/downloadResourceList";
import type { Resource } from "@/types/resource";

type DownloadFormat = "zip" | "files";

export function DownloadResourceListButton({
  resources,
  listName,
  label = "Download all",
}: {
  resources: Resource[];
  listName: string;
  label?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(resources.length);

  const startDownload = async (format: DownloadFormat) => {
    setMenuOpen(false);
    setDownloading(true);
    setCompleted(0);
    setTotal(resources.length);
    try {
      await downloadResourceList(resources, listName, format, (count, countTotal) => {
        setCompleted(count);
        setTotal(countTotal);
      });
      toast.add({
        title: format === "zip" ? "ZIP download ready" : "Downloads started",
        description: format === "zip"
          ? `${resources.length} resources were added to ${listName}.zip.`
          : "Your browser may ask you to allow multiple downloads.",
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "Could not download the list",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={resources.length === 0 || downloading}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {downloading ? `Downloading ${completed}/${total}` : label}
        {!downloading && <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {menuOpen && !downloading && (
        <div role="menu" aria-label="Download list options" className="absolute right-0 top-full z-20 mt-2 min-w-52 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
          <button type="button" role="menuitem" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => startDownload("zip")}>
            Download as ZIP
          </button>
          <button type="button" role="menuitem" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => startDownload("files")}>
            Download files separately
          </button>
        </div>
      )}
    </div>
  );
}
