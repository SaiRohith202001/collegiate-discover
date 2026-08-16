import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/campusly/AppShell";
import { CategoryStrip } from "@/components/campusly/CategoryStrip";
import { EventCard } from "@/components/campusly/EventCard";
import { EventGridSkeleton } from "@/components/campusly/Skeletons";
import { EmptyState } from "@/components/campusly/EmptyState";
import { SearchDialog } from "@/components/campusly/SearchDialog";
import { Button } from "@/components/ui/button";
import { eventService, type DateFilter } from "@/services/eventService";
import { brand } from "@/config/brand";
import { formatLongDate, formatRelativeDay } from "@/utils/format";
import type { EventCategory } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAMPUSLY — What's happening on campus?" },
      {
        name: "description",
        content:
          "Discover hackathons, workshops, competitions and cultural events happening on your campus, and register in seconds.",
      },
      { property: "og:title", content: "CAMPUSLY — What's happening on campus?" },
      {
        property: "og:description",
        content: "Everything happening on your campus, in one place. Discover. Participate. Experience.",
      },
    ],
  }),
  component: HomePage,
});

const dateFilters: Array<{ value: DateFilter; label: string }> = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function HomePage() {
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("week");
  const [searchOpen, setSearchOpen] = useState(false);

  const featured = useQuery({ queryKey: ["featured"], queryFn: () => eventService.getFeaturedEvent() });
  const trending = useQuery({
    queryKey: ["trending", category],
    queryFn: () => eventService.getEvents({ category, dateFilter: "any" }),
  });
  const upcoming = useQuery({
    queryKey: ["upcoming", dateFilter],
    queryFn: () => eventService.getUpcomingEvents(dateFilter),
  });

  return (
    <AppShell>
      {/* Hero */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            {brand.tagline}
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            What's happening on campus?
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover hackathons, workshops, competitions, cultural events and everything happening
            around you.
          </p>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mt-7 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-border bg-background px-5 py-4 text-left text-muted-foreground shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
          >
            <Search className="size-5 shrink-0" />
            <span className="truncate">Search events, clubs or activities...</span>
          </button>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6">
        {featured.data && (
          <Link
            to="/events/$eventId"
            params={{ eventId: featured.data.id }}
            className="group relative block overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]"
          >
            <img
              src={featured.data.image}
              alt={featured.data.title}
              width={1600}
              height={900}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:aspect-[21/9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
                Featured
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">
                {featured.data.title}
              </h2>
              <p className="mt-2 max-w-xl text-white/85">{featured.data.subtitle}</p>
              <p className="mt-1 text-sm text-white/70">{featured.data.organizer}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {formatLongDate(featured.data.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {featured.data.venue}
                </span>
              </div>
              <Button size="lg" className="mt-6 rounded-full shadow-[var(--shadow-brand)]">
                View Event
              </Button>
            </div>
          </Link>
        )}
      </section>

      {/* Trending */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Trending on Campus</h2>
            <p className="mt-1 text-muted-foreground">{brand.supporting}</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-6">
          <CategoryStrip value={category} onChange={setCategory} />
        </div>

        <div className="mt-7">
          {trending.isPending ? (
            <EventGridSkeleton count={4} />
          ) : trending.data && trending.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trending.data.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No events in this category yet."
              description="Pick another category to see what's coming up on campus."
            />
          )}
        </div>
      </section>

      {/* Upcoming */}
      <section className="border-t border-border/60 bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Upcoming Events</h2>
          <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {dateFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setDateFilter(filter.value)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  dateFilter === filter.value
                    ? "border-primary bg-brand-soft font-medium text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-7">
            {upcoming.isPending ? (
              <EventGridSkeleton count={4} />
            ) : upcoming.data && upcoming.data.length > 0 ? (
              <ul className="divide-y divide-border rounded-3xl bg-background p-2 shadow-[var(--shadow-card)]">
                {upcoming.data.slice(0, 6).map((event) => (
                  <li key={event.id}>
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: event.id }}
                      className="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-secondary"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        className="size-16 shrink-0 rounded-2xl object-cover sm:size-20"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {formatRelativeDay(event.date)}
                        </p>
                        <p className="truncate font-semibold">{event.title}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {event.time.split("–")[0]?.trim()} · {event.venue} · {event.department}
                        </p>
                      </div>
                      <span className="hidden text-sm font-semibold text-primary sm:block">View →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled in this window."
                description="Try a wider date range to see more campus events."
              />
            )}
          </div>
        </div>
      </section>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </AppShell>
  );
}