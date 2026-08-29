"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchResources } from "@/hooks/useSearchResources";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Navbar } from "@/components/layouts/Navbar";

export default function VaultPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  // Debounce the search input to prevent API spam while typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError } = useSearchResources({
    q: debouncedSearch,
    category: activeCategory,
    page: 1,
  });

  const categories = ["Past Question", "Handout", "Textbook", "Project Report"];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-12">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            The Central Academic Vault for LAUTECH Students.
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Access verified past exam questions, scanned lecture handouts,
            textbooks, and project reports—powered by AI document verification.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search course code (e.g. CSE 301), lecturer name, or topic..."
              className="pl-12 h-12 text-base rounded-xl shadow-lg border-border/50 bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(undefined)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${
                !activeCategory
                  ? "bg-secondary/20 text-secondary border-secondary/30"
                  : "bg-card text-muted-foreground border-border hover:border-secondary/50"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${
                  activeCategory === cat
                    ? "bg-secondary/20 text-secondary border-secondary/30"
                    : "bg-card text-muted-foreground border-border hover:border-secondary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Results Grid */}
        <section className="container px-4 md:px-8 mx-auto max-w-[1280px]">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {debouncedSearch ? "Search Results" : "Recent Uploads"}
            </h2>
            <span className="text-sm font-mono text-muted-foreground">
              {data?.total || 0} Documents
            </span>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-card animate-pulse border border-border"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-destructive">
              Failed to load resources. Please try again later.
            </div>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">
                No resources found matching your search criteria.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
