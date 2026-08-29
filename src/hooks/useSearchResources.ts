import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { SearchResponse } from "@/types/resource";

interface UseSearchOptions {
  q?: string;
  category?: string;
  courseId?: string;
  page?: number;
}

export const useSearchResources = (filters: UseSearchOptions) => {
  return useQuery({
    queryKey: ["resources", "search", filters],
    queryFn: async () => {
      const { data } = await axiosClient.get<SearchResponse>(
        "/resources/search",
        {
          params: {
            ...filters,
            limit: 12,
          },
        },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
};
