"use client";

import { ChangeEvent, useRef, useState } from "react";
import { showToast } from "@/lib/toast";
import { UPLOAD_IMAGE_TYPES, uploadImageFile } from "@/lib/upload-image";

interface ImageUploadButtonProps {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}

/** Uploads a picked image file through /api/images and hands back its URL. */
export default function ImageUploadButton({ onUploaded, disabled }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires a change event.
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    const url = await uploadImageFile(file);
    setUploading(false);

    if (url) {
      onUploaded(url);
      showToast("Image uploaded.", "success");
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50 disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload image"}
      </button>
    </>
  );
}
