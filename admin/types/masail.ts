export interface Masail {
  _id: string;
  title: string;
  description: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMasailPayload {
  title: string;
  description: string;
  category?: string;
}

export type UpdateMasailPayload = Partial<CreateMasailPayload>;

export interface MasailCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  count?: number;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
