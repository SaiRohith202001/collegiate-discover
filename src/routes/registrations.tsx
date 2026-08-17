import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, QrCode, Ticket } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/campusly/AppShell";
import { EmptyState } from "@/components/campusly/EmptyState";
import { RegistrationSkeleton } from "@/components/campusly/Skeletons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampus } from "@/hooks/useCampus";
import { eventService } from "@/services/eventService";
import type { Registration } from "@/types";
import { formatLongDate } from "@/utils/format";

export const Route = createFileRoute("/registrations")({
  head: () => ({
    meta: [
      { title: "My Registrations — CAMPUSLY" },
      { name: "description", content: "Track every campus event you have registered for." },
      { property: "og:title", content: "My Registrations — CAMPUSLY" },
      {
        property: "og:description",
        content: "Your upcoming and completed campus event registrations.",
      },
    ],
  }),
  component: RegistrationsPage,
});

function RegistrationsPage() {
  const { registrations, ready } = useCampus();

  const withEvents = registrations
    .map((registration) => ({
      registration,
      event: eventService.getEventByIdSync(registration.eventId),
    }))
    .filter((item) => item.event);

  const upcoming = withEvents.filter((item) => item.event!.status === "upcoming");
  const completed = withEvents.filter((item) => item.event!.status === "completed");

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">My Registrations</h1>
          <p className="mt-2 text-muted-foreground">Everything you've signed up for on campus.</p>

          {!ready ? (
            <div className="mt-8">
              <RegistrationSkeleton />
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="mt-8">
              <TabsList className="rounded-full">
                <TabsTrigger value="upcoming" className="rounded-full px-5">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full px-5">
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6 space-y-4">
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={Ticket}
                    title="You haven't registered for any events yet."
                    description="Find something happening on campus this week and grab your spot."
                    actionLabel="Explore Events"
                    actionTo="/events"
                  />
                ) : (
                  upcoming.map((item) => (
                    <RegistrationCard
                      key={item.registration.id}
                      registration={item.registration}
                      title={item.event!.title}
                      date={item.event!.date}
                      venue={item.event!.venue}
                      eventId={item.event!.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6 space-y-4">
                {completed.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No completed events yet."
                    description="Events you attended will appear here after they finish."
                  />
                ) : (
                  completed.map((item) => (
                    <RegistrationCard
                      key={item.registration.id}
                      registration={item.registration}
                      title={item.event!.title}
                      date={item.event!.date}
                      venue={item.event!.venue}
                      eventId={item.event!.id}
                      completed
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function RegistrationCard({
  registration,
  title,
  date,
  venue,
  eventId,
  completed = false,
}: {
  registration: Registration;
  title: string;
  date: string;
  venue: string;
  eventId: string;
  completed?: boolean;
}) {
  const { cancelRegistration } = useCampus();
  const [cancelling, setCancelling] = useState(false);

  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" /> {formatLongDate(date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" /> {venue}
            </span>
          </p>
        </div>
        <span
          className={
            completed
              ? "rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              : "rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
          }
        >
          {completed ? "Attended" : "Registered"}
        </span>
      </div>

      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Registration ID</p>
      <p className="font-display font-semibold">{registration.registrationId}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="secondary" className="rounded-full">
          <Link to="/events/$eventId" params={{ eventId }}>
            View Event
          </Link>
        </Button>
        {registration.qrCode && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2">
                <QrCode className="size-4" /> Show QR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs text-center">
              <DialogHeader>
                <DialogTitle>Entry QR Code</DialogTitle>
              </DialogHeader>
              <img
                src={registration.qrCode}
                alt={`QR for ${registration.registrationId}`}
                className="mx-auto size-56 rounded-xl border border-border bg-white p-2"
              />
              <p className="text-xs text-muted-foreground">
                {registration.qrScanned
                  ? `✅ Scanned at entry${registration.scannedAt ? ` · ${new Date(registration.scannedAt).toLocaleString()}` : ""}`
                  : "Show this at the venue entrance. Single-use only."}
              </p>
              <p className="text-xs font-semibold text-primary">{registration.registrationId}</p>
            </DialogContent>
          </Dialog>
        )}
        {!completed && (
          <Button
            variant="ghost"
            className="rounded-full text-destructive hover:text-destructive"
            disabled={cancelling}
            onClick={async () => {
              setCancelling(true);
              try {
                await cancelRegistration(registration.id);
                toast("Registration cancelled", { description: title });
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Unable to cancel registration.",
                );
              } finally {
                setCancelling(false);
              }
            }}
          >
            {cancelling ? "Cancelling..." : "Cancel Registration"}
          </Button>
        )}
      </div>
    </div>
  );
}
