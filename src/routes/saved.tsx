import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppShell } from "@/components/campusly/AppShell";
import { EventCard } from "@/components/campusly/EventCard";
import { EmptyState } from "@/components/campusly/EmptyState";
import { EventGridSkeleton } from "@/components/campusly/Skeletons";
import { useCampus } from "@/hooks/useCampus";
import { eventService } from "@/services/eventService";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Events — CAMPUSLY" },
      { name: "description", content: "Campus events you bookmarked to check out later." },
      { property: "og:title", content: "Saved Events — CAMPUSLY" },
      { property: "og:description", content: "Your bookmarked hackathons, workshops and campus events." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { savedEventIds, ready } = useCampus();
  const saved = savedEventIds
    .map((id) => eventService.getEventByIdSync(id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Saved Events</h1>
        <p className="mt-2 text-muted-foreground">Your shortlist of things happening on campus.</p>

        <div className="mt-8">
          {!ready ? (
            <EventGridSkeleton count={4} />
          ) : saved.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved events yet."
              description="Save events you're interested in and find them here."
              actionLabel="Discover Events"
              actionTo="/events"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saved.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}