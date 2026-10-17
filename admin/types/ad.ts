export interface AdPlacementOption {
  id: string;
  label: string;
  description: string;
}

export const AD_PLACEMENTS: AdPlacementOption[] = [
  {
    id: "all",
    label: "সব জায়গায় (All Pages)",
    description: "সব পেজের সাইডবার ও অ্যাড প্লেসমেন্টে প্রদর্শন হবে",
  },
  {
    id: "home",
    label: "হোম পেজ (Home Page)",
    description: "মূল হোম পেজে বিজ্ঞাপন স্লটে প্রদর্শন হবে",
  },
  {
    id: "books",
    label: "কিতাব / বই (Books)",
    description: "কিতাব লিস্টিং ও ডিটেইল পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "bayan",
    label: "বয়ান (Bayan)",
    description: "বয়ান লিস্টিং ও অডিও/ভিডিও পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "bayan_schedule",
    label: "বয়ান শিডিউল (Bayan Schedule)",
    description: "বয়ান শিডিউল পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "dua",
    label: "দুয়া ও জিকির (Dua)",
    description: "দুয়া লিস্টিং ও ডিটেইল পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "malfuzat",
    label: "মালফুজাত (Malfuzat)",
    description: "মালফুজাত লিস্টিং ও ডিটেইল পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "videos",
    label: "ভিডিও (Videos)",
    description: "ভিডিও লেকচার পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "masail",
    label: "মাসায়েল ও প্রশ্নোত্তর (Masail & QA)",
    description: "মাসায়েল ও প্রশ্নোত্তর পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "articles",
    label: "আর্টিকেল (Articles)",
    description: "আর্টিকেল ও লেখকের পাতা পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "notice",
    label: "নোটিশ (Notice)",
    description: "নোটিশ লিস্টিং ও নোটিশ ডিটেইল পেজের সাইডবারে প্রদর্শন হবে",
  },
  {
    id: "contributors",
    label: "কন্ট্রিবিউটর (Contributors)",
    description: "কন্ট্রিবিউটর ও সহায়তা পেজের সাইডবারে প্রদর্শন হবে",
  },
];

export interface Ad {
  _id: string;
  title: string;
  description?: string;
  image?: string | null;
  link?: string;
  buttonText?: string;
  placements: string[];
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  priority?: number;
  clicks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdPayload {
  title: string;
  description?: string;
  link?: string;
  buttonText?: string;
  placements: string[];
  isActive?: boolean;
  priority?: number;
  image?: File | null;
}

export interface UpdateAdPayload {
  title?: string;
  description?: string;
  link?: string;
  buttonText?: string;
  placements?: string[];
  isActive?: boolean;
  priority?: number;
  image?: File | null;
}
