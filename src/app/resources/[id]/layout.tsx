import type { Metadata } from "next";
import {
  getPublicOrigin,
  getShareResource,
  truncateDescription,
  type ShareResource,
} from "@/lib/shareMetadata";

type LayoutProps = { children: React.ReactNode; params: Promise<{ id: string }> };

function getCourse(resource: ShareResource) {
  return typeof resource.courseId === "object" && resource.courseId
    ? resource.courseId
    : undefined;
}

function getLecturer(resource: ShareResource) {
  return typeof resource.lecturerId === "object" && resource.lecturerId
    ? resource.lecturerId
    : undefined;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const [resource, origin] = await Promise.all([getShareResource(id), getPublicOrigin()]);
  const path = `/resources/${id}`;
  const title = resource?.title || "Course Resource";
  const course = resource ? getCourse(resource) : undefined;
  const lecturer = resource ? getLecturer(resource) : undefined;
  const details = [
    resource?.category,
    course?.courseCode,
    course?.title,
    lecturer?.name ? `Lecturer: ${lecturer.name}` : undefined,
    resource?.session ? `Session: ${resource.session}` : undefined,
    resource?.aiSummary,
  ].filter(Boolean).join(" · ");
  const description = truncateDescription(
    details || "View and share this LAUTECH course material, study resource, or past question.",
  );
  const absoluteUrl = `${origin}${path}`;
  const imageUrl = `${absoluteUrl}/opengraph-image`;

  return {
    title: `${title}${course?.courseCode ? ` | ${course.courseCode}` : ""} | LAUTECH Resources`,
    description,
    keywords: [
      "LAUTECH",
      "course material",
      "study resource",
      resource?.category,
      course?.courseCode,
      course?.title,
      ...(resource?.keywords || []),
    ].filter((keyword): keyword is string => Boolean(keyword)),
    alternates: { canonical: absoluteUrl },
    openGraph: {
      type: "article",
      url: absoluteUrl,
      siteName: "LAUTECH Resources",
      title: `${title}${course?.courseCode ? ` (${course.courseCode})` : ""}`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${title} course resource` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title}${course?.courseCode ? ` (${course.courseCode})` : ""}`,
      description,
      images: [{ url: imageUrl, alt: `${title} course resource` }],
    },
  };
}

export default function ResourceLayout({ children }: LayoutProps) {
  return children;
}
