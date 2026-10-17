import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api-handler";
import { getStoredImage } from "@/lib/image-storage";

interface ImageRouteProps {
  params: Promise<{ id: string }>;
}

/** Serves an uploaded image. Ids are content hashes, so responses never change. */
async function handleGET(_request: Request, { params }: ImageRouteProps) {
  const { id } = await params;
  const image = await getStoredImage(id);

  if (!image) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const GET = withApiErrors(handleGET);
