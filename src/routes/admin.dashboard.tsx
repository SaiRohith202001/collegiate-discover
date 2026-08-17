import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, QrCode, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { eventService } from "@/services/eventService";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CAMPUSLY" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { authReady, isAdmin, eventStats, refreshStats } = useAdmin();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once auth has resolved — avoids flash-redirect on initial load
    if (authReady && !isAdmin) {
      void navigate({ to: "/login", search: { redirect: "/admin/dashboard" } });
    }
  }, [authReady, isAdmin, navigate]);

  // Poll every 10 seconds for live updates
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(() => void refreshStats(), 10_000);
    return () => clearInterval(id);
  }, [isAdmin, refreshStats]);

  // Show nothing while auth is resolving
  if (!authReady) return null;
  if (!isAdmin) return null;

  const totalRegistered = eventStats.reduce((sum, s) => sum + s.total, 0);
  const totalScanned = eventStats.reduce((sum, s) => sum + s.scanned, 0);
  const totalPending = eventStats.reduce((sum, s) => sum + s.pending, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-lg font-bold text-primary">CAMPUSLY</Link>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="rounded-full gap-2">
              <Link to="/admin/scan">
                <QrCode className="size-4" /> Scan QR
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-2"
              onClick={() => void refreshStats()}
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-2 text-destructive hover:text-destructive"
              onClick={async () => {
                await logout();
                void navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Live Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Auto-refreshes every 10 seconds · Data from MongoDB
        </p>

        {/* Summary cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Registered" value={totalRegistered} color="text-primary" />
          <StatCard label="Scanned In ✅" value={totalScanned} color="text-green-600" />
          <StatCard label="Awaiting Entry ⏳" value={totalPending} color="text-amber-600" />
        </div>

        {/* Per-event table */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="border-b border-border px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5 text-primary" /> Event-wise Entry Status
            </h2>
          </div>
          {eventStats.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No registrations yet. Stats will appear here as students register.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-6 py-3 text-left font-semibold text-muted-foreground">Event</th>
                    <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Registered</th>
                    <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Scanned In</th>
                    <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Awaiting</th>
                    <th className="px-6 py-3 text-right font-semibold text-muted-foreground">Fill Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventStats.map((stat) => {
                    const event = eventService.getEventByIdSync(stat.eventId);
                    const fillRate = stat.total > 0 ? Math.round((stat.scanned / stat.total) * 100) : 0;
                    return (
                      <tr key={stat.eventId} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{event?.title ?? stat.eventId}</div>
                          {event && (
                            <div className="text-xs text-muted-foreground">{event.venue} · {event.date}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{stat.total}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-green-600">{stat.scanned}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-amber-600">{stat.pending}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex flex-col items-end gap-1">
                            <span className="text-xs font-semibold">{fillRate}%</span>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
