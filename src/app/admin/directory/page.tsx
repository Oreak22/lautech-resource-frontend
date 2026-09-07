"use client";

import { useState } from "react";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDepartments,
  useCreateDepartment,
  useCourses,
  useCreateCourse,
  useAddLecturer,
} from "@/hooks/useDirectory";
import { BookOpen, FolderOpen, Plus, Loader2, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DirectoryControlPage() {
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const { data: courses, isLoading: coursesLoading } = useCourses();

  const createDeptMutation = useCreateDepartment();
  const createCourseMutation = useCreateCourse();
  const createLecturerMutation = useAddLecturer();

  const [newDeptName, setNewDeptName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDept, setCourseDept] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [lecturerDept, setLecturerDept] = useState<string | undefined>('');

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    createDeptMutation.mutate(newDeptName, {
      onSuccess: () => setNewDeptName(""),
    });
  };

  const handleCreateLecturer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerName.trim() || !lecturerDept?.trim()) return;
    createLecturerMutation.mutate({name:lecturerName, departmentId: lecturerDept, }, {
      onSuccess: () => setLecturerName(""),
    });
    console.log("Lecturer added successfully");
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseTitle.trim() || !courseDept.trim()) return;
    createCourseMutation.mutate(
      { courseCode, title: courseTitle, department: courseDept },
      {
        onSuccess: () => {
          setCourseCode("");
          setCourseTitle("");
          setCourseDept("");
        },
      }
    );
  };

  return (
    <div className="py-8 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Directory Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the university departments and courses available on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Departments Section */}
        <div className="space-y-6">
          <VerifiedCard className="p-6 border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FolderOpen className="h-5 w-5 text-primary" />
              Add Department
            </h2>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
                  Department Name
                </label>
                <Input
                  placeholder="e.g. Computer Science"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  disabled={createDeptMutation.isPending}
                />
              </div>
              <Button
                type="submit"
                disabled={createDeptMutation.isPending || !newDeptName.trim()}
                className="w-full gap-2"
              >
                {createDeptMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Department
              </Button>
              {createDeptMutation.isError && (
                <p className="text-xs text-destructive mt-2">Failed to create department.</p>
              )}
            </form>
          </VerifiedCard>

          <VerifiedCard className="p-6 border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Existing Departments
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {deptsLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
              ) : departments?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No departments found.</p>
              ) : (
                departments?.map((dept) => (
                  <div
                    key={dept._id}
                    className="p-3 bg-secondary/10 border border-secondary/20 rounded-md text-sm font-medium"
                  >
                    {dept.name}
                  </div>
                ))
              )}
            </div>
          </VerifiedCard>
        </div>
        {/* Lecturer section */}

        <div className="space-y-6">
          <VerifiedCard className="p-6 border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              Add Lecturer
            </h2>
            <form onSubmit={handleCreateLecturer} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
                  Lecturer Name
                </label>
                <Input
                  placeholder="e.g. John Doe"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  disabled={createLecturerMutation.isPending}
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Lecturer Department</label>
                <Select
                  value={lecturerDept}
                  onValueChange={(value) => setLecturerDept(value as string)}
                  disabled={createLecturerMutation.isPending}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={createLecturerMutation.isPending || !lecturerName.trim()}
                className="w-full gap-2"
              >
                {createLecturerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Lecturer
              </Button>
              {createLecturerMutation.isError && (
                <p className="text-xs text-destructive mt-2">Failed to create lecturer.</p>
              )}
            </form>
          </VerifiedCard>
        </div>

        {/* Courses Section */}
        <div className="space-y-6">
          <VerifiedCard className="p-6 border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-secondary" />
              Add Course
            </h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
                  Course Code
                </label>
                <Input
                  placeholder="e.g. CSE 301"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  disabled={createCourseMutation.isPending}
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
                  Course Title
                </label>
                <Input
                  placeholder="e.g. Introduction to Programming"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  disabled={createCourseMutation.isPending}
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">
                  Department
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={courseDept}
                  onChange={(e) => setCourseDept(e.target.value)}
                  disabled={createCourseMutation.isPending || deptsLoading}
                >
                  <option value="">Select a department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                disabled={
                  createCourseMutation.isPending ||
                  !courseCode.trim() ||
                  !courseTitle.trim() ||
                  !courseDept.trim()
                }
                className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {createCourseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Course
              </Button>
              {createCourseMutation.isError && (
                <p className="text-xs text-destructive mt-2">Failed to create course.</p>
              )}
            </form>
          </VerifiedCard>

          <VerifiedCard className="p-6 border-border">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Existing Courses
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {coursesLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
              ) : courses?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses found.</p>
              ) : (
                courses?.map((course) => (
                  <div
                    key={course._id}
                    className="p-3 bg-primary/10 border border-primary/20 rounded-md text-sm font-medium flex justify-between items-center"
                  >
                    <span>{course.title}</span>
                    <span className="font-mono text-xs font-bold">{course.courseCode}</span>
                  </div>
                ))
              )}
            </div>
          </VerifiedCard>
        </div>
      </div>
    </div>
  );
}
