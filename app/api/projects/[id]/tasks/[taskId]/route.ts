import { db } from "@/db";
import { tasks } from "@/db/schema";
import { UpdateTaskSchema } from "@/lib/definitions";
import {
  requireAuth,
  requireProjectMember,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// GET /api/projects/[id]/tasks/[taskId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id, taskId } = await params;

  if (user!.role !== "admin") {
    const { error: memberError } = await requireProjectMember(id, user!.id);
    if (memberError) return memberError;
  }

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      assignee: { columns: { id: true, name: true, email: true } },
      creator: { columns: { id: true, name: true, email: true } },
    },
  });

  if (!task) {
    return jsonError("Task not found", 404);
  }

  return jsonSuccess(task);
}

// PUT /api/projects/[id]/tasks/[taskId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id, taskId } = await params;

  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return jsonError("Task not found", 404);
    }

    // Admins can edit any task; members can only edit tasks assigned to them or created by them
    if (user!.role !== "admin") {
      if (task.assigneeId !== user!.id && task.creatorId !== user!.id) {
        return jsonError(
          "You can only edit tasks assigned to you or created by you",
          403
        );
      }
    }

    const body = await request.json();
    const parsed = UpdateTaskSchema.safeParse(body);

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

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate !== undefined) {
      updateData.dueDate = parsed.data.dueDate
        ? new Date(parsed.data.dueDate)
        : null;
    }

    await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));

    const updated = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        assignee: { columns: { id: true, name: true, email: true } },
        creator: { columns: { id: true, name: true, email: true } },
      },
    });

    return jsonSuccess(updated);
  } catch (err) {
    console.error("Update task error:", err);
    return jsonError("Internal server error", 500);
  }
}

// DELETE /api/projects/[id]/tasks/[taskId] — Admin only
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (user!.role !== "admin") {
    return jsonError("Only admins can delete tasks", 403);
  }

  const { id, taskId } = await params;

  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return jsonError("Task not found", 404);
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return jsonSuccess({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    return jsonError("Internal server error", 500);
  }
}
