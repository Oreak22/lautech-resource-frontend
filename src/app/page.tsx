import type { Metadata } from "next";
import DirectoryPageClient from "@/app/DirectoryPageClient";
import { getPublicOrigin } from "@/lib/shareMetadata";

const title = "LAUTECH Resources | Course Materials, Past Questions & Notes";
const description =
  "Find LAUTECH course materials, verified past questions, lecture handouts, textbooks, and project reports. Search by course code, lecturer, or topic.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getPublicOrigin();
  const image = `${origin}/opengraph-image`;

  return {
    title,
    description,
    applicationName: "LAUTECH Resources",
    category: "education",
    keywords: [
      "LAUTECH resources",
      "LAUTECH past questions",
      "LAUTECH course materials",
      "lecture notes",
      "student study resources",
      "course handouts",
      "project reports",
      "LAUTECH lecturers",
    ],
    alternates: { canonical: origin },
    openGraph: {
      type: "website",
      url: origin,
      siteName: "LAUTECH Resources",
      locale: "en_NG",
      title,
      description,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: "LAUTECH Resources directory for course materials and study resources",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{
        url: image,
        alt: "Browse LAUTECH course materials, past questions, lecture notes, and project reports",
      }],
    },
  };
}

export default async function HomePage() {
  const origin = await getPublicOrigin();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LAUTECH Resources",
    url: origin,
    description,
    inLanguage: "en-NG",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <DirectoryPageClient />
    </>
  );
}
