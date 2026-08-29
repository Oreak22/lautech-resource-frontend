"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { axiosClient } from "@/lib/api/axiosClient";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { useCourses, useLecturers } from "@/hooks/useDirectory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifiedCard } from "@/components/ui/verified-card";
import { Navbar } from "@/components/layouts/Navbar";

// Zod schema strictly requiring ObjectIds from the dropdowns
const uploadSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  courseId: z.string().min(1, "Please select a course"),
  courseTitle: z.string().optional(),
  category: z.string().min(2, "Category required"),
  lecturerId: z.string().min(1, "Please select a lecturer"),
  isAnonymous: z.boolean(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPortal() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"dropzone" | "processing" | "review">(
    "dropzone",
  );
  const [keywords, setKeywords] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: courses } = useCourses();
  const { data: lecturers } = useLecturers();

  const {
    register,
    control, // Added control for the Controller components
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { isAnonymous: false },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setStep("processing");
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const { data } = await axiosClient.post(
          "/resources/extract",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        const aiData = data.data;

        setValue("title", aiData.suggestedTitle || selectedFile.name);
        setValue("category", aiData.suggestedCategory || "Past Question");
        setKeywords(aiData.keywords || []);

        if (courses) {
          const matchedCourse = courses.find(
            (c) =>
              c.courseCode.toLowerCase() ===
              aiData.extractedCourseCode?.toLowerCase(),
          );
          if (matchedCourse) {
            setValue("courseId", matchedCourse._id);
            setValue("courseTitle", matchedCourse.title);
          }
        }

        if (lecturers) {
          const matchedLecturer = lecturers.find(
            (l) =>
              l.name.toLowerCase() ===
              aiData.extractedLecturerName?.toLowerCase(),
          );
          if (matchedLecturer) setValue("lecturerId", matchedLecturer._id);
        }

        setStep("review");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setErrorMsg(
          error.response?.data?.error ||
            "AI Analysis failed. Please try again.",
        );
        setStep("dropzone");
        setFile(null);
      }
    },
    [setValue, courses, lecturers],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/zip": [".zip"],
    },
  });

  const onSubmit: SubmitHandler<UploadFormValues> = async (data) => {
    if (!file) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", data.title);
    formData.append("category", data.category);
    // Use the correctly typed ObjectIds
    formData.append("courseId", data.courseId);
    formData.append("lecturerId", data.lecturerId);
    formData.append("keywords", JSON.stringify(keywords));
    formData.append("isAnonymous", String(data.isAnonymous));

    try {
      await axiosClient.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard/uploads?success=true");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(error.response?.data?.error || "Upload failed.");
      setIsSubmitting(false);
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    setKeywords(keywords.filter((_, i) => i !== indexToRemove));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Upload Academic Resource
            </h1>
            <p className="text-muted-foreground mt-2">
              Drag and drop your file. Our Gemini AI will automatically scan,
              verify, and fill in the document details.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {errorMsg}
            </div>
          )}

          {step === "dropzone" && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                {isDragActive
                  ? "Drop file here..."
                  : "Click or drag file to upload"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports PDF, JPG, PNG, and ZIP (Max 20MB)
              </p>
            </div>
          )}

          {step === "processing" && (
            <VerifiedCard className="p-12 text-center border border-border">
              <Loader2 className="mx-auto h-12 w-12 text-secondary animate-spin mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Gemini AI is analyzing your document...
              </h3>
              <p className="text-sm text-muted-foreground">
                Extracting keywords, verifying relevance, and generating
                metadata.
              </p>
            </VerifiedCard>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-primary">
                    File Analyzed by Gemini AI!
                  </h4>
                  <p className="text-xs text-primary/80 mt-1">
                    Review the extracted metadata below. You can edit any fields
                    if needed.
                  </p>
                </div>
              </div>

              <VerifiedCard className="p-6 border border-border">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file!.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("dropzone");
                      setFile(null);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Course Selection */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-mono uppercase text-muted-foreground">
                          Course Code
                        </label>
                        <span className="text-[10px] text-secondary flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                        </span>
                      </div>
                      <Controller
                        control={control}
                        name="courseId"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Select course..." />
                            </SelectTrigger>
                            <SelectContent>
                              {courses?.map((course) => (
                                <SelectItem key={course._id} value={course._id}>
                                  {course.courseCode} - {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.courseId && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.courseId.message}
                        </p>
                      )}
                    </div>

                    {/* Lecturer Selection */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-mono uppercase text-muted-foreground">
                          Lecturer
                        </label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                        >
                          + Add New
                        </button>
                      </div>
                      <Controller
                        control={control}
                        name="lecturerId"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Select lecturer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {lecturers?.map((lecturer) => (
                                <SelectItem
                                  key={lecturer._id}
                                  value={lecturer._id}
                                >
                                  {lecturer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.lecturerId && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.lecturerId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title and Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-mono uppercase text-muted-foreground">
                          Document Title
                        </label>
                        <span className="text-[10px] text-secondary flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Auto-filled
                        </span>
                      </div>
                      <Input {...register("title")} className="bg-background" />
                      {errors.title && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                        Category
                      </label>
                      <Input
                        {...register("category")}
                        className="bg-background"
                      />
                      {errors.category && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-mono uppercase text-muted-foreground">
                        AI Extracted Keywords
                      </label>
                      <span className="text-[10px] text-secondary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 min-h-[50px] rounded-md bg-background border border-border">
                      {keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 text-xs font-mono text-secondary bg-secondary/10 px-2 py-1 rounded-full border border-secondary/20"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(idx)}
                            className="hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border mt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("isAnonymous")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Post Anonymously
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your name will be hidden from public view.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2"
                      >
                        {isSubmitting
                          ? "Uploading..."
                          : "Confirm & Publish Resource"}
                        {!isSubmitting && <UploadCloud className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </form>
              </VerifiedCard>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
