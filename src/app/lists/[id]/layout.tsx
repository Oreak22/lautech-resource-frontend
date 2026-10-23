import type { Metadata } from "next";
import {
  getPublicOrigin,
  getSharePublicResourceList,
  truncateDescription,
} from "@/lib/shareMetadata";

type LayoutProps = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const [list, origin] = await Promise.all([
    getSharePublicResourceList(id),
    getPublicOrigin(),
  ]);
  const path = `/lists/${id}`;
  const name = list?.name || "Shared LAUTECH Resource List";
  const owner = list?.ownerId && typeof list.ownerId === "object" ? list.ownerId.name : undefined;
  const resourceNames = list?.resources
    ?.slice(0, 4)
    .map((resource) => [resource.courseId?.courseCode, resource.title].filter(Boolean).join(" — "))
    .filter(Boolean)
    .join(" · ");
  const description = truncateDescription(
    [
      list?.description,
      `${list?.resources?.length || 0} saved LAUTECH course resources`,
      owner ? `Curated by ${owner}` : undefined,
      resourceNames ? `Includes ${resourceNames}` : undefined,
    ].filter(Boolean).join(" · "),
  );
  const absoluteUrl = `${origin}${path}`;
  const imageUrl = `${absoluteUrl}/opengraph-image`;

  return {
    title: `${name} | LAUTECH Resources`,
    description,
    keywords: ["LAUTECH resources", "study playlist", "course materials", name, ...(list?.resources || []).map((resource) => resource.courseId?.courseCode || "")]
      .filter(Boolean),
    alternates: { canonical: absoluteUrl },
    openGraph: {
      type: "website",
      url: absoluteUrl,
      siteName: "LAUTECH Resources",
      title: `${name} | LAUTECH Study List`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${name}, a shared LAUTECH resource list` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | LAUTECH Study List`,
      description,
      images: [{ url: imageUrl, alt: `${name}, a shared LAUTECH resource list` }],
    },
  };
}

export default function PublicResourceListLayout({ children }: LayoutProps) {
  return children;
}
