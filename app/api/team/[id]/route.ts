import { db } from "@/db";
import { users, tasks, projectMembers, projects } from "@/db/schema";
import { requireAdmin, jsonError, jsonSuccess } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (adminUser!.id === id) {
    return jsonError("You cannot change your own role", 400);
  }

  try {
    const body = await request.json();
    const parsed = UpdateRoleSchema.safeParse(body);

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

    await db.update(users).set({ role: parsed.data.role }).where(eq(users.id, id));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return jsonSuccess(updatedUser);
  } catch (err) {
    console.error("Update role error:", err);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: adminUser } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (adminUser!.id === id) {
    return jsonError("You cannot delete your own account", 400);
  }

  try {
    // 1. Unassign tasks assigned to this user
    await db.update(tasks).set({ assigneeId: null }).where(eq(tasks.assigneeId, id));

    // 2. We keep the tasks they created but we could nullify creatorId if it was nullable.
    // Right now creatorId is NOT NULL in the schema. This could cause a foreign key constraint failure
    // if we delete the user. Let's check if there are any projects they own.
    
    // 3. Reassign their owned projects to the admin deleting them
    await db.update(projects).set({ ownerId: adminUser!.id }).where(eq(projects.ownerId, id));

    // Also reassign tasks they created to the admin so we don't violate the NOT NULL creatorId foreign key
    await db.update(tasks).set({ creatorId: adminUser!.id }).where(eq(tasks.creatorId, id));

    // 4. Delete project memberships
    await db.delete(projectMembers).where(eq(projectMembers.userId, id));

    // 5. Delete the user
    await db.delete(users).where(eq(users.id, id));

    return jsonSuccess({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return jsonError("Internal server error", 500);
  }
}
