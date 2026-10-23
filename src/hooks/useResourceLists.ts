import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import type { Resource } from "@/types/resource";
import { toast } from "@/components/ui/toast";

export interface ResourceList {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerId: string | { _id: string; name: string } | null;
  resources: Resource[];
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  success: boolean;
  data: ResourceList;
}

interface ListsResponse {
  success: boolean;
  count: number;
  data: ResourceList[];
}

const mineKey = (userId?: string) => ["resource-lists", "mine", userId] as const;
const oneMineKey = (userId?: string, listId?: string) => [...mineKey(userId), listId] as const;

export function useMyResourceLists(userId?: string) {
  return useQuery({
    queryKey: mineKey(userId),
    queryFn: async () => {
      const { data } = await axiosClient.get<ListsResponse>("/lists/mine");
      return data.data;
    },
    enabled: Boolean(userId),
  });
}

export function useMyResourceList(userId?: string, listId?: string) {
  return useQuery({
    queryKey: oneMineKey(userId, listId),
    queryFn: async () => {
      const { data } = await axiosClient.get<ListResponse>(`/lists/mine/${listId}`);
      return data.data;
    },
    enabled: Boolean(userId && listId),
  });
}

export function usePublicResourceList(listId?: string) {
  return useQuery({
    queryKey: ["resource-lists", "public", listId],
    queryFn: async () => {
      const { data } = await axiosClient.get<ListResponse>(`/lists/public/${listId}`);
      return data.data;
    },
    enabled: Boolean(listId),
    retry: false,
  });
}

export function useCreateResourceList(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; isPublic: boolean; resourceIds: string[] }) => {
      const { data } = await axiosClient.post<ListResponse>("/lists", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mineKey(userId) });
      toast.add({ title: "List created", description: "Your resource list is ready.", type: "success" });
    },
    onError: () => toast.add({ title: "Could not create list", description: "Please try again.", type: "error" }),
  });
}

export function useUpdateResourceList(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; isPublic?: boolean }) => {
      const { data } = await axiosClient.patch<ListResponse>(`/lists/${id}`, updates);
      return data.data;
    },
    onSuccess: (list) => {
      queryClient.setQueryData(oneMineKey(userId, list._id), list);
      queryClient.invalidateQueries({ queryKey: mineKey(userId) });
      queryClient.invalidateQueries({ queryKey: ["resource-lists", "public", list._id] });
      toast.add({ title: "List updated", type: "success" });
    },
    onError: () => toast.add({ title: "Could not update list", description: "Please try again.", type: "error" }),
  });
}

export function useDeleteResourceList(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosClient.delete(`/lists/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: mineKey(userId) });
      queryClient.removeQueries({ queryKey: oneMineKey(userId, id) });
      queryClient.removeQueries({ queryKey: ["resource-lists", "public", id] });
      toast.add({ title: "List deleted", type: "success" });
    },
    onError: () => toast.add({ title: "Could not delete list", description: "Please try again.", type: "error" }),
  });
}

export function useAddResourceToList(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, resourceId }: { listId: string; resourceId: string }) => {
      const { data } = await axiosClient.post<ListResponse>(`/lists/${listId}/resources/${resourceId}`);
      return data.data;
    },
    onSuccess: (list) => {
      queryClient.setQueryData(oneMineKey(userId, list._id), list);
      queryClient.invalidateQueries({ queryKey: mineKey(userId) });
      queryClient.invalidateQueries({ queryKey: ["resource-lists", "public", list._id] });
      toast.add({ title: "Resource saved", description: `Added to “${list.name}”.`, type: "success" });
    },
    onError: () => toast.add({ title: "Could not save resource", description: "Please try again.", type: "error" }),
  });
}

export function useRemoveResourceFromList(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, resourceId }: { listId: string; resourceId: string }) => {
      const { data } = await axiosClient.delete<ListResponse>(`/lists/${listId}/resources/${resourceId}`);
      return data.data;
    },
    onSuccess: (list) => {
      queryClient.setQueryData(oneMineKey(userId, list._id), list);
      queryClient.invalidateQueries({ queryKey: mineKey(userId) });
      queryClient.invalidateQueries({ queryKey: ["resource-lists", "public", list._id] });
      toast.add({ title: "Resource removed from list", type: "success" });
    },
    onError: () => toast.add({ title: "Could not remove resource", description: "Please try again.", type: "error" }),
  });
}
