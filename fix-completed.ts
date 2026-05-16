import { db } from "./db";
import { tasks } from "./db/schema";
import { eq } from "drizzle-orm";

async function fixCompletedAt() {
    const now = new Date();
    await db.update(tasks)
      .set({ completedAt: now })
      .where(eq(tasks.status, "done"));
    console.log("Updated completedAt for done tasks");
}

fixCompletedAt();
