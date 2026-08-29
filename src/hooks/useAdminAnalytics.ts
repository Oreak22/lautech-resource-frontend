import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export interface AdminAnalytics {
  totalResources: number;
  pendingResources: number;
  approvedResources: number;
  totalLecturers: number;
  verifiedLecturers: number;
  totalStudents: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: AdminAnalytics;
}

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async (): Promise<AdminAnalytics> => {
      const { data } =
        await axiosClient.get<AnalyticsResponse>("/admin/analytics");
      return data.data;
    },
  });
};
