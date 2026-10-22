import { ImageResponse } from "next/og";
import { getShareResource } from "@/lib/shareMetadata";

export const alt = "LAUTECH course resource preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getShareResource(id);
  const course = typeof resource?.courseId === "object" ? resource.courseId : undefined;
  const title = (resource?.title || "Course Resource").slice(0, 100);
  const subtitle = [course?.courseCode, course?.title, resource?.category]
    .filter(Boolean)
    .join("  ·  ") || "Study materials from LAUTECH students";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#f8fafc",
          background: "linear-gradient(135deg, #052e24 0%, #047857 58%, #10b981 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 700 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff22", border: "1px solid #ffffff55" }}>LR</div>
          LAUTECH RESOURCES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1040 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#a7f3d0" }}>Course material</div>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.12 }}>{title}</div>
          <div style={{ fontSize: 30, color: "#d1fae5" }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 22, color: "#d1fae5" }}>Study together. Share knowledge.</div>
      </div>
    ),
    size,
  );
}
