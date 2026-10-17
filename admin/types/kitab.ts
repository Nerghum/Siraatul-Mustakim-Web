export interface KitabChapter {
  _id?: string;
  title: string;
  order: number;
  content: string;
}

export interface Kitab {
  _id: string;
  title: string;
  author: string;
  status: 'published' | 'draft';
  bookType?: 'pdf' | 'text';
  pdf?: string;
  content?: string;
  coverImages?: string;
  chapters?: KitabChapter[];
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKitabPayload {
  title: string;
  author: string;
  status: 'published' | 'draft';
  bookType?: 'pdf' | 'text';
  pdf?: File | null;
  coverImages?: File | null;
  content?: string;
  chapters?: { _id?: string; title: string; order: number; content?: string }[];
}

export type UpdateKitabPayload = Partial<CreateKitabPayload>;
