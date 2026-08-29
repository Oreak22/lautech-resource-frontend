import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import { Resource } from "@/types/resource";

export interface Review {
  _id: string;
  authorAlias: string;
  courseCode: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface LecturerProfile {
  _id: string;
  name: string;
  title: string;
  department: string;
  faculty: string;
  isVerified: boolean;
  resources: Resource[];
  reviews: Review[];
  teachingTags: string[];
}

interface ProfileResponse {
  success: boolean;
  data: LecturerProfile;
}

export const useLecturerProfile = (id: string) => {
  return useQuery({
    queryKey: ["lecturer", id],
    queryFn: async (): Promise<LecturerProfile> => {
      const { data } = await axiosClient.get<ProfileResponse>(
        `/lecturers/${id}/profile`,
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
