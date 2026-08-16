import { Link } from "@tanstack/react-router";
import { brand } from "@/config/brand";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-brand)] transition-transform group-hover:-rotate-6">
        <span className="font-display text-sm font-bold">C</span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">{brand.name}</span>
      )}
    </Link>
  );
}