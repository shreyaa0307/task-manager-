import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin, generateId, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const CreateMemberSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().trim(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastActiveAt: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return jsonSuccess(allUsers);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = CreateMemberSchema.safeParse(body);

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

    const { name, email } = parsed.data;

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    // Common password for manually created members
    const passwordHash = await bcrypt.hash("Password1!", 10);
    const id = generateId();

    await db.insert(users).values({
      id,
      name,
      email,
      passwordHash,
      role: "member",
    });

    const newUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return jsonSuccess(newUser, 201);
  } catch (err) {
    console.error("Create member error:", err);
    return jsonError("Internal server error", 500);
  }
}
