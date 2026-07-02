export interface User {
  id: string;
  email: string;
  name: string;
  rut: string;
  phone?: string;
  banco?: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
  requirePasswordChange?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  rut: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

export interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (
    email: string,
    password: string,
    role: string,
  ) => Promise<{ requires2FA?: boolean }>;
  loginWith2FA: (
    email: string,
    password: string,
    role: string,
    code: string,
  ) => Promise<void>;
  register: (data: RegisterRequest) => Promise<string>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  isLoading: boolean;
  error: string | null;
}
