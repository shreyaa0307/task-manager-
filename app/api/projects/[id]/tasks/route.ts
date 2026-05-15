import { db } from "@/db";
import { tasks } from "@/db/schema";
import { CreateTaskSchema } from "@/lib/definitions";
import {
  requireAuth,
  requireProjectMember,
  generateId,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// GET /api/projects/[id]/tasks
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Members must be a member; admins can view any project's tasks
  if (user!.role !== "admin") {
    const { error: memberError } = await requireProjectMember(id, user!.id);
    if (memberError) return memberError;
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const assigneeId = url.searchParams.get("assigneeId");

  let taskList = await db.query.tasks.findMany({
    where: eq(tasks.projectId, id),
    with: {
      assignee: { columns: { id: true, name: true, email: true } },
      creator: { columns: { id: true, name: true, email: true } },
    },
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
  });

  if (status) taskList = taskList.filter((t) => t.status === status);
  if (priority) taskList = taskList.filter((t) => t.priority === priority);
  if (assigneeId) taskList = taskList.filter((t) => t.assigneeId === assigneeId);

  return jsonSuccess(taskList);
}

// POST /api/projects/[id]/tasks — Admin only
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  // Only admins can create tasks
  if (user!.role !== "admin") {
    return jsonError("Only admins can create tasks", 403);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = CreateTaskSchema.safeParse(body);

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

    const taskId = generateId();

    await db.insert(tasks).values({
      id: taskId,
      projectId: id,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId || null,
      creatorId: user!.id,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    });

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        assignee: { columns: { id: true, name: true, email: true } },
        creator: { columns: { id: true, name: true, email: true } },
      },
    });

    return jsonSuccess(task, 201);
  } catch (err) {
    console.error("Create task error:", err);
    return jsonError("Internal server error", 500);
  }
}
