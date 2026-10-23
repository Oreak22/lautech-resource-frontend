interface PdfImage {
  width: number;
  height: number;
  jpeg: Uint8Array<ArrayBuffer>;
}

type PdfBytes = Uint8Array<ArrayBuffer>;

const encoder = new TextEncoder();
const MAX_IMAGE_EDGE = 2400;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

function text(value: string): PdfBytes {
  return encoder.encode(value);
}

function joinBytes(parts: PdfBytes[]): PdfBytes {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

async function imageToJpeg(file: File): Promise<PdfImage> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error(`Could not prepare ${file.name} for conversion.`);

    // JPEG has no transparency channel, so blend transparent PNG pixels onto white.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error(`Could not convert ${file.name}.`))),
        "image/jpeg",
        0.88,
      );
    });

    return {
      width,
      height,
      jpeg: new Uint8Array(await jpegBlob.arrayBuffer()),
    };
  } finally {
    bitmap.close();
  }
}

function pageObjectIds(pageIndex: number) {
  const firstPageObjectId = 3 + pageIndex * 3;
  return {
    pageId: firstPageObjectId,
    imageId: firstPageObjectId + 1,
    contentId: firstPageObjectId + 2,
  };
}

function makePdf(images: PdfImage[]) {
  const header = new Uint8Array([
    ...text("%PDF-1.4\n%"),
    0xe2,
    0xe3,
    0xcf,
    0xd3,
    0x0a,
  ]);
  const objects: PdfBytes[] = [];
  const objectCount = 2 + images.length * 3;
  const offsets = new Array<number>(objectCount + 1).fill(0);
  let byteLength = header.length;

  const addObject = (id: number, body: PdfBytes[]) => {
    const object = joinBytes([
      text(`${id} 0 obj\n`),
      ...body,
      text("\nendobj\n"),
    ]);
    offsets[id] = byteLength;
    objects.push(object);
    byteLength += object.length;
  };

  const pageIds = images.map((_, index) => pageObjectIds(index).pageId);
  addObject(1, [text("<< /Type /Catalog /Pages 2 0 R >>")]);
  addObject(2, [text(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${images.length} >>`)]);

  images.forEach((image, index) => {
    const { pageId, imageId, contentId } = pageObjectIds(index);
    const margin = 36;
    const fit = Math.min(
      (PAGE_WIDTH - margin * 2) / image.width,
      (PAGE_HEIGHT - margin * 2) / image.height,
    );
    const drawWidth = image.width * fit;
    const drawHeight = image.height * fit;
    const x = (PAGE_WIDTH - drawWidth) / 2;
    const y = (PAGE_HEIGHT - drawHeight) / 2;
    const content = text(
      `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ`,
    );

    addObject(pageId, [text(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    )]);
    addObject(imageId, [
      text(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.jpeg.length} >>\nstream\n`),
      image.jpeg,
      text("\nendstream"),
    ]);
    addObject(contentId, [
      text(`<< /Length ${content.length} >>\nstream\n`),
      content,
      text("\nendstream"),
    ]);
  });

  const crossReferenceOffset = byteLength;
  const crossReference = ["xref", `0 ${objectCount + 1}`, "0000000000 65535 f "];
  for (let id = 1; id <= objectCount; id += 1) {
    crossReference.push(`${String(offsets[id]).padStart(10, "0")} 00000 n `);
  }
  const trailer = text(
    `${crossReference.join("\n")}\ntrailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`,
  );

  return new Blob([joinBytes([header, ...objects, trailer]).buffer], { type: "application/pdf" });
}

export async function convertImagesToPdf(files: File[]) {
  if (files.length === 0) throw new Error("Choose at least one JPG or PNG image.");
  if (files.length > 20) throw new Error("Choose no more than 20 images at a time.");
  if (files.some((file) => !["image/jpeg", "image/png"].includes(file.type))) {
    throw new Error("Only JPG and PNG images can be combined into a PDF.");
  }

  const images: PdfImage[] = [];
  for (const file of files) images.push(await imageToJpeg(file));
  return makePdf(images);
}
