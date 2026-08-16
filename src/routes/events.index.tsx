import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SearchX } from "lucide-react";
import { AppShell } from "@/components/campusly/AppShell";
import { CategoryStrip } from "@/components/campusly/CategoryStrip";
import { EventCard } from "@/components/campusly/EventCard";
import { EventGridSkeleton } from "@/components/campusly/Skeletons";
import { EmptyState } from "@/components/campusly/EmptyState";
import { eventService, type DateFilter } from "@/services/eventService";
import type { EventCategory } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { category?: EventCategory | "All" } => ({
    category: (search["category"] as EventCategory | "All") ?? undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Events — CAMPUSLY" },
      {
        name: "description",
        content: "Browse every hackathon, workshop, contest and cultural event happening on campus.",
      },
      { property: "og:title", content: "Explore Events — CAMPUSLY" },
      {
        property: "og:description",
        content: "Filter campus events by category and date, and register in seconds.",
      },
    ],
  }),
  component: ExplorePage,
});

const dateFilters: Array<{ value: DateFilter; label: string }> = [
  { value: "any", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
];

function ExplorePage() {
  const { category: initialCategory } = Route.useSearch();
  const [category, setCategory] = useState<EventCategory | "All">(initialCategory ?? "All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [term, setTerm] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["events", category, dateFilter],
    queryFn: () => eventService.getEvents({ category, dateFilter }),
  });

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    const list = data ?? [];
    if (!q) return list;
    return list.filter((event) =>
      [event.title, event.subtitle, event.category, event.department, event.venue]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data, term]);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Explore Events</h1>
        <p className="mt-2 text-muted-foreground">
          {results.length} event{results.length === 1 ? "" : "s"} across campus
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search events..."
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-6 space-y-3">
          <CategoryStrip value={category} onChange={setCategory} />
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
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
        </div>

        <div className="mt-8">
          {isPending ? (
            <EventGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No events matched your search."
              description="Try another keyword, category or date filter."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}