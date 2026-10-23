import { apiFetch } from "./api-client";
import { showToast } from "./toast";

export const UPLOAD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Uploads an image file through /api/images (S3 when configured) and returns
 * its URL, or null after showing an error toast.
 */
export async function uploadImageFile(file: File): Promise<string | null> {
  if (!UPLOAD_IMAGE_TYPES.includes(file.type)) {
    showToast("Image must be JPEG, PNG, WebP, or GIF.", "error");
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    showToast("Image must be 4 MB or smaller.", "error");
    return null;
  }

  const body = new FormData();
  body.append("file", file);

  try {
    const { url } = await apiFetch<{ url: string }>("/api/images", { method: "POST", body });
    return url;
  } catch {
    // apiFetch already showed the error toast.
    return null;
  }
}
