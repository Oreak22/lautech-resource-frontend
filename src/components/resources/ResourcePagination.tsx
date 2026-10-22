"use client";

import { Button } from "@/components/ui/button";

interface ResourcePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ResourcePagination({
  currentPage,
  totalPages,
  onPageChange,
}: ResourcePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Resource pages"
      className="flex items-center justify-center gap-4 pt-2"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span aria-live="polite" className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
