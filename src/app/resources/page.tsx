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
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useSearchResources } from "@/hooks/useSearchResources";
import { ResourcePagination } from "@/components/resources/ResourcePagination";
import { useCourses, useDepartments } from "@/hooks/useDirectory";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ResourceVaultPage() {
  const user = useAuthStore((state) => state.user);
  const { profileQuery } = useMyProfile(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [department, setDepartment] = useState<string | undefined>();
  const [level, setLevel] = useState<string | undefined>();
  const [semester, setSemester] = useState<"first" | "second" | undefined>();
  const [sortBy, setSortBy] = useState<
    "newest" | "department" | "level" | "semester"
  >("newest");
  const [page, setPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const profile = profileQuery.data ?? user;
  const profileDepartment = profile?.department?.trim() || undefined;
  const profileLevel = profile?.currentLevel && /^\d+$/.test(profile.currentLevel)
    ? profile.currentLevel
    : undefined;
  const hasPersonalizedProfile = Boolean(user && (profileDepartment || profileLevel));
  const recommendationQuery = useSearchResources({
    department: profileDepartment,
    level: profileLevel,
    sortBy: "newest",
    page: 1,
    enabled: hasPersonalizedProfile,
  });
  const needsDepartmentFallback = Boolean(
    hasPersonalizedProfile &&
      profileDepartment &&
      profileLevel &&
      recommendationQuery.isSuccess &&
      recommendationQuery.data.data.length === 0,
  );
  const departmentFallbackQuery = useSearchResources({
    department: profileDepartment,
    sortBy: "newest",
    page: 1,
    enabled: needsDepartmentFallback,
  });
  const recommendedResources =
    recommendationQuery.data?.data.length
      ? recommendationQuery.data.data
      : departmentFallbackQuery.data?.data ?? [];
  const isRecommendationsLoading = Boolean(
    hasPersonalizedProfile &&
      (recommendationQuery.isLoading ||
        (needsDepartmentFallback && departmentFallbackQuery.isLoading)),
  );
  const recommendationsFailed = Boolean(
    recommendationQuery.isError ||
      (needsDepartmentFallback && departmentFallbackQuery.isError),
  );
  const { data: departmentRecords = [] } = useDepartments();
  const { data: courses = [] } = useCourses();
  const departments = departmentRecords.map((record) => record.name);
  const activeFilterCount = [category, department, level, semester].filter(Boolean).length;
  const levels = Array.from(
    new Set(
      courses.flatMap((course) => {
        const courseNumberMatch = course.courseCode.match(/\d+/);
        if (!courseNumberMatch) return [];

        const courseLevel = Math.floor(Number(courseNumberMatch[0]) / 100) * 100;
        return courseLevel >= 100 ? [String(courseLevel)] : [];
      }),
    ),
  ).sort((a, b) => Number(a) - Number(b));

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, department, level, semester, sortBy]);

  const { data, isLoading, isError } = useSearchResources({
    q: debouncedSearch,
    category,
    department,
    level,
    semester,
    sortBy,
    page,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      {/* Main Layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Left Sidebar (Filters) */}
        <aside className="hidden md:block">
          <ResourceFilters
            category={category}
            setCategory={setCategory}
            department={department}
            departments={departments}
            setDepartment={setDepartment}
            level={level}
            levels={levels}
            setLevel={setLevel}
            semester={semester}
            setSemester={setSemester}
          />
        </aside>

        <Dialog open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
          <DialogContent
            className="left-0 top-0 h-dvh w-[min(88vw,360px)] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none p-5 duration-300 data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-none"
          >
            <DialogTitle className="sr-only">Resource filters</DialogTitle>
            <ResourceFilters
              category={category}
              setCategory={setCategory}
              department={department}
              departments={departments}
              setDepartment={setDepartment}
              level={level}
              levels={levels}
              setLevel={setLevel}
              semester={semester}
              setSemester={setSemester}
            />
            <Button className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
              Show resources
            </Button>
          </DialogContent>
        </Dialog>

        {/* Right Content */}
        <div className="flex flex-col gap-6">
          {hasPersonalizedProfile && (
            <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" /> Picked for you
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                    Resources for your studies
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {[profileDepartment, profileLevel && `${profileLevel} Level`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    setSearchTerm("");
                    setCategory(undefined);
                    setDepartment(profileDepartment);
                    setLevel(profileLevel);
                    setSemester(undefined);
                    setPage(1);
                  }}
                >
                  Browse recommendations
                </Button>
              </div>

              {isRecommendationsLoading ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-56 animate-pulse rounded-xl border border-border bg-background/60" />
                  ))}
                </div>
              ) : recommendationsFailed ? (
                <p className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                  Could not load your recommendations. Please try again shortly.
                </p>
              ) : recommendedResources.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendedResources.slice(0, 3).map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl border border-dashed border-border bg-background/50 px-4 py-6 text-sm text-muted-foreground">
                  No approved resources match your profile yet. We’ll show recommendations here as they become available.
                </p>
              )}
            </section>
          )}

          <div className="mb-2 flex w-full max-w-lg gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                className="pl-9 bg-card border-border h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="shrink-0 gap-2 px-3 md:hidden"
              aria-label={`Open filters${activeFilterCount ? `, ${activeFilterCount} active` : ""}`}
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Top Bar for active filters & Sort */}
          <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Active:</span>
              <div className="flex flex-wrap gap-2">
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {debouncedSearch}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {category}
                    <button
                      onClick={() => setCategory(undefined)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {department && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {department}
                    <button
                      onClick={() => setDepartment(undefined)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {level && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {level} Level
                    <button
                      onClick={() => setLevel(undefined)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {semester && (
                  <span className="inline-flex items-center gap-1 bg-background border border-border text-xs px-2.5 py-1 rounded-sm text-foreground">
                    {semester === "first" ? "First" : "Second"} Semester
                    <button
                      onClick={() => setSemester(undefined)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              {(debouncedSearch || category || department || level || semester) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("");
                    setCategory(undefined);
                    setDepartment(undefined);
                    setLevel(undefined);
                    setSemester(undefined);
                  }}
                  className="text-xs text-muted-foreground h-auto p-0 hover:text-foreground underline underline-offset-4"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(
                    (value as "newest" | "department" | "level" | "semester") ??
                      "newest",
                  )
                }
              >
                <SelectTrigger className="w-[220px] h-9 bg-background border-border text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-xs">
                    Newest First
                  </SelectItem>
                  <SelectItem value="department" className="text-xs">
                    Department A–Z
                  </SelectItem>
                  <SelectItem value="level" className="text-xs">
                    Course Level
                  </SelectItem>
                  <SelectItem value="semester" className="text-xs">
                    Semester
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid of Resources */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-card animate-pulse border border-border"
                />
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

          {data && (
            <ResourcePagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </main>
    </div>
  );
}
