"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEventsSchedule,
  deleteEventsSchedule,
  getEventsScheduleById,
  getEventsSchedules,
  updateEventsSchedule,
} from "@/services/events-schedule";
import type {
  CreateEventsSchedulePayload,
  UpdateEventsSchedulePayload,
} from "@/types/event-schedule";

export function useEventsSchedules(q?: string) {
  return useQuery({
    queryKey: ["events-schedules", q || ""],
    queryFn: async () => {
      const res = await getEventsSchedules(q);
      return res.data;
    },
  });
}

export function useEventsSchedule(id: string) {
  return useQuery({
    queryKey: ["events-schedule", id],
    queryFn: async () => {
      const res = await getEventsScheduleById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateEventsSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventsSchedulePayload) => createEventsSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-schedules"] });
    },
  });
}

export function useUpdateEventsSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventsSchedulePayload }) =>
      updateEventsSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-schedules"] });
    },
  });
}

export function useDeleteEventsSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventsSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-schedules"] });
    },
  });
}
