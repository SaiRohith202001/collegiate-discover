import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, TrendingUp, SearchX } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { events, trendingSearches } from "@/data/events";
import { formatShortDate } from "@/utils/format";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return events
      .filter((event) =>
        [event.title, event.subtitle, event.category, event.department, event.organizer, event.venue]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [term]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-24 max-w-xl translate-y-0 gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">Search events</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="size-5 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search events, clubs or activities"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {!term.trim() ? (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3.5" /> Trending searches
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trendingSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTerm(item)}
                    className="rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-brand-soft hover:text-primary"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <SearchX className="size-8 text-muted-foreground" />
              <p className="mt-4 font-semibold">No events found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try searching for another event or category.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((event) => (
                <li key={event.id}>
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: event.id }}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-secondary"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      loading="lazy"
                      className="size-14 rounded-xl object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{event.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {event.category} · {formatShortDate(event.date)} · {event.venue}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}