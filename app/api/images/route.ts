import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { EXT_BY_MIME, saveImage } from "@/lib/image-storage";
import { requireSession } from "@/lib/post-auth";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Uploads a featured image (multipart field "file") and returns its URL. */
async function handlePOST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to upload images." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file was uploaded." }, { status: 400 });
  }
  if (!EXT_BY_MIME[file.type]) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
  }

  const url = await saveImage(Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url }, { status: 201 });
}

export const POST = withApiErrors(handlePOST);
