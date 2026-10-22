import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export type ReportStatus = "pending" | "resolved" | "dismissed" | "all";
export type ReportAction = "dismiss" | "remove";

interface ReportTargetResource {
  _id: string;
  title: string;
  category: string;
  status: string;
  fileUrl: string;
  courseId?: { _id: string; courseCode: string; title: string };
}

interface ReportTargetReview {
  _id: string;
  courseCode: string;
  content: string;
  authorAlias: string;
  lecturer?: { _id: string; name: string };
}

export interface AdminReport {
  _id: string;
  targetType: "resource" | "review";
  targetId: string;
  targetLabel: string;
  targetContext: string;
  target: ReportTargetResource | ReportTargetReview | null;
  reporterId: { _id: string; name: string; email: string };
  reason: string;
  details?: string;
  status: Exclude<ReportStatus, "all">;
  resolutionNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface ReportsResponse {
  success: boolean;
  count: number;
  data: AdminReport[];
}

export const useAdminReports = (status: ReportStatus) => {
  return useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: async (): Promise<AdminReport[]> => {
      const { data } = await axiosClient.get<ReportsResponse>("/admin/reports", {
        params: { status },
      });
      return data.data;
    },
  });
};

export const useReviewReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: ReportAction }) => {
      const { data } = await axiosClient.patch(`/admin/reports/${id}`, { action });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      if (variables.action === "remove") {
        queryClient.invalidateQueries({ queryKey: ["resources"] });
        queryClient.invalidateQueries({ queryKey: ["lecturer"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    },
  });
};
