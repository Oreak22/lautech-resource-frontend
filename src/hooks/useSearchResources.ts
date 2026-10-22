import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { SearchResponse } from "@/types/resource";

interface UseSearchOptions {
  q?: string;
  category?: string;
  department?: string;
  level?: string;
  semester?: "first" | "second";
  sortBy?: "newest" | "department" | "level" | "semester";
  courseId?: string;
  page?: number;
  enabled?: boolean;
}

export const useSearchResources = (filters: UseSearchOptions) => {
  const { enabled = true, ...searchFilters } = filters;

  return useQuery({
    queryKey: ["resources", "search", filters],
    queryFn: async () => {
      const { data } = await axiosClient.get<SearchResponse>(
        "/resources/search",
        {
          params: {
            ...searchFilters,
            limit: 12,
          },
        },
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    enabled,
  });
};
