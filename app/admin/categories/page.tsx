import CategoriesManager from "../components/CategoriesManager";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy">Categories & Tags</h1>
          <p className="mt-1 text-sm text-muted">
            Manage blog categories and tags used across the platform.
          </p>
        </div>
        <CategoriesManager />
      </div>
    </>
  );
}
