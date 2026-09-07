import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { Resource } from "@/types/resource";

export const useGetResource = (id: string) => {
  return useQuery({
    queryKey: ["resources", "detail", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ success: boolean; data: Resource }>(
        `/resources/${id}`
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
