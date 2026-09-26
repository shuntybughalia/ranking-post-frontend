export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Load Mongo helpers first so DNS overrides apply before any DB call.
      await import("./lib/mongodb");
      const { ensureSuperAdmin } = await import("./lib/users");
      await ensureSuperAdmin();
    } catch (error) {
      console.error("Failed to ensure super admin on startup:", error);
    }
  }
}
