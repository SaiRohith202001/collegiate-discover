import { events as mockEvents } from "@/data/events";
import type { CampusEvent, EventCategory } from "@/types";

/**
 * Event service client.
 * Uses the Event Microservice (MongoDB-backed) when VITE_EVENT_SERVICE_URL is set,
 * otherwise falls back to local mock data for offline UI development.
 */

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));
const apiUrl = import.meta.env.VITE_EVENT_SERVICE_URL?.replace(/\/$/, "");

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

async function fetchEventsFromService(query: EventQuery): Promise<CampusEvent[]> {
  const params = new URLSearchParams();
  if (query.category && query.category !== "All") params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  const response = await fetch(`${apiUrl}/events${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Event Service could not load events");
  const docs = (await response.json()) as CampusEvent[];
  return docs.filter((event) => matchesDateFilter(event, query.dateFilter ?? "any"));
}

export const eventService = {
  async getEvents(query: EventQuery = {}): Promise<CampusEvent[]> {
    if (apiUrl) {
      return fetchEventsFromService(query);
    }
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
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/events/${encodeURIComponent(id)}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Event Service could not load the event");
      return (await response.json()) as CampusEvent;
    }
    await delay(180);
    return mockEvents.find((event) => event.id === id) ?? null;
  },

  async getFeaturedEvent(): Promise<CampusEvent> {
    if (apiUrl) {
      const events = await fetchEventsFromService({});
      return events.find((event) => event.featured) ?? events[0]!;
    }
    await delay(120);
    return mockEvents.find((event) => event.featured) ?? mockEvents[0]!;
  },

  async getTrendingEvents(): Promise<CampusEvent[]> {
    if (apiUrl) {
      const events = await fetchEventsFromService({});
      return events.filter((event) => event.trending && event.status === "upcoming").sort(byDate);
    }
    await delay(200);
    return mockEvents.filter((event) => event.trending && event.status === "upcoming").sort(byDate);
  },

  async getUpcomingEvents(dateFilter: DateFilter = "any"): Promise<CampusEvent[]> {
    if (apiUrl) {
      const events = await fetchEventsFromService({ dateFilter });
      return events.filter((event) => event.status === "upcoming").sort(byDate);
    }
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