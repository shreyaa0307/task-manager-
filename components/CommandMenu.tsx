"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { FolderKanban, LayoutDashboard, Users, Zap, CheckCircle2 } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200" onClick={() => setOpen(false)}>
      <Command 
        className="w-full max-w-lg bg-card text-card-foreground shadow-2xl rounded-xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center border-b border-border px-3">
          <Command.Input 
            autoFocus 
            placeholder="Type a command or search..." 
            className="w-full h-12 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item 
              onSelect={() => { router.push("/dashboard"); setOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Command.Item>
            <Command.Item 
              onSelect={() => { router.push("/projects"); setOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </Command.Item>
            <Command.Item 
              onSelect={() => { router.push("/team"); setOpen(false); }}
              className="flex items-center gap-2 px-2 py-2 text-sm rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Team
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
