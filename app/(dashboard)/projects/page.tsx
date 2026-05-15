"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Users,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  Shield,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

interface Project {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  owner: { id: string; name: string; email: string };
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    fetchProjects();
    fetchUser();
  }, []);

  async function fetchUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success) setUserRole(data.data.role);
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      fetchProjects();
    } catch {
      setError("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-secondary rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p className="text-muted-foreground">
            {userRole === "admin"
              ? "Manage all projects and teams"
              : "Projects you are a member of"}
          </p>
        </div>
        {userRole === "admin" && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 clay-card rounded-2xl animate-fade-in">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            {userRole === "admin"
              ? "Create your first project to start managing tasks"
              : "You haven't been added to any projects yet. Ask an admin to invite you!"}
          </p>
          {userRole === "admin" && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const progress =
              project.taskCount > 0
                ? Math.round(
                  (project.completedTaskCount / project.taskCount) * 100
                )
                : 0;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`
                  clay-card rounded-2xl p-5 group
                  hover:border-primary/30 hover:-translate-y-1
                  transition-all duration-300
                  hover:shadow-xl hover:shadow-primary/5
                  animate-fade-in stagger-${(i % 6) + 1}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                    <FolderKanban className="h-5 w-5 text-white" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-bg rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ListTodo className="h-3.5 w-3.5" />
                    {project.taskCount} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {project.completedTaskCount} done
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.memberCount}
                  </span>
                </div>

                <div className="flex items-center justify-end mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View project <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal Admin only */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            id="create-project-name"
            label="Project Name"
            placeholder="My Awesome Project"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="create-project-desc"
              className="block text-sm font-medium text-secondary-foreground"
            >
              Description (optional)
            </label>
            <textarea
              id="create-project-desc"
              className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200 resize-none"
              rows={3}
              placeholder="Brief description of your project..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

