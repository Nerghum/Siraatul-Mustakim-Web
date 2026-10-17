export type NoticeItem = {
  id: string;
  _id?: string;
  title: string;
  date: string;
  description?: string;
  excerpt?: string;
  image?: string | null;
  timeLabel?: string;
  category?: string;
  styleType?: "green" | "amber";
  createdAt?: string;
  updatedAt?: string;
};

export type NoticeEventItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  href: string;
};
