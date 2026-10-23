"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Globe2, LockKeyhole, Pencil, Plus, Trash2, X } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareMenu } from "@/components/share/ShareMenu";
import { ResourcePagination } from "@/components/resources/ResourcePagination";
import { useSearchResources } from "@/hooks/useSearchResources";
import type { Resource } from "@/types/resource";
import {
  useCreateResourceList,
  useDeleteResourceList,
  useMyResourceLists,
  useUpdateResourceList,
} from "@/hooks/useResourceLists";
import type { ResourceList } from "@/hooks/useResourceLists";
import { useAuthStore } from "@/store/useAuthStore";

export default function ResourceListsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: lists = [], isLoading, isError, error: listsError } = useMyResourceLists(user?.id);
  const createList = useCreateResourceList(user?.id);
  const updateList = useUpdateResourceList(user?.id);
  const deleteList = useDeleteResourceList(user?.id);
  const [newName, setNewName] = useState("");
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState("private");
  const [resourceSearch, setResourceSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resourcePage, setResourcePage] = useState(1);
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [editingList, setEditingList] = useState<ResourceList | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState("private");
  const [deletingList, setDeletingList] = useState<ResourceList | null>(null);
  const { data: resourceResults, isLoading: resourcesLoading } = useSearchResources({
    q: searchQuery,
    page: resourcePage,
    enabled: createFormOpen,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(resourceSearch.trim());
      setResourcePage(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [resourceSearch]);

  const toggleResource = (resource: Resource) => {
    setSelectedResources((current) => current.some((item) => item._id === resource._id)
      ? current.filter((item) => item._id !== resource._id)
      : [...current, resource]);
  };

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createList.mutateAsync({
        name: newName.trim(),
        description: newDescription.trim(),
        isPublic: newVisibility === "public",
        resourceIds: selectedResources.map((resource) => resource._id),
      });
      setNewName("");
      setNewDescription("");
      setNewVisibility("private");
      setResourceSearch("");
      setSelectedResources([]);
      setCreateFormOpen(false);
    } catch {
      // Mutation hook displays an error toast.
    }
  };

  const beginEdit = (list: ResourceList) => {
    setEditingList(list);
    setEditName(list.name);
    setEditDescription(list.description || "");
    setEditVisibility(list.isPublic ? "public" : "private");
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingList) return;
    try {
      await updateList.mutateAsync({
        id: editingList._id,
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editVisibility === "public",
      });
      setEditingList(null);
    } catch {
      // Mutation hook displays an error toast.
    }
  };

  const confirmDelete = async () => {
    if (!deletingList) return;
    try {
      await deleteList.mutateAsync(deletingList._id);
      setDeletingList(null);
    } catch {
      // Keep the confirmation open so the user can retry.
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <VerifiedCard className="border-border p-8">
            <BookOpen className="mx-auto h-9 w-9 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Sign in to manage your lists</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create personal collections of course materials and share public lists.</p>
            <Button asChild className="mt-6"><Link href="/auth">Sign in</Link></Button>
          </VerifiedCard>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-7">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Student workspace</p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">Your resource lists</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Group resources into named collections for a course, exam, or study plan. Set each list to private or public.
              </p>
            </div>
            <Button type="button" variant={createFormOpen ? "outline" : "default"} className="shrink-0 gap-2" aria-expanded={createFormOpen} onClick={() => setCreateFormOpen((open) => !open)}>
              {createFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {createFormOpen ? "Hide form" : "Create a list"}
            </Button>
          </header>

          {createFormOpen && <VerifiedCard className="border-border p-5 sm:p-6">
            <form onSubmit={create} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
                <div className="space-y-2">
                  <Label htmlFor="new-resource-list-name">List name</Label>
                  <Input id="new-resource-list-name" minLength={2} maxLength={80} required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. CSE 301 exam prep" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-resource-list-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input id="new-resource-list-description" maxLength={300} value={newDescription} onChange={(event) => setNewDescription(event.target.value)} placeholder="What is this collection for?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-resource-list-visibility">Visibility</Label>
                  <select id="new-resource-list-visibility" value={newVisibility} onChange={(event) => setNewVisibility(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground">
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Selected resources</Label>
                  <p className="flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground">
                    {selectedResources.length} selected (choose at least 2)
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <Label htmlFor="new-list-resource-search">Add resources to this list</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Select at least two approved resources before creating the list.</p>
                  </div>
                  <Input id="new-list-resource-search" value={resourceSearch} onChange={(event) => setResourceSearch(event.target.value)} placeholder="Search resources or course codes" className="sm:max-w-sm" />
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {resourcesLoading ? (
                    <p className="py-5 text-center text-sm text-muted-foreground">Loading resources…</p>
                  ) : resourceResults?.data.length ? resourceResults.data.map((resource) => {
                    const selected = selectedResources.some((item) => item._id === resource._id);
                    return (
                      <label key={resource._id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleResource(resource)} className="mt-1 h-4 w-4 accent-primary" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">{resource.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{resource.courseId?.courseCode || "Course material"} · {resource.category}</span>
                        </span>
                      </label>
                    );
                  }) : (
                    <p className="py-5 text-center text-sm text-muted-foreground">No resources found. Try another search.</p>
                  )}
                </div>
                {resourceResults && <ResourcePagination currentPage={resourceResults.currentPage} totalPages={resourceResults.totalPages} onPageChange={setResourcePage} />}
                {selectedResources.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {selectedResources.map((resource) => (
                      <span key={resource._id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs text-primary">
                        <span className="max-w-52 truncate">{resource.courseId?.courseCode || resource.title}</span>
                        <button type="button" aria-label={`Remove ${resource.title} from selection`} onClick={() => toggleResource(resource)} className="rounded-full p-1 hover:bg-primary/10"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm ${selectedResources.length < 2 ? "text-muted-foreground" : "text-primary"}`} aria-live="polite">
                  {selectedResources.length < 2 ? `Select ${2 - selectedResources.length} more resource${selectedResources.length === 1 ? "" : "s"} to create a list.` : `${selectedResources.length} resources selected.`}
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={createList.isPending} onClick={() => setCreateFormOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createList.isPending || newName.trim().length < 2 || selectedResources.length < 2} className="gap-2">
                    <Plus className="h-4 w-4" /> {createList.isPending ? "Creating…" : "Create list"}
                  </Button>
                </div>
              </div>
            </form>
          </VerifiedCard>}

          {isError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{listsError instanceof Error ? listsError.message : "Could not load your lists. Refresh the page and try again."}</p>}
          {isLoading ? (
            <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
          ) : isError ? null : lists.length === 0 ? (
            <VerifiedCard className="border-dashed border-border p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-3 font-semibold text-foreground">No lists yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Create a named collection for your course materials, or save a resource from the directory to an existing list.</p>
              {!createFormOpen && <Button type="button" className="mt-5 gap-2" onClick={() => setCreateFormOpen(true)}><Plus className="h-4 w-4" /> Create a list</Button>}
            </VerifiedCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {lists.map((list) => (
                <VerifiedCard key={list._id} className="flex flex-col gap-4 border-border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/dashboard/lists/${list._id}`} className="break-words text-lg font-semibold text-foreground hover:text-primary">
                        {list.name}
                      </Link>
                      {list.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{list.description}</p>}
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${list.isPublic ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
                      {list.isPublic ? <Globe2 className="h-3 w-3" /> : <LockKeyhole className="h-3 w-3" />}
                      {list.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">{list.resources?.length || 0} resources</span>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {list.isPublic && <ShareMenu path={`/lists/${list._id}`} title={list.name} description={list.description || `${list.resources?.length || 0} LAUTECH course resources`} size="sm" label="Share" className="gap-2" />}
                      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => beginEdit(list)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                      <Button asChild size="sm"><Link href={`/dashboard/lists/${list._id}`}>Manage</Link></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${list.name}`} onClick={() => setDeletingList(list)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </VerifiedCard>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={Boolean(editingList)} onOpenChange={(open) => !updateList.isPending && !open && setEditingList(null)}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>Edit list details</DialogTitle>
            <DialogDescription>Change the name, description, or who can view this list.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="edit-list-name">List name</Label><Input id="edit-list-name" required minLength={2} maxLength={80} value={editName} onChange={(event) => setEditName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="edit-list-description">Description</Label><Input id="edit-list-description" maxLength={300} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="edit-list-visibility">Visibility</Label><select id="edit-list-visibility" value={editVisibility} onChange={(event) => setEditVisibility(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="private">Private — only me</option><option value="public">Public — anyone with the link</option></select></div>
            <DialogFooter><Button type="submit" disabled={updateList.isPending || editName.trim().length < 2}>{updateList.isPending ? "Saving…" : "Save changes"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingList)} onOpenChange={(open) => !deleteList.isPending && !open && setDeletingList(null)}>
        <DialogContent className="gap-5 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle>Delete this list?</DialogTitle>
            <DialogDescription>
              “{deletingList?.name}” and its public link will be deleted. The resources themselves will remain in the library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={deleteList.isPending} onClick={() => setDeletingList(null)}>Keep list</Button>
            <Button type="button" variant="destructive" disabled={deleteList.isPending} onClick={confirmDelete}>{deleteList.isPending ? "Deleting…" : "Delete list"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
