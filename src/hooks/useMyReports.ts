import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export interface MyReport {
  _id: string;
  targetType: "resource" | "review";
  targetLabel: string;
  targetContext: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  resolutionNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface MyReportsResponse {
  success: boolean;
  count: number;
  data: MyReport[];
}

export const useMyReports = (userId?: string) =>
  useQuery({
    queryKey: ["reports", "mine", userId],
    queryFn: async (): Promise<MyReport[]> => {
      const { data } = await axiosClient.get<MyReportsResponse>("/reports/mine");
      return data.data;
    },
    enabled: Boolean(userId),
  });
