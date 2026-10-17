export interface Article {
  _id: string;
  title: string;
  content: string;
  author?: {
    _id: string;
    name: string;
  };
  status: "draft" | "published" | "pending";
  tags: string[];
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  status: "draft" | "published" | "pending";
  tags?: string; // stringified array
  image?: File | null;
}

export interface UpdateArticlePayload {
  title?: string;
  content?: string;
  status?: "draft" | "published" | "pending";
  tags?: string;
  image?: File | null;
}
