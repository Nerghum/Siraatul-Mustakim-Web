export interface User {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "user" | "writer" | "admin" | "moderator" | "mufti";
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  admin: number;
  moderator: number;
  mufti: number;
  user: number;
  writer: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: "user" | "writer" | "admin" | "moderator" | "mufti";
}

export interface CreateUserPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: "user" | "writer" | "admin" | "moderator" | "mufti";
}
