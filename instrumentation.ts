export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureSuperAdmin } = await import("./lib/users");
      await ensureSuperAdmin();
    } catch (error) {
      console.error("Failed to ensure super admin on startup:", error);
    }
  }
}
