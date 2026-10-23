import { headers } from "next/headers";

export interface ShareResource {
  title?: string;
  category?: string;
  session?: string;
  aiSummary?: string;
  keywords?: string[];
  courseId?: { courseCode?: string; title?: string } | string;
  lecturerId?: { name?: string } | string;
}

export interface ShareLecturer {
  name?: string;
  department?: string;
  faculty?: string;
  title?: string;
  isVerified?: boolean;
  resources?: unknown[];
  reviews?: unknown[];
  teachingTags?: string[];
}

export interface ShareResourceList {
  name?: string;
  description?: string;
  isPublic?: boolean;
  ownerId?: string | { name?: string } | null;
  resources?: Array<{ title?: string; category?: string; courseId?: { courseCode?: string } }>;
}

function apiUrl(path: string) {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000/api";
  const base = configured.replace(/\/+$/, "");
  return `${base.endsWith("/api") ? base : `${base}/api`}${path}`;
}

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(apiUrl(path), { cache: "no-store" });
    if (!response.ok) return null;
    const result = (await response.json()) as { data?: T };
    return result.data ?? null;
  } catch {
    return null;
  }
}

export const getShareResource = (id: string) =>
  fetchData<ShareResource>(`/resources/${encodeURIComponent(id)}`);

export const getShareLecturer = (id: string) =>
  fetchData<ShareLecturer>(`/lecturers/${encodeURIComponent(id)}/profile`);

export const getSharePublicResourceList = (id: string) =>
  fetchData<ShareResourceList>(`/lists/public/${encodeURIComponent(id)}`);

export async function getPublicOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return "http://localhost:3000";

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProtocol === "http" || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
      ? "http"
      : "https";
  return `${protocol}://${host}`;
}

export function truncateDescription(value: string, maxLength = 170) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}
