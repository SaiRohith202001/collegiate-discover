import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { CampusEvent } from "@/types";
import { formatShortDate } from "@/utils/format";
import { SaveButton } from "./SaveButton";

export function EventCard({ event }: { event: CampusEvent }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-card/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-md">
            {event.category}
          </span>
          <SaveButton eventId={event.id} title={event.title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold leading-snug">{event.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{event.department}</p>
        </div>

        <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            {formatShortDate(event.date)}
            <Clock className="ml-1 size-4 shrink-0 text-primary" />
            <span className="truncate">{event.time.split("–")[0]?.trim()}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border/70 pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {event.registeredParticipants} registered
          </span>
          <span className="text-sm font-semibold text-primary opacity-70 transition-opacity group-hover:opacity-100">
            View Event →
          </span>
        </div>
      </div>
    </Link>
  );
}