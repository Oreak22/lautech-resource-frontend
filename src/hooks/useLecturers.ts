import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/lib/api/axiosClient';

export interface LecturerDirectoryItem {
  _id: string;
  name: string; // Includes the prefix title (e.g., "Prof. Obe")
  department: string;
  isVerified: boolean;
}

interface LecturersResponse {
  success: boolean;
  count: number;
  data: LecturerDirectoryItem[];
}

export const useLecturers = (search: string, sortBy: string, department: string) => {
  return useQuery({
    queryKey: ['lecturers', search, sortBy, department], 
    queryFn: async (): Promise<LecturerDirectoryItem[]> => {
      const { data } = await axiosClient.get<LecturersResponse>('/lecturers', {
        params: {
          search: search || undefined,
          sortBy: sortBy !== 'title' ? sortBy : undefined,
          department: department !== 'All' ? department : undefined,
        }
      });
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};