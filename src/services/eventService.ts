import { events as mockEvents } from "@/data/events";
import type { CampusEvent, EventCategory } from "@/types";

/**
 * Mock event service.
 * Swap the bodies for REST calls later — the signatures stay the same.
 */

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

export type DateFilter = "any" | "today" | "tomorrow" | "week" | "month";

export interface EventQuery {
  search?: string;
  category?: EventCategory | "All";
  dateFilter?: DateFilter;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function matchesDateFilter(event: CampusEvent, filter: DateFilter, now = new Date()) {
  if (filter === "any") return true;
  const today = startOfDay(now);
  const eventDay = startOfDay(new Date(`${event.date}T00:00:00`));
  const diffDays = Math.round((eventDay.getTime() - today.getTime()) / 86_400_000);
  if (filter === "today") return diffDays === 0;
  if (filter === "tomorrow") return diffDays === 1;
  if (filter === "week") return diffDays >= 0 && diffDays <= 7;
  return diffDays >= 0 && diffDays <= 31;
}

function byDate(a: CampusEvent, b: CampusEvent) {
  return a.date.localeCompare(b.date);
}

export const eventService = {
  async getEvents(query: EventQuery = {}): Promise<CampusEvent[]> {
    await delay();
    const search = query.search?.trim().toLowerCase() ?? "";
    return mockEvents
      .filter((event) => (query.category && query.category !== "All" ? event.category === query.category : true))
      .filter((event) => matchesDateFilter(event, query.dateFilter ?? "any"))
      .filter((event) =>
        search
          ? [event.title, event.subtitle, event.category, event.department, event.organizer, event.venue]
              .join(" ")
              .toLowerCase()
              .includes(search)
          : true,
      )
      .sort(byDate);
  },

  async getEventById(id: string): Promise<CampusEvent | null> {
    await delay(180);
    return mockEvents.find((event) => event.id === id) ?? null;
  },

  async getFeaturedEvent(): Promise<CampusEvent> {
    await delay(120);
    return mockEvents.find((event) => event.featured) ?? mockEvents[0]!;
  },

  async getTrendingEvents(): Promise<CampusEvent[]> {
    await delay(200);
    return mockEvents.filter((event) => event.trending && event.status === "upcoming").sort(byDate);
  },

  async getUpcomingEvents(dateFilter: DateFilter = "any"): Promise<CampusEvent[]> {
    await delay(200);
    return mockEvents
      .filter((event) => event.status === "upcoming")
      .filter((event) => matchesDateFilter(event, dateFilter))
      .sort(byDate);
  },

  async searchEvents(term: string): Promise<CampusEvent[]> {
    return this.getEvents({ search: term });
  },

  getEventByIdSync(id: string): CampusEvent | null {
    return mockEvents.find((event) => event.id === id) ?? null;
  },
};