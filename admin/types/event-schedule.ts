export interface EventContact {
  _id?: string;
  name: string;
  phone: string;
}

export interface EventsSchedule {
  _id: string;
  districtName: string;
  date: string;
  time: string;
  location: string;
  contact?: string;
  path: string;
  googleMapsUrl: string;
  title?: string;
  timeText?: string;
  contacts?: EventContact[];
  type?: "amber" | "green";
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventsSchedulePayload {
  districtName: string;
  date: string;
  time: string;
  location: string;
  path: string;
  googleMapsUrl: string;
  title?: string;
  timeText?: string;
  contacts?: { name: string; phone: string }[];
  type?: "amber" | "green";
  image?: string | File | null;
}

export interface UpdateEventsSchedulePayload {
  districtName?: string;
  date?: string;
  time?: string;
  location?: string;
  path?: string;
  googleMapsUrl?: string;
  title?: string;
  timeText?: string;
  contacts?: { name: string; phone: string }[];
  type?: "amber" | "green";
  image?: string | File | null;
}
