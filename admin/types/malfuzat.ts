export interface Malfuzat {
  _id: string;
  mode: "text" | "audio";
  title: string;
  category: string;
  author: string;
  description: string;
  audioUrl: string | null;
  audioFormat: string | null;
  audioDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMalfuzatPayload {
  mode: "text" | "audio";
  title: string;
  category: string;
  author?: string;
  description?: string;
  audio?: File;
}

export interface UpdateMalfuzatPayload {
  title?: string;
  category?: string;
  author?: string;
  description?: string;
  mode?: "text" | "audio";
  audio?: File;
}
