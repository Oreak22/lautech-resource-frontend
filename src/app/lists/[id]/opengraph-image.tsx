import { ImageResponse } from "next/og";
import { getSharePublicResourceList } from "@/lib/shareMetadata";

export const alt = "Shared LAUTECH resource list";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getSharePublicResourceList(id);
  const name = (list?.name || "Shared LAUTECH Resource List").slice(0, 90);
  const owner = list?.ownerId && typeof list.ownerId === "object" ? list.ownerId.name : undefined;
  const resourceCount = list?.resources?.length || 0;

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
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#a7f3d0" }}>Shared study list</div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.12 }}>{name}</div>
          <div style={{ fontSize: 30, color: "#d1fae5" }}>{resourceCount} saved resources{owner ? ` · Curated by ${owner}` : ""}</div>
          {list?.description && <div style={{ fontSize: 22, color: "#ecfdf5" }}>{list.description.slice(0, 100)}</div>}
        </div>
        <div style={{ fontSize: 22, color: "#d1fae5" }}>Open the list to explore its course materials.</div>
      </div>
    ),
    size,
  );
}
