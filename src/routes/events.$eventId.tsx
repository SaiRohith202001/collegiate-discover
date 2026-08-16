import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Building2,
  Timer,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/campusly/AppShell";
import { EventDetailSkeleton } from "@/components/campusly/Skeletons";
import { SaveButton } from "@/components/campusly/SaveButton";
import { Button } from "@/components/ui/button";
import { eventService } from "@/services/eventService";
import { formatLongDate, formatShortDate, teamSizeLabel } from "@/utils/format";
import { useCampus } from "@/hooks/useCampus";
import type { CampusEvent } from "@/types";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = eventService.getEventByIdSync(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Event unavailable — CAMPUSLY" }, { name: "robots", content: "noindex" }] };
    }
    const { event } = loaderData;
    const description = `${event.subtitle} · ${formatLongDate(event.date)} · ${event.venue}`;
    return {
      meta: [
        { title: `${event.title} — CAMPUSLY` },
        { name: "description", content: description },
        { property: "og:title", content: `${event.title} — CAMPUSLY` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const { data, isPending } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventService.getEventById(eventId),
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {isPending || !data ? <EventDetailSkeleton /> : <EventDetail event={data} />}
      </div>
    </AppShell>
  );
}

function EventDetail({ event }: { event: CampusEvent }) {
  const { isRegistered } = useCampus();
  const registered = isRegistered(event.id);

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatLongDate(event.date) },
    { icon: Clock, label: "Time", value: event.time },
    { icon: MapPin, label: "Venue", value: event.venue },
    { icon: Building2, label: "Organized By", value: event.organizer },
    { icon: Timer, label: "Registration Deadline", value: formatShortDate(event.registrationDeadline) },
    { icon: UsersRound, label: "Team Size", value: teamSizeLabel(event.teamSize) },
  ];

  return (
    <div>
      <Link
        to="/events"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to events
      </Link>

      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={event.image}
          alt={event.title}
          width={1600}
          height={900}
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />
        <div className="absolute right-4 top-4">
          <SaveButton eventId={event.id} title={event.title} />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {event.category}
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{event.title}</h1>
          <p className="mt-2 text-muted-foreground">{event.organizer}</p>

          <div className="mt-8 grid gap-5 rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex gap-3">
                <fact.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {fact.label}
                  </p>
                  <p className="mt-0.5 font-medium">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Section title="About This Event">
            <p className="text-muted-foreground">{event.about}</p>
          </Section>

          <Section title="Event Highlights">
            <ul className="grid gap-2 sm:grid-cols-2">
              {event.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Rules">
            <ul className="space-y-2">
              {event.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {rule}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Eligibility">
            <p className="text-muted-foreground">{event.eligibility}</p>
          </Section>

          <Section title="Venue">
            <div className="text-muted-foreground">
              {event.venueDetail.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">Registration closes</p>
            <p className="text-xl font-semibold">{formatLongDate(event.registrationDeadline)}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4 text-primary" />
              {event.registeredParticipants} students already registered
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, Math.round((event.registeredParticipants / event.maxParticipants) * 100))}%`,
                }}
              />
            </div>
            <RegisterCta event={event} registered={registered} className="mt-6 w-full" />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free for all students · No payment required
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+64px)] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Registration Open</p>
            <p className="truncate text-sm font-semibold">
              Closes {formatShortDate(event.registrationDeadline)}
            </p>
          </div>
          <RegisterCta event={event} registered={registered} className="ml-auto flex-1" />
        </div>
      </div>
    </div>
  );
}

function RegisterCta({
  event,
  registered,
  className,
}: {
  event: CampusEvent;
  registered: boolean;
  className?: string;
}) {
  if (registered) {
    return (
      <Button asChild variant="secondary" size="lg" className={`rounded-full ${className ?? ""}`}>
        <Link to="/registrations">You're Registered · View</Link>
      </Button>
    );
  }
  return (
    <Button asChild size="lg" className={`rounded-full shadow-[var(--shadow-brand)] ${className ?? ""}`}>
      <Link to="/register/$eventId" params={{ eventId: event.id }}>
        Register Now
      </Link>
    </Button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}