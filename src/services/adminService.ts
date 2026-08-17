import type { EventStat } from "@/types";
import { apiRequest } from "./apiClient";

type StatsResponse = { stats: EventStat[] };

type ScanSuccessResponse = {
  message: string;
  registrationId: string;
  fullName: string;
  eventId: string;
  scannedAt: string;
};

export const adminService = {
  async getStats(): Promise<EventStat[]> {
    const data = await apiRequest<StatsResponse>("/admin/stats");
    return data.stats;
  },

  async scanQr(registrationId: string): Promise<ScanSuccessResponse> {
    return apiRequest<ScanSuccessResponse>("/admin/scan", {
      method: "POST",
      body: JSON.stringify({ registrationId }),
    });
  },
};
