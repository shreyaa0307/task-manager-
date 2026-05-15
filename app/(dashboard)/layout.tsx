"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Zap,
  Menu,
  X,
  ChevronRight,
  Shield,
  Users,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/projects", label: "Projects", icon: FolderKanban, adminOnly: false },
  { href: "/team", label: "Team", icon: Users, adminOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 clay-panel border-r border-border/50
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border/50">
          <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">TaskFlow</span>
          <button
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-secondary/50 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role indicator */}
        {user && (
          <div className="px-5 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              {user.role === "admin" ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <Users className="h-4 w-4 text-accent" />
              )}
              <Badge variant={user.role === "admin" ? "purple" : "info"}>
                {user.role === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null;
            
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-secondary-foreground hover:text-foreground hover:bg-secondary/50"
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-5 py-3 border-t border-border/50 flex justify-between items-center">
          <span className="text-sm font-medium text-secondary-foreground">Theme</span>
          <ThemeToggle />
        </div>

        {/* User section */}
        <div className="p-3 border-t border-border/50">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 clay-panel">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">TaskFlow</span>
          </div>
          {user && (
            <Badge
              variant={user.role === "admin" ? "purple" : "info"}
              className="ml-auto"
            >
              {user.role}
            </Badge>
          )}
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

