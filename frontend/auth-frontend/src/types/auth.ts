export interface User {
  id: string;
  email: string;
  name: string;
  rut: string;
  phone?: string;
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
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: string) => Promise<void>; // Agregar role
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
  isLoading: boolean;
  error: string | null;
}
