import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import path from "path";
import { randomUUID } from "crypto";

const dbPath = path.join(process.cwd(), "sqlite.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  const password = await bcrypt.hash("Password1!", 10);

  // ── Users ──────────────────────────────────────────────────────────
  const users = [
    { id: randomUUID(), name: "Shreya Aggarwal", email: "shreya@taskflow.com", role: "admin" as const },
    { id: randomUUID(), name: "Aarav Sharma", email: "aarav@taskflow.com", role: "member" as const },
    { id: randomUUID(), name: "Priya Patel", email: "priya@taskflow.com", role: "member" as const },
    { id: randomUUID(), name: "Rohan Gupta", email: "rohan@taskflow.com", role: "admin" as const },
    { id: randomUUID(), name: "Ananya Singh", email: "ananya@taskflow.com", role: "member" as const },
  ];

  for (const u of users) {
    await db.insert(schema.users).values({ ...u, passwordHash: password });
    console.log(`  ✅ User: ${u.name} (${u.role}) — ${u.email}`);
  }

  // ── Projects ───────────────────────────────────────────────────────
  const projectsData = [
    {
      id: randomUUID(),
      name: "TaskFlow Website Redesign",
      description: "Complete redesign of the TaskFlow marketing website with modern UI/UX",
      ownerId: users[0].id,
    },
    {
      id: randomUUID(),
      name: "Mobile App MVP",
      description: "Build the first version of the TaskFlow mobile application",
      ownerId: users[0].id,
    },
    {
      id: randomUUID(),
      name: "API Documentation",
      description: "Write comprehensive REST API documentation for developers",
      ownerId: users[3].id,
    },
  ];

  for (const p of projectsData) {
    await db.insert(schema.projects).values(p);
    console.log(`  📁 Project: ${p.name}`);
  }

  // ── Project Members ────────────────────────────────────────────────
  // Project 1: everyone
  for (const u of users) {
    await db.insert(schema.projectMembers).values({
      id: randomUUID(),
      projectId: projectsData[0].id,
      userId: u.id,
    });
  }
  console.log(`  👥 All 5 users added to "${projectsData[0].name}"`);

  // Project 2: Shreya, Aarav, Priya
  for (const u of [users[0], users[1], users[2]]) {
    await db.insert(schema.projectMembers).values({
      id: randomUUID(),
      projectId: projectsData[1].id,
      userId: u.id,
    });
  }
  console.log(`  👥 3 users added to "${projectsData[1].name}"`);

  // Project 3: Rohan, Ananya
  for (const u of [users[3], users[4]]) {
    await db.insert(schema.projectMembers).values({
      id: randomUUID(),
      projectId: projectsData[2].id,
      userId: u.id,
    });
  }
  console.log(`  👥 2 users added to "${projectsData[2].name}"`);

  // ── Tasks for Project 1 ────────────────────────────────────────────
  const now = Date.now();
  const DAY = 86400000;

  const tasksP1 = [
    { title: "Design new homepage wireframe", description: "Create high-fidelity wireframes for the landing page", status: "done" as const, priority: "high" as const, assigneeId: users[2].id, dueDate: new Date(now - 3 * DAY) },
    { title: "Implement hero section", description: "Build the animated hero section with gradient backgrounds", status: "done" as const, priority: "high" as const, assigneeId: users[1].id, dueDate: new Date(now - 1 * DAY) },
    { title: "Create feature cards component", description: "Glassmorphism cards showcasing product features", status: "in_progress" as const, priority: "medium" as const, assigneeId: users[1].id, dueDate: new Date(now + 2 * DAY) },
    { title: "Build pricing page", description: "Design and implement the pricing comparison table", status: "in_progress" as const, priority: "medium" as const, assigneeId: users[2].id, dueDate: new Date(now + 3 * DAY) },
    { title: "Set up analytics tracking", description: "Integrate Google Analytics and custom event tracking", status: "todo" as const, priority: "low" as const, assigneeId: users[4].id, dueDate: new Date(now + 7 * DAY) },
    { title: "Write SEO meta tags", description: "Add proper meta descriptions, OG tags for all pages", status: "todo" as const, priority: "medium" as const, assigneeId: users[4].id, dueDate: new Date(now + 5 * DAY) },
    { title: "Optimize images for web", description: "Compress and convert all images to WebP format", status: "todo" as const, priority: "low" as const, assigneeId: users[1].id, dueDate: new Date(now + 10 * DAY) },
    { title: "Fix mobile navigation bug", description: "Hamburger menu doesn't close after clicking a link on iOS", status: "in_progress" as const, priority: "high" as const, assigneeId: users[0].id, dueDate: new Date(now - 2 * DAY) },
    { title: "Add dark mode toggle", description: "Implement system-preference-aware dark/light mode switch", status: "todo" as const, priority: "medium" as const, assigneeId: users[3].id, dueDate: new Date(now + 4 * DAY) },
    { title: "Deploy to staging", description: "Set up CI/CD pipeline and deploy to staging environment", status: "todo" as const, priority: "high" as const, assigneeId: users[0].id, dueDate: new Date(now + 1 * DAY) },
  ];

  for (const t of tasksP1) {
    await db.insert(schema.tasks).values({
      id: randomUUID(),
      projectId: projectsData[0].id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      creatorId: users[0].id,
      dueDate: t.dueDate,
    });
  }
  console.log(`  📝 ${tasksP1.length} tasks created in "${projectsData[0].name}"`);

  // ── Tasks for Project 2 ────────────────────────────────────────────
  const tasksP2 = [
    { title: "Set up React Native project", status: "done" as const, priority: "high" as const, assigneeId: users[1].id, dueDate: new Date(now - 5 * DAY) },
    { title: "Design login/signup screens", status: "done" as const, priority: "high" as const, assigneeId: users[2].id, dueDate: new Date(now - 4 * DAY) },
    { title: "Implement authentication flow", status: "in_progress" as const, priority: "high" as const, assigneeId: users[1].id, dueDate: new Date(now + 1 * DAY) },
    { title: "Build task list screen", status: "todo" as const, priority: "medium" as const, assigneeId: users[2].id, dueDate: new Date(now + 6 * DAY) },
    { title: "Add push notifications", status: "todo" as const, priority: "low" as const, assigneeId: users[1].id, dueDate: new Date(now + 14 * DAY) },
  ];

  for (const t of tasksP2) {
    await db.insert(schema.tasks).values({
      id: randomUUID(),
      projectId: projectsData[1].id,
      title: t.title,
      description: "",
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      creatorId: users[0].id,
      dueDate: t.dueDate,
    });
  }
  console.log(`  📝 ${tasksP2.length} tasks created in "${projectsData[1].name}"`);

  // ── Tasks for Project 3 ────────────────────────────────────────────
  const tasksP3 = [
    { title: "Write authentication endpoints docs", status: "done" as const, priority: "high" as const, assigneeId: users[4].id, dueDate: new Date(now - 2 * DAY) },
    { title: "Document project CRUD endpoints", status: "in_progress" as const, priority: "high" as const, assigneeId: users[4].id, dueDate: new Date(now + 2 * DAY) },
    { title: "Create Postman collection", status: "todo" as const, priority: "medium" as const, assigneeId: users[3].id, dueDate: new Date(now + 5 * DAY) },
  ];

  for (const t of tasksP3) {
    await db.insert(schema.tasks).values({
      id: randomUUID(),
      projectId: projectsData[2].id,
      title: t.title,
      description: "",
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      creatorId: users[3].id,
      dueDate: t.dueDate,
    });
  }
  console.log(`  📝 ${tasksP3.length} tasks created in "${projectsData[2].name}"`);

  console.log("\n✨ Seed complete!\n");
  console.log("┌──────────────────────────────────────────────────────┐");
  console.log("│  Login credentials (all use same password):          │");
  console.log("│                                                      │");
  console.log("│  🔑 Password: Password1!                             │");
  console.log("│                                                      │");
  console.log("│  👑 Admin accounts:                                  │");
  console.log("│     shreya@taskflow.com                               │");
  console.log("│     rohan@taskflow.com                                │");
  console.log("│                                                      │");
  console.log("│  👤 Member accounts:                                 │");
  console.log("│     aarav@taskflow.com                                │");
  console.log("│     priya@taskflow.com                                │");
  console.log("│     ananya@taskflow.com                               │");
  console.log("└──────────────────────────────────────────────────────┘");

  sqlite.close();
}

seed().catch(console.error);
