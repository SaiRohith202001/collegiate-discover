import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: "/" | "/events";
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-card px-6 py-16 text-center shadow-[var(--shadow-card)]">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionTo && (
        <Button asChild className="mt-6 rounded-full px-6">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}