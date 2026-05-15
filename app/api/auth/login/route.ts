import { db } from "@/db";
import { users } from "@/db/schema";
import { LoginSchema } from "@/lib/definitions";
import { createSession } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

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

    const { email, password } = parsed.data;

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return jsonError("Invalid email or password", 401);
    }

    // Create session
    await createSession(user.id);

    return jsonSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Internal server error", 500);
  }
}
