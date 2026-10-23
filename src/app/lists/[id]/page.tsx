"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ShareMenu } from "@/components/share/ShareMenu";
import { DownloadResourceListButton } from "@/components/resources/DownloadResourceListButton";
import { usePublicResourceList } from "@/hooks/useResourceLists";

export default function PublicResourceListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: list, isLoading, isError } = usePublicResourceList(id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl space-y-7">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Resource directory
          </Link>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : isError || !list ? (
            <VerifiedCard className="mx-auto max-w-xl border-border p-8 text-center">
              <BookOpen className="mx-auto h-9 w-9 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-semibold text-foreground">This list isn’t available</h1>
              <p className="mt-2 text-sm text-muted-foreground">It may be private, deleted, or the link may be incorrect.</p>
              <Button asChild className="mt-5"><Link href="/resources">Browse resources</Link></Button>
            </VerifiedCard>
          ) : (
            <>
              <VerifiedCard className="border-border p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">Public resource list</p>
                    <h1 className="mt-1 break-words text-3xl font-bold text-foreground">{list.name}</h1>
                    {list.description && <p className="mt-3 max-w-3xl whitespace-pre-wrap text-muted-foreground">{list.description}</p>}
                    <p className="mt-4 text-sm text-muted-foreground">
                      Curated by {list.ownerId && typeof list.ownerId === "object" ? list.ownerId.name : "a LAUTECH student"} · {list.resources.length} resources
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {list.resources.length > 0 && <DownloadResourceListButton resources={list.resources} listName={list.name} />}
                    <ShareMenu
                      path={`/lists/${list._id}`}
                      title={`${list.name} | LAUTECH Resources`}
                      description={list.description || `${list.resources.length} resources curated for LAUTECH students`}
                      size="sm"
                      label="Share list"
                      className="gap-2"
                    />
                  </div>
                </div>
              </VerifiedCard>

              {list.resources.length === 0 ? (
                <VerifiedCard className="border-dashed border-border p-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h2 className="mt-3 font-semibold text-foreground">This list is empty</h2>
                  <p className="mt-1 text-sm text-muted-foreground">The list owner has not added any resources yet.</p>
                </VerifiedCard>
              ) : (
                <section aria-label={`${list.name} resources`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.resources.map((resource) => <ResourceCard key={resource._id} resource={resource} />)}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
