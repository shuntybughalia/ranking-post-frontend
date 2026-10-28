import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import SettingsForms from "./SettingsForms";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/settings");

  // Bio and photo live on the stored user, not in the session cookie.
  const user = await getUserById(session.id);

  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <Link href="/profile" className="text-sm font-medium text-muted hover:text-gold-dark">
          ← Back to profile
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-ink md:text-3xl">Account settings</h1>
        <p className="mt-1 text-sm text-muted">Update how your name appears and keep your account secure.</p>

        <SettingsForms
          name={user?.name ?? session.name}
          email={session.email}
          gender={user?.gender ?? session.gender}
          bio={user?.bio ?? ""}
          avatarUrl={user?.avatarUrl ?? ""}
        />
      </div>
    </div>
  );
}
