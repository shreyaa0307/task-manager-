import { db } from "./db";
import { tasks } from "./db/schema";
import { eq, desc } from "drizzle-orm";

async function test() {
    const query = db.select().from(tasks).orderBy(desc(tasks.completedAt)).toSQL();
    console.log("SQL:", query);
}

test();
