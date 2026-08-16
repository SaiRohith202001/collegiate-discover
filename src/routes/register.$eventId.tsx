import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock, MapPin, PartyPopper } from "lucide-react";
import { AppShell } from "@/components/campusly/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventService } from "@/services/eventService";
import { useCampus } from "@/hooks/useCampus";
import { formatLongDate, teamSizeLabel } from "@/utils/format";
import type { Registration } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/register/$eventId")({
  loader: ({ params }) => {
    const event = eventService.getEventByIdSync(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Registration unavailable — CAMPUSLY" }, { name: "robots", content: "noindex" }] };
    }
    const title = `Register for ${loaderData.event.title} — CAMPUSLY`;
    const description = `Confirm your spot for ${loaderData.event.title} on ${formatLongDate(loaderData.event.date)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RegisterPage,
});

function RegisterPage() {
  const { event } = Route.useLoaderData();
  const { register, user } = useCampus();
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Registration | null>(null);

  const isTeamEvent = Boolean(event.teamSize && event.teamSize.max > 1);

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const form = new FormData(formEvent.currentTarget);
    setSubmitting(true);
    try {
      const registration = await register({
        eventId: event.id,
        fullName: String(form.get("fullName") ?? ""),
        studentId: String(form.get("studentId") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        department: String(form.get("department") ?? ""),
        year: String(form.get("year") ?? ""),
        ...(isTeamEvent
          ? {
              teamName: String(form.get("teamName") ?? ""),
              teamMembers: String(form.get("teamMembers") ?? "")
                .split(",")
                .map((member) => member.trim())
                .filter(Boolean),
            }
          : {}),
      });
      setCreated(registration);
      toast.success("Registration confirmed", { description: event.title });
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-xl px-4 py-14 text-center sm:px-6">
          <span className="mx-auto flex size-20 animate-in zoom-in-75 items-center justify-center rounded-full bg-brand-soft text-primary duration-500">
            <PartyPopper className="size-9" />
          </span>
          <h1 className="mt-6 text-3xl font-bold">You're Registered!</h1>
          <p className="mt-2 text-muted-foreground">
            Your spot for {event.title} has been confirmed.
          </p>

          <div className="mt-8 space-y-3 rounded-3xl bg-card p-6 text-left shadow-[var(--shadow-card)]">
            <Row label="Event" value={event.title} />
            <Row label="Date" value={formatLongDate(event.date)} />
            <Row label="Time" value={event.time} />
            <Row label="Venue" value={event.venue} />
            <div className="mt-4 rounded-2xl bg-brand-soft px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration ID</p>
              <p className="font-display text-lg font-bold text-primary">{created.registrationId}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/registrations">View My Registrations</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link to="/events">Explore More Events</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Register for {event.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-primary" />
            {formatLongDate(event.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-primary" />
            {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-primary" />
            {event.venue}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" name="fullName" defaultValue={user.name} />
            <Field label="Student ID / Roll Number" name="studentId" defaultValue={user.studentId} />
            <Field label="Email" name="email" type="email" defaultValue={user.email} />
            <Field label="Phone Number" name="phone" defaultValue={user.phone} />
            <Field label="Department" name="department" defaultValue={user.department} />
            <Field label="Year" name="year" defaultValue={user.year} />
          </div>

          {isTeamEvent && (
            <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              <Field label="Team Name" name="teamName" placeholder="e.g. Null Pointers" />
              <Field
                label={`Team Members (${teamSizeLabel(event.teamSize)})`}
                name="teamMembers"
                placeholder="Comma separated names"
              />
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full rounded-full shadow-[var(--shadow-brand)]"
          >
            {submitting ? "Confirming..." : "Confirm Registration"}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" /> Free registration · No payment required
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 rounded-xl"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}