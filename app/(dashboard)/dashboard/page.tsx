"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  FolderKanban,
  TrendingUp,
  ArrowRight,
  Users,
  Shield,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getStatusBadge, getPriorityBadge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

interface DashboardData {
  role: "admin" | "member";
  stats: {
    totalProjects: number;
    totalTasks?: number;
    myTasks?: number;
    totalMembers?: number;
    todoTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    projectId: string;
    dueDate: string | null;
    assignee: { id: string; name: string; email: string } | null;
    creator: { id: string; name: string; email: string };
    createdAt: string;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    projectId: string;
    dueDate: string;
    assignee: { id: string; name: string; email: string } | null;
  }>;
  projectSummaries: Array<{
    id: string;
    name: string;
    memberCount: number;
    taskCount: number;
    completedCount: number;
    progress: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-secondary rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  if (data.role === "admin") {
    return <AdminDashboard data={data} />;
  }
  return <MemberDashboard data={data} />;
}

// ── Admin Dashboard ─────────────────────────────────────────────────────
function AdminDashboard({ data }: { data: DashboardData }) {
  const adminStatCards = [
    {
      key: "totalProjects",
      label: "Total Projects",
      icon: FolderKanban,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      key: "totalTasks",
      label: "Total Tasks",
      icon: ListTodo,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      key: "totalMembers",
      label: "Team Members",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      key: "overdueTasks",
      label: "Overdue",
      icon: AlertTriangle,
      gradient: "from-rose-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Admin
          </div>
        </div>
        <p className="text-muted-foreground">
          Full overview of all projects, tasks, and team activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStatCards.map((card, i) => (
          <div
            key={card.key}
            className={`clay-card rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              {card.key === "overdueTasks" &&
                data.stats.overdueTasks > 0 && (
                  <span className="flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-rose-400 opacity-30" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 items-center justify-center text-[10px] text-white font-bold">
                      !
                    </span>
                  </span>
                )}
            </div>
            <p className="text-3xl font-bold mb-0.5">
              {(data.stats as Record<string, number>)[card.key] ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6 animate-fade-in stagger-5">
        {/* Task Status Pie Chart */}
        <div className="clay-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            Task Status Distribution
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "To Do", value: data.stats.todoTasks, color: "#8b5cf6" }, // primary
                    { name: "In Progress", value: data.stats.inProgressTasks, color: "#eab308" }, // warning
                    { name: "Completed", value: data.stats.completedTasks, color: "#10b981" }, // success
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {[
                    { name: "To Do", value: data.stats.todoTasks, color: "#8b5cf6" },
                    { name: "In Progress", value: data.stats.inProgressTasks, color: "#eab308" },
                    { name: "Completed", value: data.stats.completedTasks, color: "#10b981" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress Bar Chart */}
        <div className="clay-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <FolderKanban className="h-5 w-5 text-accent" />
            Tasks by Project
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.projectSummaries.map(p => ({
                  name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
                  Completed: p.completedCount,
                  Remaining: p.taskCount - p.completedCount
                }))}
                margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar dataKey="Remaining" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 clay-card rounded-2xl p-6 animate-fade-in stagger-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Tasks (All Projects)
          </h2>
          {data.recentTasks.length === 0 ? (
            <EmptyTasks />
          ) : (
            <TaskList tasks={data.recentTasks.slice(0, 8)} />
          )}
        </div>

        {/* Projects Summary */}
        <div className="clay-card rounded-2xl p-6 animate-fade-in stagger-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-accent" />
              All Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ProjectList projects={data.projectSummaries} />
        </div>
      </div>

      {/* Overdue Tasks */}
      <OverdueSection tasks={data.overdueTasks} />
    </div>
  );
}

// ── Member Dashboard ─────────────────────────────────────────────────────
function MemberDashboard({ data }: { data: DashboardData }) {
  const memberStatCards = [
    {
      key: "myTasks",
      label: "My Tasks",
      icon: ListTodo,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      key: "inProgressTasks",
      label: "In Progress",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      key: "completedTasks",
      label: "Completed",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      key: "overdueTasks",
      label: "Overdue",
      icon: AlertTriangle,
      gradient: "from-rose-500 to-red-600",
    },
  ];

  const totalMyTasks = data.stats.myTasks || 0;
  const completionRate =
    totalMyTasks > 0
      ? Math.round((data.stats.completedTasks / totalMyTasks) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Member
          </div>
        </div>
        <p className="text-muted-foreground">
          Your assigned tasks and project activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {memberStatCards.map((card, i) => (
          <div
            key={card.key}
            className={`clay-card rounded-2xl p-5 hover:border-accent/20 transition-all duration-300 animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              {card.key === "overdueTasks" &&
                data.stats.overdueTasks > 0 && (
                  <span className="flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-rose-400 opacity-30" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 items-center justify-center text-[10px] text-white font-bold">
                      !
                    </span>
                  </span>
                )}
            </div>
            <p className="text-3xl font-bold mb-0.5">
              {(data.stats as Record<string, number>)[card.key] ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="clay-card rounded-2xl p-6 animate-fade-in stagger-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-accent" />
          My Completion Rate
        </h2>
        <div className="flex items-center gap-6">
          {/* Circular progress */}
          <div className="relative h-28 w-28 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${completionRate * 3.27} ${327 - completionRate * 3.27}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">To Do</span>
              <span className="font-medium">{data.stats.todoTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-warning">In Progress</span>
              <span className="font-medium">{data.stats.inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-success">Completed</span>
              <span className="font-medium">{data.stats.completedTasks}</span>
            </div>
            {data.stats.overdueTasks > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-destructive">Overdue</span>
                <span className="font-medium text-destructive">
                  {data.stats.overdueTasks}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 clay-card rounded-2xl p-6 animate-fade-in stagger-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-accent" />
            My Recent Tasks
          </h2>
          {data.recentTasks.length === 0 ? (
            <EmptyTasks message="No tasks assigned to you yet." />
          ) : (
            <TaskList tasks={data.recentTasks.slice(0, 8)} />
          )}
        </div>

        {/* My Projects */}
        <div className="clay-card rounded-2xl p-6 animate-fade-in stagger-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-accent" />
              My Projects
            </h2>
            <Link
              href="/projects"
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ProjectList projects={data.projectSummaries} />
        </div>
      </div>

      {/* Overdue Tasks */}
      <OverdueSection tasks={data.overdueTasks} />
    </div>
  );
}

// ── Shared Components ────────────────────────────────────────────────────

function TaskList({
  tasks,
}: {
  tasks: DashboardData["recentTasks"];
}) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
        </div>
      ))}
    </div>
  );
}

function ProjectList({
  projects,
}: {
  projects: DashboardData["projectSummaries"];
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No projects yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="block p-3 rounded-xl hover:bg-secondary/30 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
              {project.name}
            </p>
            <span className="text-xs text-muted-foreground">
              {project.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-bg rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{project.taskCount} tasks</span>
            <span>{project.memberCount} members</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyTasks({ message }: { message?: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{message || "No tasks yet. Create a project to get started!"}</p>
    </div>
  );
}

function OverdueSection({
  tasks,
}: {
  tasks: DashboardData["overdueTasks"];
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="clay-card rounded-2xl p-6 border-destructive/20 animate-fade-in">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <span className="text-destructive">Overdue Tasks</span>
        <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full ml-auto">
          {tasks.length}
        </span>
      </h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              <p className="text-xs text-destructive mt-0.5">
                Due {new Date(task.dueDate).toLocaleDateString()} —{" "}
                {Math.ceil(
                  (Date.now() - new Date(task.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days overdue
              </p>
            </div>
            {getPriorityBadge(task.priority)}
            {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
          </div>
        ))}
      </div>
    </div>
  );
}

