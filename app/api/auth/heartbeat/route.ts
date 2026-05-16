import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth, jsonSuccess, jsonError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function POST() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, user!.id));

    return jsonSuccess({ ok: true });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return jsonError("Internal server error", 500);
  }
}
