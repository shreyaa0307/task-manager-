interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  status?: "online" | "away" | "offline" | null;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

const statusDotSizes = {
  sm: "h-2.5 w-2.5 -bottom-0.5 -right-0.5 ring-1",
  md: "h-3 w-3 -bottom-0.5 -right-0.5 ring-[1.5px]",
  lg: "h-3.5 w-3.5 bottom-0 right-0 ring-2",
};

const statusDotColors = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-gray-400 dark:bg-gray-500",
};

const colors = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-violet-600",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  name,
  size = "md",
  className = "",
  status = null,
}: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br ${getColorFromName(name)}
          rounded-full flex items-center justify-center
          font-semibold text-white
          ring-2 ring-background
          shrink-0
          ${className}
        `}
        title={name}
      >
        {getInitials(name)}
      </div>
      {status && (
        <span
          className={`
            absolute ${statusDotSizes[size]}
            ${statusDotColors[status]}
            rounded-full ring-background
            ${status === "online" ? "status-online" : ""}
          `}
          title={status === "online" ? "Online" : status === "away" ? "Away" : "Offline"}
        />
      )}
    </div>
  );
}

/**
 * Utility: determine active status from a lastActiveAt timestamp.
 * - Online: active within the last 5 minutes
 * - Away: active within the last 30 minutes
 * - Offline: inactive for more than 30 minutes or never active
 */
export function getActiveStatus(
  lastActiveAt: string | Date | null | undefined
): "online" | "away" | "offline" {
  if (!lastActiveAt) return "offline";

  const lastActive = new Date(lastActiveAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastActive) / (1000 * 60);

  if (diffMinutes <= 5) return "online";
  if (diffMinutes <= 30) return "away";
  return "offline";
}
