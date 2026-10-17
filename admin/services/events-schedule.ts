import apiClient from "./api-client";
import type {
  EventsSchedule,
  CreateEventsSchedulePayload,
  UpdateEventsSchedulePayload,
} from "@/types/event-schedule";

export const getEventsSchedules = (q?: string) =>
  apiClient.get<EventsSchedule[]>("/events-schedule", {
    params: q ? { q } : undefined,
  });

export const getEventsScheduleById = (id: string) =>
  apiClient.get<EventsSchedule>(`/events-schedule/${id}`);

function toPayload(data: Record<string, unknown>) {
  const hasFile = Object.values(data).some(
    (val) => typeof File !== "undefined" && val instanceof File,
  );
  if (!hasFile) return { body: data, headers: {} };

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof File !== "undefined" && value instanceof File) {
      formData.append(key, value);
    } else if (key === "contacts" && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return {
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  };
}

export const createEventsSchedule = (data: CreateEventsSchedulePayload) => {
  const { body, headers } = toPayload(data as unknown as Record<string, unknown>);
  return apiClient.post<EventsSchedule>("/events-schedule/create", body, { headers });
};

export const updateEventsSchedule = (
  id: string,
  data: UpdateEventsSchedulePayload,
) => {
  const { body, headers } = toPayload(data as unknown as Record<string, unknown>);
  return apiClient.patch<EventsSchedule>(`/events-schedule/${id}`, body, { headers });
};

export const deleteEventsSchedule = (id: string) =>
  apiClient.delete<{ message: string }>(`/events-schedule/${id}`);
