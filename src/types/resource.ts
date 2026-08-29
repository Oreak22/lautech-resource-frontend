export interface PopulatedCourse {
  _id: string;
  courseCode: string;
  title: string;
}

export interface PopulatedLecturer {
  _id: string;
  name: string;
}

export interface Resource {
  _id: string;
  title: string;
  category: "Past Question" | "Textbook" | "Handout" | "Project Report";
  fileUrl: string;
  fileFormat: string;
  fileSize: number;
  courseId: PopulatedCourse;
  lecturerId: PopulatedLecturer;
  status: "pending" | "approved" | "rejected";
  keywords: string[];
  createdAt: string;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Resource[];
}
