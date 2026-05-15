"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  ListTodo,
  CheckCircle2,
  Clock,
  Trash2,
  UserPlus,
  Calendar,
  Edit2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge, { getStatusBadge, getPriorityBadge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  createdAt: string;
  assignee: { id: string; name: string; email: string } | null;
  creator: { id: string; name: string; email: string };
}

interface Member {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; role?: string };
}

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  members: Member[];
  tasks: Task[];
  createdAt: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<"admin" | "member">("member");

  // Task creation state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Task edit state
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState("");
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [editTaskAssignee, setEditTaskAssignee] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editingTask, setEditingTask] = useState(false);
  const [editTaskError, setEditTaskError] = useState("");

  // Invite member state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState<"tasks" | "members">("tasks");

  useEffect(() => {
    fetchProject();
    fetchUser();
  }, [id]);

  async function fetchUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success) {
      setCurrentUserId(data.data.id);
      setUserRole(data.data.role);
    }
  }

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setCreatingTask(true);
    setTaskError("");

    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          assigneeId: taskAssignee || null,
          dueDate: taskDueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTaskError(data.error || "Failed to create task");
        return;
      }

      setShowCreateTask(false);
      setTaskTitle("");
      setTaskDesc("");
      setTaskPriority("medium");
      setTaskAssignee("");
      setTaskDueDate("");
      fetchProject();
    } catch {
      setTaskError("Something went wrong");
    } finally {
      setCreatingTask(false);
    }
  }

  async function handleEditTask(e: React.FormEvent) {
    e.preventDefault();
    setEditingTask(true);
    setEditTaskError("");

    try {
      const res = await fetch(`/api/projects/${id}/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTaskTitle,
          description: editTaskDesc,
          priority: editTaskPriority,
          assigneeId: editTaskAssignee || null,
          dueDate: editTaskDueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditTaskError(data.error || "Failed to edit task");
        return;
      }

      setShowEditTask(false);
      setEditingTaskId("");
      fetchProject();
    } catch {
      setEditTaskError("Something went wrong");
    } finally {
      setEditingTask(false);
    }
  }

  function openEditModal(task: Task) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || "");
    setEditTaskPriority(task.priority);
    setEditTaskAssignee(task.assigneeId || "");
    setEditTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    setShowEditTask(true);
  }

  async function handleUpdateTaskStatus(taskId: string, newStatus: string) {
    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProject();
    } catch {}
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE",
      });
      fetchProject();
    } catch {}
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to invite member");
        return;
      }

      setShowInvite(false);
      setInviteEmail("");
      fetchProject();
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await fetch(`/api/projects/${id}/members/${memberId}`, {
        method: "DELETE",
      });
      fetchProject();
    } catch {}
  }

  async function handleDeleteProject() {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      router.push("/projects");
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-secondary rounded-lg" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Project not found
      </div>
    );
  }

  const isAdmin = userRole === "admin";

  // For members, show only their tasks when filtering
  const allTasks = project.tasks;
  const filteredTasks =
    statusFilter === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === statusFilter);

  const todoCount = allTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = allTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const doneCount = allTasks.filter((t) => t.status === "done").length;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteProject}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in stagger-1">
        <div className="clay-card rounded-xl p-4 text-center">
          <ListTodo className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{todoCount}</p>
          <p className="text-xs text-muted-foreground">To Do</p>
        </div>
        <div className="clay-card rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold">{inProgressCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="clay-card rounded-xl p-4 text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold">{doneCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="clay-card rounded-xl p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold">{project.members.length}</p>
          <p className="text-xs text-muted-foreground">Members</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit animate-fade-in stagger-2">
        <button
          onClick={() => setTab("tasks")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === "tasks"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTodo className="h-4 w-4 inline mr-1.5" />
          Tasks ({allTasks.length})
        </button>
        <button
          onClick={() => setTab("members")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === "members"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 inline mr-1.5" />
          Members ({project.members.length})
        </button>
      </div>

      {/* Tasks Tab */}
      {tab === "tasks" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {["all", "todo", "in_progress", "done"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {s === "all"
                    ? "All"
                    : s === "todo"
                    ? "To Do"
                    : s === "in_progress"
                    ? "In Progress"
                    : "Done"}
                </button>
              ))}
            </div>
            {/* Only admins can create tasks */}
            {isAdmin && (
              <Button size="sm" onClick={() => setShowCreateTask(true)}>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 clay-card rounded-2xl">
              <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "No tasks yet. Create your first task!"
                  : "No tasks with this status."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((task, i) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "done";

                  // Members can only toggle status on tasks assigned to them or created by them
                  const canEdit =
                    isAdmin ||
                    task.assigneeId === currentUserId ||
                    task.creatorId === currentUserId;

                  return (
                    <div
                      key={task.id}
                      className={`
                        clay-card rounded-xl p-4 group
                        hover:border-primary/20 transition-all duration-200
                        ${isOverdue ? "border-destructive/20" : ""}
                        animate-fade-in
                      `}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Status toggle */}
                        {canEdit ? (
                          <button
                            onClick={() => {
                              const next =
                                task.status === "todo"
                                  ? "in_progress"
                                  : task.status === "in_progress"
                                  ? "done"
                                  : "todo";
                              handleUpdateTaskStatus(task.id, next);
                            }}
                            className={`
                              mt-0.5 h-5 w-5 rounded-full border-2 shrink-0 cursor-pointer
                              transition-all duration-200
                              ${
                                task.status === "done"
                                  ? "bg-success border-success"
                                  : task.status === "in_progress"
                                  ? "border-warning bg-warning/20"
                                  : "border-muted-foreground/30 hover:border-primary"
                              }
                            `}
                            title="Click to change status"
                          >
                            {task.status === "done" && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-white m-auto" />
                            )}
                          </button>
                        ) : (
                          <div
                            className={`
                              mt-0.5 h-5 w-5 rounded-full border-2 shrink-0
                              ${
                                task.status === "done"
                                  ? "bg-success border-success"
                                  : task.status === "in_progress"
                                  ? "border-warning bg-warning/20"
                                  : "border-muted-foreground/30"
                              }
                            `}
                          >
                            {task.status === "done" && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-white m-auto" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              task.status === "done"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                            {task.dueDate && (
                              <span
                                className={`text-xs flex items-center gap-1 ${
                                  isOverdue
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue && " (overdue)"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.assignee && (
                            <Avatar name={task.assignee.name} size="sm" />
                          )}
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Edit task"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === "members" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            {isAdmin && (
              <Button size="sm" onClick={() => setShowInvite(true)}>
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="clay-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-all"
              >
                <Avatar name={member.user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <Badge
                  variant={member.user.role === "admin" ? "purple" : "info"}
                >
                  {member.user.role || "member"}
                </Badge>
                {isAdmin && member.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {taskError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {taskError}
            </div>
          )}

          <Input
            id="task-title"
            label="Task Title"
            placeholder="What needs to be done?"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="task-desc"
              className="block text-sm font-medium text-secondary-foreground"
            >
              Description (optional)
            </label>
            <textarea
              id="task-desc"
              className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200 resize-none"
              rows={3}
              placeholder="Add more details..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary-foreground">
                Priority
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary-foreground">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-secondary-foreground">
              Assign To
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateTask(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creatingTask}>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        open={showEditTask}
        onClose={() => setShowEditTask(false)}
        title="Edit Task"
      >
        <form onSubmit={handleEditTask} className="space-y-4">
          {editTaskError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {editTaskError}
            </div>
          )}

          <Input
            id="edit-task-title"
            label="Task Title"
            placeholder="What needs to be done?"
            value={editTaskTitle}
            onChange={(e) => setEditTaskTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="edit-task-desc"
              className="block text-sm font-medium text-secondary-foreground"
            >
              Description (optional)
            </label>
            <textarea
              id="edit-task-desc"
              className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200 resize-none"
              rows={3}
              placeholder="Add more details..."
              value={editTaskDesc}
              onChange={(e) => setEditTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary-foreground">
                Priority
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                value={editTaskPriority}
                onChange={(e) => setEditTaskPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-secondary-foreground">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
                value={editTaskDueDate}
                onChange={(e) => setEditTaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-secondary-foreground">
              Assign To
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl clay-inset text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary transition-all duration-200"
              value={editTaskAssignee}
              onChange={(e) => setEditTaskAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditTask(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={editingTask}>
              <Edit2 className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal — Admin only, no role selection */}
      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {inviteError}
            </div>
          )}

          <Input
            id="invite-email"
            label="Email Address"
            type="email"
            placeholder="member@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <p className="text-xs text-muted-foreground">
            The member&apos;s role (Admin/Member) is determined by the role they
            selected during signup.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowInvite(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
