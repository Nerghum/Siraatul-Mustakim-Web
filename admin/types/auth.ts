export interface SigninRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  name: string;
  id: string;
  phone?: string;
  email?: string;
  role?: 'user' | 'admin' | 'moderator' | 'mufti';
}
