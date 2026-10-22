import type { Metadata } from "next";
import {
  getPublicOrigin,
  getShareLecturer,
  truncateDescription,
} from "@/lib/shareMetadata";

type LayoutProps = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const [lecturer, origin] = await Promise.all([getShareLecturer(id), getPublicOrigin()]);
  const path = `/lecturers/${id}`;
  const name = lecturer?.name || "Lecturer Profile";
  const details = [
    lecturer?.department ? `Department of ${lecturer.department}` : undefined,
    lecturer?.faculty ? `${lecturer.faculty} Faculty` : undefined,
    `${lecturer?.resources?.length || 0} approved course materials`,
    `${lecturer?.reviews?.length || 0} student reviews`,
    lecturer?.teachingTags?.length ? `Teaching areas: ${lecturer.teachingTags.join(", ")}` : undefined,
  ].filter(Boolean).join(" · ");
  const description = truncateDescription(
    `${name}'s lecturer profile on LAUTECH Resources. ${details || "Explore course materials and student reviews."}`,
  );
  const absoluteUrl = `${origin}${path}`;
  const imageUrl = `${absoluteUrl}/opengraph-image`;

  return {
    title: `${name} | Lecturer Profile | LAUTECH Resources`,
    description,
    keywords: ["LAUTECH", "lecturer", name, lecturer?.department, lecturer?.faculty, ...(lecturer?.teachingTags || [])]
      .filter((keyword): keyword is string => Boolean(keyword)),
    alternates: { canonical: absoluteUrl },
    openGraph: {
      type: "profile",
      url: absoluteUrl,
      siteName: "LAUTECH Resources",
      title: `${name} | LAUTECH Lecturer Profile`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name} lecturer profile` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | LAUTECH Lecturer Profile`,
      description,
      images: [{ url: imageUrl, alt: `${name} lecturer profile` }],
    },
  };
}

export default function LecturerLayout({ children }: LayoutProps) {
  return children;
}
