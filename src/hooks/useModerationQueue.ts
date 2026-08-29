import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export interface PendingResource {
  _id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileFormat: string;
  fileSize: number;
  aiSummary: string;
  aiConfidenceScore: number;
  keywords: string[];
  createdAt: string;
  courseId: { _id: string; courseCode: string; title: string };
  lecturerId: { _id: string; name: string };
  uploaderId: { _id: string; name: string; email: string };
}

interface QueueResponse {
  success: boolean;
  count: number;
  data: PendingResource[];
}

export const useModerationQueue = () => {
  return useQuery({
    queryKey: ["admin", "moderationQueue"],
    queryFn: async (): Promise<PendingResource[]> => {
      const { data } = await axiosClient.get<QueueResponse>(
        "/admin/resources/pending",
      );
      return data.data;
    },
  });
};

export const useApproveResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosClient.put(`/admin/resources/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moderationQueue"] });
    },
  });
};

export const useRejectResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await axiosClient.put(`/admin/resources/${id}/reject`, {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moderationQueue"] });
    },
  });
};
