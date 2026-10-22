import { ImageResponse } from "next/og";
import { getShareLecturer } from "@/lib/shareMetadata";

export const alt = "LAUTECH lecturer profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lecturer = await getShareLecturer(id);
  const name = (lecturer?.name || "Lecturer Profile").slice(0, 100);
  const department = lecturer?.department || "LAUTECH Lecturer";
  const subtitle = `${department}${lecturer?.faculty ? ` · ${lecturer.faculty} Faculty` : ""}`;

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
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#a7f3d0" }}>Lecturer profile</div>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>{name}</div>
          <div style={{ fontSize: 30, color: "#d1fae5" }}>{subtitle}</div>
          <div style={{ fontSize: 22, color: "#ecfdf5" }}>
            {lecturer?.resources?.length || 0} course materials  ·  {lecturer?.reviews?.length || 0} student reviews
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#d1fae5" }}>Explore teaching resources and student feedback.</div>
      </div>
    ),
    size,
  );
}
