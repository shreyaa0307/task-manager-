import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { requireAuth, jsonSuccess, jsonError } from "@/lib/api-helpers";
import { eq, desc, and } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format, isSameDay } from "date-fns";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 6));

    // Get all completed tasks for the current user
    const userCompletedTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.assigneeId, user!.id),
        eq(tasks.status, "done")
      ),
      orderBy: (tasks, { desc }) => [desc(tasks.completedAt)],
    });

    // Calculate Current Streak
    let currentStreak = 0;
    let checkDate = startOfDay(now);
    
    // Create a set of days where the user completed at least one task
    const completedDays = new Set(
      userCompletedTasks
        .filter((t) => t.completedAt != null)
        .map((t) => format(new Date(t.completedAt!), "yyyy-MM-dd"))
    );

    // Check streak starting from today, going backwards
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (completedDays.has(dateStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        // If they haven't completed anything today yet, check if they had a streak up until yesterday
        if (currentStreak === 0 && isSameDay(checkDate, now)) {
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
      }
    }

    // Prepare Daily Trend Data (Last 7 Days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(subDays(now, i));
      const count = userCompletedTasks.filter(
        (t) =>
          t.completedAt &&
          new Date(t.completedAt) >= d &&
          new Date(t.completedAt) <= endOfDay(d)
      ).length;
      dailyTrend.push({
        date: format(d, "MMM dd"),
        completed: count,
      });
    }

    // Leaderboard: Top 5 users by completed tasks in the last 7 days
    const allRecentCompletedTasks = await db.query.tasks.findMany({
      where: eq(tasks.status, "done"),
      with: {
        assignee: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    const userCompletionCounts: Record<string, { user: any; count: number }> = {};
    for (const task of allRecentCompletedTasks) {
      if (!task.assignee || !task.completedAt) continue;
      
      const completedDate = new Date(task.completedAt);
      if (completedDate < sevenDaysAgo) continue;

      if (!userCompletionCounts[task.assignee.id]) {
        userCompletionCounts[task.assignee.id] = { user: task.assignee, count: 0 };
      }
      userCompletionCounts[task.assignee.id].count++;
    }

    const leaderboard = Object.values(userCompletionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        tasksCompleted: entry.count,
      }));

    return jsonSuccess({
      totalCompleted: userCompletedTasks.length,
      currentStreak,
      dailyTrend,
      leaderboard,
    });
  } catch (err) {
    console.error("Productivity API error:", err);
    return jsonError("Internal server error", 500);
  }
}
