import { db } from "@/db";
import { projects, projectMembers, tasks } from "@/db/schema";
import { UpdateProjectSchema } from "@/lib/definitions";
import {
  requireAuth,
  requireProjectMember,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// GET /api/projects/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Admins can view any project; members must be a member
  if (user!.role !== "admin") {
    const { error: memberError } = await requireProjectMember(id, user!.id);
    if (memberError) return memberError;
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      owner: { columns: { id: true, name: true, email: true } },
      members: {
        with: {
          user: {
            columns: { id: true, name: true, email: true, role: true },
          },
        },
      },
      tasks: {
        with: {
          assignee: { columns: { id: true, name: true, email: true } },
          creator: { columns: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!project) {
    return jsonError("Project not found", 404);
  }

  return jsonSuccess(project);
}

// PUT /api/projects/[id] — Admin only
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (user!.role !== "admin") {
    return jsonError("Admin access required", 403);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = UpdateProjectSchema.safeParse(body);

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

    await db.update(projects).set(parsed.data).where(eq(projects.id, id));

    const updated = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    return jsonSuccess(updated);
  } catch (err) {
    console.error("Update project error:", err);
    return jsonError("Internal server error", 500);
  }
}

// DELETE /api/projects/[id] — Admin only
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (user!.role !== "admin") {
    return jsonError("Admin access required", 403);
  }

  const { id } = await params;

  try {
    await db.delete(tasks).where(eq(tasks.projectId, id));
    await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));

    return jsonSuccess({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete project error:", err);
    return jsonError("Internal server error", 500);
  }
}
