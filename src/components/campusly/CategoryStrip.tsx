import {
  Cpu,
  Code2,
  Gamepad2,
  Sparkles,
  Brain,
  Trophy,
  Users,
  Wrench,
  Music,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/data/events";
import type { EventCategory } from "@/types";

const icons: Record<string, LucideIcon> = {
  All: LayoutGrid,
  Hackathon: Sparkles,
  Coding: Code2,
  Quiz: Brain,
  Workshop: Wrench,
  Technical: Cpu,
  Cultural: Music,
  Sports: Trophy,
  Gaming: Gamepad2,
  Clubs: Users,
};

export function CategoryStrip({
  value,
  onChange,
}: {
  value: EventCategory | "All";
  onChange: (category: EventCategory | "All") => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((category) => {
        const Icon = icons[category] ?? LayoutGrid;
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              active
                ? "bg-ink text-ink-foreground shadow-[var(--shadow-card)]"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active ? "text-primary" : "")} />
            {category}
          </button>
        );
      })}
    </div>
  );
}