export interface Faq {
  _id: string;
  question: {
    author: string;
    district: string;
    question: string;
  };
  status: "" | "pending" | "answered";
  answer: FaqAnswer | null;
  createdAt: string;
  updatedAt: string;
}

export interface FaqAnswer {
  _id?: string;
  author: string;
  category: string;
  answer: string;
  timestamp: string;
  userId?: string;
}

export interface CreateFaqPayload {
  author: string;
  district?: string;
  question: string;
}

export interface AnswerFaqPayload {
  status?: "" | "pending" | "answered";
  userId?: string;
  author: string;
  category: string;
  answer: string;
}

export interface FaqFilters {
  authors: string[];
  districts: string[];
  statuses: string[];
}

export interface MuftiUser {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
}