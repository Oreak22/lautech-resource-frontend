import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { useAuthStore, type User } from "@/store/useAuthStore";

export interface ProfileUpdates {
  name: string;
  matricNumber: string;
  phone: string;
  department: string;
  faculty: string;
  currentLevel: string;
  bio: string;
}

interface ProfileResponse {
  success: boolean;
  data: User;
}

export const useMyProfile = (userId?: string) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<User> => {
      const { data } = await axiosClient.get<ProfileResponse>("/auth/profile");
      return data.data;
    },
    enabled: Boolean(userId),
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdates): Promise<User> => {
      const { data } = await axiosClient.patch<ProfileResponse>(
        "/auth/profile",
        updates,
      );
      return data.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile", userId], profile);
      if (token) setAuth(token, profile);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return { profileQuery, updateProfile };
};
