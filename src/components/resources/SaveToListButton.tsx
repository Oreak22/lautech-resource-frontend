"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BookmarkPlus, Globe2, LockKeyhole, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { ResourcePagination } from "@/components/resources/ResourcePagination";
import { useSearchResources } from "@/hooks/useSearchResources";
import type { Resource } from "@/types/resource";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useAddResourceToList,
  useCreateResourceList,
  useMyResourceLists,
} from "@/hooks/useResourceLists";

export function SaveToListButton({ resourceId, resourceTitle }: { resourceId: string; resourceTitle: string }) {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourcePage, setResourcePage] = useState(1);
  const [additionalResources, setAdditionalResources] = useState<Resource[]>([]);
  const { data: lists = [], isLoading } = useMyResourceLists(user?.id);
  const { data: resourceResults, isLoading: resourcesLoading } = useSearchResources({
    q: resourceSearch,
    page: resourcePage,
    enabled: creating && open,
  });
  const addResource = useAddResourceToList(user?.id);
  const createList = useCreateResourceList(user?.id);
  const isSaving = addResource.isPending || createList.isPending;
  const selectedCount = 1 + additionalResources.length;

  const beginCreating = () => {
    setResourceSearch("");
    setResourcePage(1);
    setAdditionalResources([]);
    setCreating(true);
  };

  const toggleAdditionalResource = (resource: Resource) => {
    setAdditionalResources((current) => current.some((item) => item._id === resource._id)
      ? current.filter((item) => item._id !== resource._id)
      : [...current, resource]);
  };

  useEffect(() => {
    if (!selectedListId && lists.length > 0) setSelectedListId(lists[0]._id);
  }, [lists, selectedListId]);

  const openDialog = () => {
    if (!user) {
      toast.add({ title: "Sign in to save resources", description: "Create an account or sign in to keep your resource lists.", type: "warning" });
      return;
    }
    setOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (creating) {
        await createList.mutateAsync({
          name: name.trim(),
          isPublic,
          resourceIds: [resourceId, ...additionalResources.map((resource) => resource._id)],
        });
        setName("");
        setCreating(false);
        setAdditionalResources([]);
        setOpen(false);
        return;
      }
      if (!selectedListId) {
        beginCreating();
        return;
      }
      await addResource.mutateAsync({ listId: selectedListId, resourceId });
      setOpen(false);
    } catch {
      // Mutation hooks display an error toast; leave the dialog open for a retry.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSaving && setOpen(nextOpen)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-primary"
        aria-label={`Save ${resourceTitle} to a list`}
        title="Save to a list"
        onClick={openDialog}
      >
        <BookmarkPlus className="h-4 w-4" />
      </Button>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>{creating ? "Create a resource list" : "Save to a list"}</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {resourceTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {creating ? (
            <>
              <div className="space-y-2">
                <Label htmlFor={`new-list-name-${resourceId}`}>List name</Label>
                <Input
                  id={`new-list-name-${resourceId}`}
                  autoFocus
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="e.g. MTH 101 revision"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor={`new-list-resource-search-${resourceId}`}>Add at least one more resource</Label>
                  <p className="mt-1 text-xs text-muted-foreground">“{resourceTitle}” is already selected. Choose one or more additional resources.</p>
                </div>
                <Input
                  id={`new-list-resource-search-${resourceId}`}
                  value={resourceSearch}
                  onChange={(event) => { setResourceSearch(event.target.value); setResourcePage(1); }}
                  placeholder="Search resources or course codes"
                />
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {resourcesLoading ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Loading resources…</p>
                  ) : resourceResults?.data.filter((resource) => resource._id !== resourceId).length ? (
                    resourceResults.data.filter((resource) => resource._id !== resourceId).map((resource) => {
                      const selected = additionalResources.some((item) => item._id === resource._id);
                      return (
                        <label key={resource._id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleAdditionalResource(resource)} className="mt-1 h-4 w-4 accent-primary" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">{resource.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{resource.courseId?.courseCode || "Course material"} · {resource.category}</span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">No additional resources found. Try another search.</p>
                  )}
                </div>
                {resourceResults && <ResourcePagination currentPage={resourceResults.currentPage} totalPages={resourceResults.totalPages} onPageChange={setResourcePage} />}
                <p className="text-xs text-muted-foreground" aria-live="polite">{selectedCount} selected · at least 2 required</p>
                {additionalResources.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                    {additionalResources.map((resource) => (
                      <span key={resource._id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs text-primary">
                        <span className="max-w-40 truncate">{resource.courseId?.courseCode || resource.title}</span>
                        <button type="button" aria-label={`Remove ${resource.title} from selection`} onClick={() => toggleAdditionalResource(resource)} className="rounded-full p-1 hover:bg-primary/10"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`new-list-visibility-${resourceId}`}>Who can view this list?</Label>
                <select
                  id={`new-list-visibility-${resourceId}`}
                  value={isPublic ? "public" : "private"}
                  onChange={(event) => setIsPublic(event.target.value === "public")}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="private">Private — only me</option>
                  <option value="public">Public — anyone with the link</option>
                </select>
              </div>
            </>
          ) : isLoading ? (
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          ) : lists.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor={`save-to-list-${resourceId}`}>Choose a list</Label>
              <select
                id={`save-to-list-${resourceId}`}
                value={selectedListId}
                onChange={(event) => setSelectedListId(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                {lists.map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.name} · {list.isPublic ? "Public" : "Private"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Create your first named list to start saving resources.
            </div>
          )}

          {!creating && lists.length > 0 && !isLoading && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              onClick={beginCreating}
            >
              <Plus className="h-4 w-4" /> Create a new list
            </button>
          )}

          {creating && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isPublic ? <Globe2 className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
              {isPublic ? "Anyone with the link can view this list." : "Only you can view this list."}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {creating ? (
              <Button type="button" variant="ghost" disabled={isSaving} onClick={() => setCreating(false)}>
                Back to lists
              </Button>
            ) : <span />}
            <Button type="submit" disabled={isSaving || (creating && (name.trim().length < 2 || selectedCount < 2))}>
              {isSaving ? "Saving…" : creating ? "Create and save" : lists.length === 0 ? "Create a list" : "Save resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
