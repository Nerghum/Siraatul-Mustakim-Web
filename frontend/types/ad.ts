export interface AdvertisementItem {
  _id: string;
  title: string;
  description?: string;
  image?: string | null;
  link?: string;
  buttonText?: string;
  placements: string[];
  isActive: boolean;
  priority?: number;
  clicks?: number;
  createdAt?: string;
  updatedAt?: string;
}
