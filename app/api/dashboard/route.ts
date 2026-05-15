import { db } from "@/db";
import { projects, projectMembers, tasks } from "@/db/schema";
import { requireAuth, jsonSuccess } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

// GET /api/dashboard — Role-based dashboard data
export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  const isAdmin = user!.role === "admin";
  const now = new Date();

  if (isAdmin) {
    // ── Admin Dashboard: sees everything ──────────────────────────────
    const allProjects = await db.query.projects.findMany({
      with: {
        tasks: {
          with: {
            assignee: { columns: { id: true, name: true, email: true } },
            creator: { columns: { id: true, name: true, email: true } },
          },
        },
        members: {
          with: {
            user: { columns: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    const allTasks = allProjects.flatMap((p) => p.tasks);
    const allMembers = new Set(
      allProjects.flatMap((p) => p.members.map((m) => m.userId))
    );

    const stats = {
      totalProjects: allProjects.length,
      totalTasks: allTasks.length,
      totalMembers: allMembers.size,
      todoTasks: allTasks.filter((t) => t.status === "todo").length,
      inProgressTasks: allTasks.filter((t) => t.status === "in_progress")
        .length,
      completedTasks: allTasks.filter((t) => t.status === "done").length,
      overdueTasks: allTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
      ).length,
    };

    const recentTasks = allTasks
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const overdueTasks = allTasks
      .filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      );

    const projectSummaries = allProjects.map((p) => ({
      id: p.id,
      name: p.name,
      memberCount: p.members.length,
      taskCount: p.tasks.length,
      completedCount: p.tasks.filter((t) => t.status === "done").length,
      progress:
        p.tasks.length > 0
          ? Math.round(
              (p.tasks.filter((t) => t.status === "done").length /
                p.tasks.length) *
                100
            )
          : 0,
    }));

    return jsonSuccess({
      role: "admin",
      stats,
      recentTasks,
      overdueTasks,
      projectSummaries,
    });
  } else {
    // ── Member Dashboard: sees only their data ────────────────────────
    const memberships = await db.query.projectMembers.findMany({
      where: eq(projectMembers.userId, user!.id),
      with: {
        project: {
          with: {
            tasks: {
              with: {
                assignee: { columns: { id: true, name: true, email: true } },
                creator: { columns: { id: true, name: true, email: true } },
              },
            },
            members: true,
          },
        },
      },
    });

    const allProjectTasks = memberships.flatMap((m) => m.project.tasks);
    const myTasks = allProjectTasks.filter(
      (t) => t.assigneeId === user!.id
    );

    const stats = {
      totalProjects: memberships.length,
      myTasks: myTasks.length,
      todoTasks: myTasks.filter((t) => t.status === "todo").length,
      inProgressTasks: myTasks.filter((t) => t.status === "in_progress")
        .length,
      completedTasks: myTasks.filter((t) => t.status === "done").length,
      overdueTasks: myTasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
      ).length,
    };

    const recentTasks = myTasks
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const overdueTasks = myTasks
      .filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      );

    const projectSummaries = memberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
      memberCount: m.project.members.length,
      taskCount: m.project.tasks.filter((t) => t.assigneeId === user!.id)
        .length,
      completedCount: m.project.tasks.filter(
        (t) => t.assigneeId === user!.id && t.status === "done"
      ).length,
      progress:
        m.project.tasks.filter((t) => t.assigneeId === user!.id).length > 0
          ? Math.round(
              (m.project.tasks.filter(
                (t) => t.assigneeId === user!.id && t.status === "done"
              ).length /
                m.project.tasks.filter((t) => t.assigneeId === user!.id)
                  .length) *
                100
            )
          : 0,
    }));

    return jsonSuccess({
      role: "member",
      stats,
      recentTasks,
      overdueTasks,
      projectSummaries,
    });
  }
}
