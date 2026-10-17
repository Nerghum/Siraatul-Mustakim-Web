export interface Notice {
  _id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticePayload {
  title: string;
  date: string;
  description: string;
  image?: File | null;
}

export interface UpdateNoticePayload {
  title?: string;
  date?: string;
  description?: string;
  image?: File | null;
}
