import type { Resource } from "@/types/resource";

type DownloadResource = Pick<Resource, "title" | "fileUrl" | "fileFormat" | "courseId">;

interface DownloadFile {
  name: string;
  bytes: Uint8Array;
}

const extensionForFormat = (format: string, url: string) => {
  const mimeExtensions: Record<string, string> = {
    "application/pdf": "pdf",
    "application/zip": "zip",
    "application/x-rar-compressed": "rar",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
  };
  if (mimeExtensions[format.toLowerCase()]) return mimeExtensions[format.toLowerCase()];

  try {
    const extension = new URL(url).pathname.split("/").pop()?.split(".").pop();
    if (extension && /^[a-z0-9]{1,8}$/i.test(extension)) return extension.toLowerCase();
  } catch {
    // Fall through to the generic extension.
  }
  return "file";
};

const safeName = (value: string) =>
  value
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "resource";

const makeFileName = (resource: DownloadResource, index: number) => {
  const courseCode = resource.courseId?.courseCode;
  const label = courseCode ? `${courseCode} - ${resource.title}` : resource.title;
  const extension = extensionForFormat(resource.fileFormat || "", resource.fileUrl);
  return `${String(index + 1).padStart(2, "0")} - ${safeName(label)}.${extension}`;
};

const fetchFiles = async (
  resources: DownloadResource[],
  onProgress: (completed: number, total: number) => void,
) => {
  const files: DownloadFile[] = [];
  for (const [index, resource] of resources.entries()) {
    const response = await fetch(resource.fileUrl, { mode: "cors" });
    if (!response.ok) throw new Error(`Could not download “${resource.title}”`);
    files.push({ name: makeFileName(resource, index), bytes: new Uint8Array(await response.arrayBuffer()) });
    onProgress(index + 1, resources.length);
  }
  return files;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[n] = value >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const createStoredZip = (files: DownloadFile[]) => {
  const encoder = new TextEncoder();
  const date = new Date();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const entries = files.map((file) => ({ ...file, nameBytes: encoder.encode(file.name), crc: crc32(file.bytes) }));
  const localSize = entries.reduce((size, entry) => size + 30 + entry.nameBytes.length + entry.bytes.length, 0);
  const centralSize = entries.reduce((size, entry) => size + 46 + entry.nameBytes.length, 0);
  const totalSize = localSize + centralSize + 22;
  if (entries.length > 0xffff || totalSize > 0xffffffff || entries.some((entry) => entry.bytes.length > 0xffffffff)) {
    throw new Error("This list is too large to package as a ZIP file.");
  }

  const archive = new Uint8Array(totalSize);
  const view = new DataView(archive.buffer);
  let localOffset = 0;
  let centralOffset = localSize;

  for (const entry of entries) {
    const localStart = localOffset;
    view.setUint32(localOffset, 0x04034b50, true);
    view.setUint16(localOffset + 4, 20, true);
    view.setUint16(localOffset + 6, 0x0800, true);
    view.setUint16(localOffset + 8, 0, true);
    view.setUint16(localOffset + 10, dosTime, true);
    view.setUint16(localOffset + 12, dosDate, true);
    view.setUint32(localOffset + 14, entry.crc, true);
    view.setUint32(localOffset + 18, entry.bytes.length, true);
    view.setUint32(localOffset + 22, entry.bytes.length, true);
    view.setUint16(localOffset + 26, entry.nameBytes.length, true);
    view.setUint16(localOffset + 28, 0, true);
    archive.set(entry.nameBytes, localOffset + 30);
    archive.set(entry.bytes, localOffset + 30 + entry.nameBytes.length);
    localOffset += 30 + entry.nameBytes.length + entry.bytes.length;

    view.setUint32(centralOffset, 0x02014b50, true);
    view.setUint16(centralOffset + 4, 20, true);
    view.setUint16(centralOffset + 6, 20, true);
    view.setUint16(centralOffset + 8, 0x0800, true);
    view.setUint16(centralOffset + 10, 0, true);
    view.setUint16(centralOffset + 12, dosTime, true);
    view.setUint16(centralOffset + 14, dosDate, true);
    view.setUint32(centralOffset + 16, entry.crc, true);
    view.setUint32(centralOffset + 20, entry.bytes.length, true);
    view.setUint32(centralOffset + 24, entry.bytes.length, true);
    view.setUint16(centralOffset + 28, entry.nameBytes.length, true);
    view.setUint16(centralOffset + 30, 0, true);
    view.setUint16(centralOffset + 32, 0, true);
    view.setUint16(centralOffset + 34, 0, true);
    view.setUint16(centralOffset + 36, 0, true);
    view.setUint32(centralOffset + 38, 0, true);
    view.setUint32(centralOffset + 42, localStart, true);
    archive.set(entry.nameBytes, centralOffset + 46);
    centralOffset += 46 + entry.nameBytes.length;
  }

  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true);
  view.setUint16(centralOffset + 6, 0, true);
  view.setUint16(centralOffset + 8, entries.length, true);
  view.setUint16(centralOffset + 10, entries.length, true);
  view.setUint32(centralOffset + 12, centralSize, true);
  view.setUint32(centralOffset + 16, localSize, true);
  view.setUint16(centralOffset + 20, 0, true);
  return archive;
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export async function downloadResourceList(
  resources: DownloadResource[],
  listName: string,
  format: "zip" | "files",
  onProgress: (completed: number, total: number) => void,
) {
  if (resources.length === 0) throw new Error("This list has no resources to download.");

  if (format === "files") {
    for (const [index, resource] of resources.entries()) {
      const response = await fetch(resource.fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error(`Could not download “${resource.title}”`);
      triggerDownload(await response.blob(), makeFileName(resource, index));
      onProgress(index + 1, resources.length);
      if (index < resources.length - 1) await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
    }
    return;
  }

  const files = await fetchFiles(resources, onProgress);
  triggerDownload(new Blob([createStoredZip(files)], { type: "application/zip" }), `${safeName(listName)}.zip`);
}
