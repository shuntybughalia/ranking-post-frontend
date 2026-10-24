"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api-client";
import { MAX_BIO_CHARS } from "@/lib/profile";
import { UPLOAD_IMAGE_TYPES, uploadImageFile } from "@/lib/upload-image";
import GenderPicker from "@/app/components/ui/GenderPicker";
import UserAvatar from "@/app/components/ui/UserAvatar";
import { SESSION_CHANGED_EVENT } from "@/lib/session-events";
import { showToast } from "@/lib/toast";
import type { Gender } from "@/lib/types";

interface SettingsFormsProps {
  name: string;
  email: string;
  gender?: Gender;
  bio: string;
  avatarUrl: string;
}

interface ProfileFields {
  name: string;
  gender?: Gender;
  bio: string;
  avatarUrl: string;
}

const inputClass =
  "w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelClass = "mb-1.5 block text-sm font-medium text-navy";
const cardClass = "mt-6 rounded-2xl border border-border bg-white shadow-sm";

export default function SettingsForms({ email, ...initial }: SettingsFormsProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileFields>(initial);
  const [saved, setSaved] = useState<ProfileFields>(initial);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { name, gender, bio, avatarUrl } = profile;
  const dirty =
    name.trim() !== saved.name ||
    gender !== saved.gender ||
    bio.trim() !== saved.bio ||
    avatarUrl !== saved.avatarUrl;

  function update(fields: Partial<ProfileFields>) {
    setProfile((current) => ({ ...current, ...fields }));
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires a change event.
    e.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    const url = await uploadImageFile(file);
    setUploadingPhoto(false);
    if (url) update({ avatarUrl: url });
  }

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError("");
    if (!name.trim()) {
      setProfileError("Display name is required.");
      return;
    }

    if (bio.trim().length > MAX_BIO_CHARS) {
      setProfileError(`Bio must be ${MAX_BIO_CHARS} characters or fewer.`);
      return;
    }

    setSavingProfile(true);
    try {
      const data = await apiFetch<{ user: { name: string; gender?: Gender; avatarUrl?: string } }>(
        "/api/auth/profile",
        {
          method: "PATCH",
          json: { name: name.trim(), gender, bio: bio.trim(), avatarUrl },
          toastOnError: false,
        },
      );
      const next: ProfileFields = {
        name: data.user.name,
        gender: data.user.gender,
        bio: bio.trim(),
        avatarUrl: data.user.avatarUrl ?? "",
      };
      setProfile(next);
      setSaved(next);
      window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
      router.refresh();
      showToast("Profile updated.", "success");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== data.get("confirmPassword")) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiFetch("/api/auth/profile", {
        method: "PATCH",
        json: { currentPassword, newPassword },
        toastOnError: false,
      });
      form.reset();
      showToast("Password changed.", "success");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <form onSubmit={saveProfile} className={cardClass}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-ink">Profile</h2>
          <p className="text-sm text-muted">Your photo, bio, and the name shown as the author of new posts.</p>
        </div>
        <div className="space-y-5 px-6 py-6">
          <div>
            <p className={labelClass}>Profile photo</p>
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar gender={gender} src={avatarUrl || undefined} className="h-20 w-20" />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50 disabled:opacity-60"
                  >
                    {uploadingPhoto ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => update({ avatarUrl: "" })}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted">JPG, PNG, WebP or GIF, up to 4 MB.</p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept={UPLOAD_IMAGE_TYPES.join(",")}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
          <div>
            <p className={labelClass}>Avatar icon</p>
            <p className="mb-2 text-xs text-muted">Shown when you don&apos;t have a profile photo.</p>
            <GenderPicker value={gender} onChange={(value) => update({ gender: value })} />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>
              Display name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => update({ name: e.target.value })}
              maxLength={80}
              required
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="bio" className={labelClass}>
                Bio
              </label>
              <span className={`text-xs ${bio.trim().length > MAX_BIO_CHARS ? "text-red-600" : "text-muted"}`}>
                {bio.trim().length}/{MAX_BIO_CHARS}
              </span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={4}
              placeholder="A few words about you. Add links like https://yourwebsite.com"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">Links starting with https:// become clickable on your profile.</p>
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" value={email} disabled className={`${inputClass} bg-slate-50 text-muted`} />
            <p className="mt-1 text-xs text-muted">Contact support to change your email address.</p>
          </div>
          {profileError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{profileError}</p>}
        </div>
        <div className="flex justify-end border-t border-border bg-slate-50/60 px-6 py-4">
          <button
            type="submit"
            disabled={savingProfile || uploadingPhoto || !dirty}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink hover:opacity-90 disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className={cardClass}>
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-ink">Password</h2>
          <p className="text-sm text-muted">Use at least 6 characters.</p>
        </div>
        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="currentPassword" className={labelClass}>
              Current password
            </label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="newPassword" className={labelClass}>
              New password
            </label>
            <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm new password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </div>
          {passwordError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2">{passwordError}</p>
          )}
        </div>
        <div className="flex justify-end border-t border-border bg-slate-50/60 px-6 py-4">
          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </>
  );
}
