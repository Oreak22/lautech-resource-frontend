"use client";

import { Maximize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentPreviewerProps {
  title: string;
  fileUrl: string;
  fileFormat: string;
}

export function DocumentPreviewer({ title, fileUrl, fileFormat }: DocumentPreviewerProps) {
  return (
    <div className="flex-1 w-full max-w-4xl flex flex-col gap-4">
      {/* Top Header for Previewer area */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground truncate mr-4">
          {title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-2 h-9 px-4" asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download File</span>
            </a>
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border hover:bg-background/50">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mac OS Window Frame */}
      <div className="flex-1 min-h-[600px] w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Window Title Bar */}
        <div className="h-10 bg-muted border-b border-border flex items-center px-4 relative shrink-0">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-muted-foreground">Resource Preview</span>
          </div>
        </div>
        
        {/* Document Area */}
        <div className="flex-1 bg-[#f5f5f5] w-full flex justify-center p-8 overflow-y-auto overflow-x-hidden relative">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
            <div className="text-[150px] font-bold text-black rotate-[-45deg] whitespace-nowrap tracking-widest">
              LAUTECH RESOURCE BANK
            </div>
          </div>
          
          {/* Document Pages Container */}
          <div className="flex gap-6 z-10 w-full max-w-[800px] h-full relative">
            {fileFormat?.includes("image") ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={fileUrl} 
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded shadow-lg border border-border bg-white"
                />
              </div>
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                title={title}
                className="w-full h-full min-h-[700px] bg-white rounded shadow-lg border border-border"
              />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
