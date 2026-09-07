"use client";

import { useState, useEffect } from "react";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layouts/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useSearchResources } from "@/hooks/useSearchResources";

export default function ResourceVaultPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  
  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError } = useSearchResources({
    q: debouncedSearch,
    category,
    page: 1,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* Main Layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        
        {/* Left Sidebar (Filters) */}
        <aside className="hidden md:block">
          <ResourceFilters category={category} setCategory={setCategory} />
        </aside>

        {/* Right Content */}
        <div className="flex flex-col gap-6">
          
          <div className="relative w-full max-w-lg mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search resources..." 
              className="pl-9 bg-card border-border h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Top Bar for active filters & Sort */}
          <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Active:</span>
              <div className="flex flex-wrap gap-2">
                {debouncedSearch && (
                   <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                     {debouncedSearch}
                     <button onClick={() => setSearchTerm("")} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                   </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {category}
                    <button onClick={() => setCategory(undefined)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
              {(debouncedSearch || category) && (
                <Button 
                  variant="link" 
                  onClick={() => { setSearchTerm(""); setCategory(undefined); }} 
                  className="text-xs text-muted-foreground h-auto p-0 hover:text-foreground underline underline-offset-4"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px] h-9 bg-background border-border text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-downloaded" className="text-xs">Most Downloaded</SelectItem>
                  <SelectItem value="newest" className="text-xs">Newest First</SelectItem>
                  <SelectItem value="highest-rated" className="text-xs">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid of Resources */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-card animate-pulse border border-border" />
               ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-destructive border border-dashed border-destructive/50 rounded-xl">
               Failed to load resources. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No resources found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.data.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
