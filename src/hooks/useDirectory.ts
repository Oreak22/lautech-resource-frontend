import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export interface DirectoryCourse {
  _id: string;
  courseCode: string;
  title: string;
}

export interface DirectoryLecturer {
  _id: string;
  name: string;
}

// Standard generic response wrapper for your Express backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ["directory", "courses"],
    queryFn: async (): Promise<DirectoryCourse[]> => {
      const { data } =
        await axiosClient.get<ApiResponse<DirectoryCourse[]>>("/courses");
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour to prevent redundant API calls
  });
};

export const useLecturers = () => {
  return useQuery({
    queryKey: ["directory", "lecturers"],
    queryFn: async (): Promise<DirectoryLecturer[]> => {
      const { data } =
        await axiosClient.get<ApiResponse<DirectoryLecturer[]>>("/lecturers");
      return data.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};
