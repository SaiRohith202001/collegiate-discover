import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ChevronRight, LogOut, Settings, Ticket } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/campusly/AppShell";
import { useCampus } from "@/hooks/useCampus";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CAMPUSLY" },
      { name: "description", content: "Your student profile, registrations and saved campus events." },
      { property: "og:title", content: "Profile — CAMPUSLY" },
      { property: "og:description", content: "Manage your campus event activity in one place." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, registrations, savedEventIds } = useCampus();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col items-center rounded-3xl bg-card p-8 text-center shadow-[var(--shadow-card)]">
          <span className="flex size-20 items-center justify-center rounded-full bg-ink font-display text-2xl font-bold text-ink-foreground">
            {user.avatarInitials}
          </span>
          <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">
            {user.studentId} · {user.year}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{user.department}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Stat label="Registrations" value={registrations.length} />
            <Stat label="Saved Events" value={savedEventIds.length} />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)]">
          <RowLink to="/registrations" icon={Ticket} label="My Registrations" />
          <RowLink to="/saved" icon={Bookmark} label="Saved Events" />
          <button
            type="button"
            onClick={() => toast("Account settings coming soon")}
            className="flex w-full items-center gap-3 border-t border-border px-5 py-4 text-left transition-colors hover:bg-secondary"
          >
            <Settings className="size-5 text-primary" />
            <span className="font-medium">Account Settings</span>
            <ChevronRight className="ml-auto size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => toast("Signed out (demo)")}
            className="flex w-full items-center gap-3 border-t border-border px-5 py-4 text-left text-destructive transition-colors hover:bg-secondary"
          >
            <LogOut className="size-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-secondary px-4 py-3">
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RowLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/registrations" | "/saved";
  icon: typeof Ticket;
  label: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary">
      <Icon className="size-5 text-primary" />
      <span className="font-medium">{label}</span>
      <ChevronRight className="ml-auto size-4 text-muted-foreground" />
    </Link>
  );
}