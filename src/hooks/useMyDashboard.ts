import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { Resource } from "@/types/resource";
import { toast } from "@/components/ui/toast";

export interface MyDashboardReview {
  _id: string;
  lecturer: { _id: string; name: string };
  authorAlias: string;
  courseCode: string;
  content: string;
  createdAt: string;
}

interface MyDashboardData {
  resources: Resource[];
  reviews: MyDashboardReview[];
}

export const useMyDashboard = (userId?: string) =>
  useQuery({
    queryKey: ["dashboard", "activity", userId],
    queryFn: async (): Promise<MyDashboardData> => {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: MyDashboardData;
      }>("/dashboard");
      return data.data;
    },
    enabled: Boolean(userId),
  });

export const useDeleteMyResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resourceId: string) => {
      await axiosClient.delete(`/resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.add({
        title: "Resource removed",
        description: "Your uploaded resource has been taken down.",
        type: "success",
      });
    },
    onError: () => {
      toast.add({
        title: "Could not remove resource",
        description: "Please try again.",
        type: "error",
      });
    },
  });
};

export const useUpdateMyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await axiosClient.patch(`/reviews/${id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["lecturer"] });
      toast.add({
        title: "Review updated",
        description: "Your changes are now visible.",
        type: "success",
      });
    },
    onError: () => {
      toast.add({
        title: "Could not update review",
        description: "Please try again.",
        type: "error",
      });
    },
  });
};

export const useDeleteMyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      await axiosClient.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["lecturer"] });
      toast.add({
        title: "Review removed",
        description: "Your review has been taken down.",
        type: "success",
      });
    },
    onError: () => {
      toast.add({
        title: "Could not remove review",
        description: "Please try again.",
        type: "error",
      });
    },
  });
};
