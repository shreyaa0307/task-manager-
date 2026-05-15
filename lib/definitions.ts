import { z } from "zod";

// ── Auth Schemas ───────────────────────────────────────────────────────

export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be at most 50 characters" })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }).trim(),
  password: z.string().min(1, { message: "Password is required" }),
});

// ── Project Schemas ────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .max(100, { message: "Project name must be at most 100 characters" })
    .trim(),
  description: z
    .string()
    .max(500, { message: "Description must be at most 500 characters" })
    .optional()
    .default(""),
});

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .max(100)
    .trim()
    .optional(),
  description: z.string().max(500).optional(),
});

// ── Task Schemas ───────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Task title is required" })
    .max(200, { message: "Title must be at most 200 characters" })
    .trim(),
  description: z
    .string()
    .max(1000, { message: "Description must be at most 1000 characters" })
    .optional()
    .default(""),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

// ── Member Schemas ─────────────────────────────────────────────────────

export const InviteMemberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

// ── Types ──────────────────────────────────────────────────────────────

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};
