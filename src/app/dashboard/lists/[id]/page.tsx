"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Globe2, LockKeyhole, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/share/ShareMenu";
import { DownloadResourceListButton } from "@/components/resources/DownloadResourceListButton";
import { useMyResourceList, useRemoveResourceFromList } from "@/hooks/useResourceLists";
import { useAuthStore } from "@/store/useAuthStore";

export default function ManageResourceListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);
  const { data: list, isLoading, isError, error } = useMyResourceList(user?.id, id);
  const removeResource = useRemoveResourceFromList(user?.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Link href="/dashboard/lists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Your lists
          </Link>

          {isLoading ? (
            <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
          ) : isError || !list ? (
            <VerifiedCard className="border-border p-8 text-center">
              <h1 className="text-xl font-semibold text-foreground">Could not open this list</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : "It may have been deleted or you may not have access."}</p>
            </VerifiedCard>
          ) : (
            <>
              <VerifiedCard className="border-border p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {list.isPublic ? <Globe2 className="h-4 w-4 text-primary" /> : <LockKeyhole className="h-4 w-4" />}
                      {list.isPublic ? "Public list" : "Private list"}
                    </div>
                    <h1 className="mt-2 break-words text-3xl font-bold text-foreground">{list.name}</h1>
                    {list.description && <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{list.description}</p>}
                    <p className="mt-3 text-sm text-muted-foreground">{list.resources.length} resources · Listed in the order you saved them</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.isPublic && <ShareMenu path={`/lists/${list._id}`} title={`${list.name} | LAUTECH Resources`} description={list.description || `${list.resources.length} saved course resources`} size="sm" label="Share list" className="gap-2" />}
                    {list.resources.length > 0 && <DownloadResourceListButton resources={list.resources} listName={list.name} />}
                    <Button asChild variant="outline" size="sm"><Link href="/dashboard/lists">Edit list settings</Link></Button>
                  </div>
                </div>
              </VerifiedCard>

              {list.resources.length === 0 ? (
                <VerifiedCard className="border-dashed border-border p-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h2 className="mt-3 font-semibold text-foreground">No resources saved here yet</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Browse the directory and use the bookmark button on a resource to add it.</p>
                  <Button asChild className="mt-4"><Link href="/resources">Browse resources</Link></Button>
                </VerifiedCard>
              ) : (
                <div className="space-y-3">
                  {list.resources.map((resource, index) => (
                    <VerifiedCard key={resource._id} className="flex flex-col gap-4 border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <Link href={`/resources/${resource._id}`} className="font-semibold text-foreground hover:text-primary">{resource.title}</Link>
                          <p className="mt-1 text-sm text-muted-foreground">{resource.courseId?.courseCode || "Course"} · {resource.category} · {resource.lecturerId?.name || "Lecturer not listed"}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button asChild variant="outline" size="sm"><Link href={`/resources/${resource._id}`}>Open resource</Link></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" aria-label={`Remove ${resource.title} from list`} disabled={removeResource.isPending} onClick={() => removeResource.mutate({ listId: list._id, resourceId: resource._id })}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </VerifiedCard>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
