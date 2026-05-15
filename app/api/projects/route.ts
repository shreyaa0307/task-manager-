import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { CreateProjectSchema } from "@/lib/definitions";
import {
  requireAuth,
  generateId,
  jsonError,
  jsonSuccess,
} from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// GET /api/projects — List user's projects
export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  // Admins see all projects; members see only projects they belong to
  if (user!.role === "admin") {
    const allProjects = await db.query.projects.findMany({
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        members: {
          with: {
            user: { columns: { id: true, name: true, email: true } },
          },
        },
        tasks: true,
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    const projectList = allProjects.map((p) => ({
      ...p,
      memberCount: p.members.length,
      taskCount: p.tasks.length,
      completedTaskCount: p.tasks.filter((t) => t.status === "done").length,
    }));

    return jsonSuccess(projectList);
  }

  // Members see only their projects
  const memberships = await db.query.projectMembers.findMany({
    where: eq(projectMembers.userId, user!.id),
    with: {
      project: {
        with: {
          owner: { columns: { id: true, name: true, email: true } },
          members: {
            with: {
              user: { columns: { id: true, name: true, email: true } },
            },
          },
          tasks: true,
        },
      },
    },
  });

  const projectList = memberships.map((m) => ({
    ...m.project,
    memberCount: m.project.members.length,
    taskCount: m.project.tasks.length,
    completedTaskCount: m.project.tasks.filter((t) => t.status === "done")
      .length,
  }));

  return jsonSuccess(projectList);
}

// POST /api/projects — Create a new project (admin only)
export async function POST(request: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  // Only admins can create projects
  if (user!.role !== "admin") {
    return jsonError("Only admins can create projects", 403);
  }

  try {
    const body = await request.json();
    const parsed = CreateProjectSchema.safeParse(body);

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

    const projectId = generateId();
    const memberId = generateId();

    // Create project
    await db.insert(projects).values({
      id: projectId,
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: user!.id,
    });

    // Add creator as a member
    await db.insert(projectMembers).values({
      id: memberId,
      projectId,
      userId: user!.id,
    });

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        owner: { columns: { id: true, name: true, email: true } },
      },
    });

    return jsonSuccess(project, 201);
  } catch (err) {
    console.error("Create project error:", err);
    return jsonError("Internal server error", 500);
  }
}
