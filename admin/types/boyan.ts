export interface Boyan {
  _id: string;
  title: string;
  category: string;
  author: string;
  location?: string;
  mediaType?: "audio" | "video";
  youtubeUrl?: string;
  audioUrl: string | null;
  audioFormat: string | null;
  audioDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoyanPayload {
  title: string;
  category: string;
  author?: string;
  location?: string;
  mediaType?: "audio" | "video";
  youtubeUrl?: string;
  audio?: File;
}

export interface UpdateBoyanPayload {
  title?: string;
  category?: string;
  author?: string;
  location?: string;
  mediaType?: "audio" | "video";
  youtubeUrl?: string;
  audio?: File;
}

export interface BoyanCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoyanCategoryPayload {
  name: string;
  slug: string;
}

export type UpdateBoyanCategoryPayload = Partial<CreateBoyanCategoryPayload>;
