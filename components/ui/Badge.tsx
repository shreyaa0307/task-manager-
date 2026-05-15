import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  danger: "bg-destructive/15 text-destructive border border-destructive/20",
  info: "bg-accent/15 text-accent border border-accent/20",
  purple: "bg-primary/15 text-primary border border-primary/20",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium rounded-full
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Utility mappings for task status and priority
export function getStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    todo: { label: "To Do", variant: "default" },
    in_progress: { label: "In Progress", variant: "warning" },
    done: { label: "Done", variant: "success" },
  };
  const item = map[status] || map.todo;
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function getPriorityBadge(priority: string) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    low: { label: "Low", variant: "info" },
    medium: { label: "Medium", variant: "warning" },
    high: { label: "High", variant: "danger" },
  };
  const item = map[priority] || map.medium;
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
