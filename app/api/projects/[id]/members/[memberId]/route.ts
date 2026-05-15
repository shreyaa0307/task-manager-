import { db } from "@/db";
import { projectMembers } from "@/db/schema";
import {
  requireAuth,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// DELETE /api/projects/[id]/members/[memberId] — Remove member (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  // Only admins can remove members
  if (user!.role !== "admin") {
    return jsonError("Admin access required", 403);
  }

  const { id, memberId } = await params;

  try {
    const member = await db.query.projectMembers.findFirst({
      where: eq(projectMembers.id, memberId),
    });

    if (!member) {
      return jsonError("Member not found", 404);
    }

    // Can't remove yourself
    if (member.userId === user!.id) {
      return jsonError("Cannot remove yourself from the project", 400);
    }

    await db.delete(projectMembers).where(eq(projectMembers.id, memberId));

    return jsonSuccess({ message: "Member removed" });
  } catch (err) {
    console.error("Remove member error:", err);
    return jsonError("Internal server error", 500);
  }
}
