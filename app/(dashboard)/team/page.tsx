"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Avatar, { getActiveStatus } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
  lastActiveAt: string | null;
}

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Create member state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchMe();

    // Auto-refresh active status every 30 seconds
    const statusInterval = setInterval(fetchUsers, 30_000);
    return () => clearInterval(statusInterval);
  }, []);

  async function fetchMe() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success) {
      if (data.data.role !== "admin") {
        router.push("/dashboard"); // Kick out non-admins
      }
      setCurrentUserId(data.data.id);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (data.success) setUsers(data.data);
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
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add member");
        return;
      }

      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      fetchUsers();
    } catch {
      setError("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateRole(id: string, newRole: string) {
    if (!confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    try {
      await fetch(`/api/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this user? Their tasks will be unassigned."
      )
    )
      return;

    try {
      await fetch(`/api/team/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch {}
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-lg" />
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">Team Management</h1>
          <p className="text-muted-foreground">
            Manage all users, roles, and access across TaskFlow
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-2xl border border-border animate-fade-in stagger-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl clay-inset text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 ml-auto pr-2">
          <div className="flex items-center gap-1.5 text-sm text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 status-online" />
            <span className="font-medium">
              {filteredUsers.filter(u => getActiveStatus(u.lastActiveAt) === "online").length} online
            </span>
          </div>
          <span className="text-border">•</span>
          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} total
          </div>
        </div>
      </div>

      {/* Users Grid/List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-2">
        {filteredUsers.map((user, i) => (
          <div
            key={user.id}
            className={`
              clay-card rounded-2xl p-5
              transition-all duration-300 hover:border-primary/20
            `}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <Avatar name={user.name} size="lg" status={getActiveStatus(user.lastActiveAt)} />
              {user.id !== currentUserId && (
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold truncate">{user.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              {(() => {
                const status = getActiveStatus(user.lastActiveAt);
                const statusConfig = {
                  online: { label: "Online now", color: "text-emerald-500", dot: "bg-emerald-500" },
                  away: { label: "Away", color: "text-amber-500", dot: "bg-amber-400" },
                  offline: { label: "Offline", color: "text-gray-400", dot: "bg-gray-400" },
                };
                const cfg = statusConfig[status];
                return (
                  <div className={`flex items-center gap-1.5 mt-1.5 ${cfg.color}`}>
                    <span className={`h-2 w-2 rounded-full ${cfg.dot} ${status === "online" ? "status-online" : ""}`} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <Badge variant={user.role === "admin" ? "purple" : "info"}>
                {user.role}
              </Badge>

              {user.id !== currentUserId && (
                <select
                  className="text-xs px-2 py-1.5 rounded-lg bg-secondary border-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                >
                  <option value="member">Make Member</option>
                  <option value="admin">Make Admin</option>
                </select>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No users found matching "{search}"
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add New Member"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="p-3 mb-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium mb-0.5">Default Password</p>
              <p className="text-xs opacity-90">
                New members will be created with the default password:{" "}
                <code className="bg-background px-1.5 py-0.5 rounded text-primary">
                  Password1!
                </code>
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Input
            id="add-member-name"
            label="Full Name"
            placeholder="John Doe"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            id="add-member-email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

