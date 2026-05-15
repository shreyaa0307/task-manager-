import "server-only";
import { getSession } from "./auth";
import { db } from "@/db";
import { projectMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Require authentication, returns the user (including role) or a 401 Response.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      error: Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
      user: null,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return {
      error: Response.json(
        { success: false, error: "User not found" },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Require the user to be an admin (global role).
 */
export async function requireAdmin() {
  const { error, user } = await requireAuth();
  if (error) return { error, user: null };

  if (user!.role !== "admin") {
    return {
      error: Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Check if user is a member of a project.
 * Returns the membership record or an error Response.
 */
export async function requireProjectMember(
  projectId: string,
  userId: string
) {
  const membership = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });

  if (!membership) {
    return {
      error: Response.json(
        { success: false, error: "Not a member of this project" },
        { status: 403 }
      ),
      membership: null,
    };
  }

  return { error: null, membership };
}

/**
 * Generate a unique ID using crypto.randomUUID()
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Standard JSON error response
 */
export function jsonError(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Standard JSON success response
 */
export function jsonSuccess<T>(data: T, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}
