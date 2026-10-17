const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;
const SMALL_ENOUGH_BYTES = 400 * 1024;

/**
 * Downscales photos in the browser (max 1600px, WebP) so uploads stay well
 * under hosting request limits and posts save quickly. GIFs keep their animation.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SMALL_ENOUGH_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );

  // Browsers without WebP encoding fall back to PNG, which can be larger.
  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === "image/webp" ? "webp" : "png";
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + `.${extension}`, {
    type: blob.type,
  });
}
