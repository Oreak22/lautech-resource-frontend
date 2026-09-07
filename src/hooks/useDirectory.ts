import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";

export interface DirectoryCourse {
  _id: string;
  courseCode: string;
  title: string;
  department: string;
}

export interface DirectoryDepartment {
  _id: string;
  name: string;
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
      console.log("Course data: ", data.data);
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
      console.log("Lecturer data: ", data.data);
      return data.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useAddLecturer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lecturerData: { name: string; departmentId: string, }) => {
      const { data } = await axiosClient.post<ApiResponse<string>>("/lecturers", lecturerData);
      console.log(data.data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory", "lecturers"] });
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ["directory", "departments"],
    queryFn: async (): Promise<DirectoryDepartment[]> => {
      const { data } =
        await axiosClient.get<ApiResponse<DirectoryDepartment[]>>("/departments");
        console.log(data)
      return data.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (departmentName: string) => {
      const { data } = await axiosClient.post<ApiResponse<DirectoryDepartment>>("/departments", {
        name: departmentName,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory", "departments"] });
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseData: { courseCode: string; title: string; department: string }) => {
      const { data } = await axiosClient.post<ApiResponse<DirectoryCourse>>("/courses", courseData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory", "courses"] });
    },
  });
};
