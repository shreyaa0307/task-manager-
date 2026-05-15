import { db } from "@/db";
import { users } from "@/db/schema";
import { SignupSchema } from "@/lib/definitions";
import { createSession } from "@/lib/auth";
import { generateId, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const id = generateId();

    // Force all new signups through this route to be admins
    const assignedRole = "admin";

    await db.insert(users).values({
      id,
      name,
      email,
      passwordHash,
      role: assignedRole,
    });

    // Create session
    await createSession(id);

    return jsonSuccess({ id, name, email, role: assignedRole }, 201);
  } catch (error) {
    console.error("Signup error:", error);
    return jsonError("Internal server error", 500);
  }
}
