import { db } from "@/db";
import { projectMembers, users } from "@/db/schema";
import { InviteMemberSchema } from "@/lib/definitions";
import {
  requireAuth,
  generateId,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq, and } from "drizzle-orm";

// GET /api/projects/[id]/members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const members = await db.query.projectMembers.findMany({
    where: eq(projectMembers.projectId, id),
    with: {
      user: { columns: { id: true, name: true, email: true, role: true } },
    },
  });

  return jsonSuccess(members);
}

// POST /api/projects/[id]/members — Invite a member (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  // Only admins can invite members
  if (user!.role !== "admin") {
    return jsonError("Only admins can invite members", 403);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = InviteMemberSchema.safeParse(body);

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

    // Find user by email
    const invitee = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email),
    });

    if (!invitee) {
      return jsonError("User not found with this email", 404);
    }

    // Check if already a member
    const existing = await db.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, id),
        eq(projectMembers.userId, invitee.id)
      ),
    });

    if (existing) {
      return jsonError("User is already a member of this project", 409);
    }

    const memberId = generateId();
    await db.insert(projectMembers).values({
      id: memberId,
      projectId: id,
      userId: invitee.id,
    });

    const member = await db.query.projectMembers.findFirst({
      where: eq(projectMembers.id, memberId),
      with: {
        user: { columns: { id: true, name: true, email: true, role: true } },
      },
    });

    return jsonSuccess(member, 201);
  } catch (err) {
    console.error("Invite member error:", err);
    return jsonError("Internal server error", 500);
  }
}
