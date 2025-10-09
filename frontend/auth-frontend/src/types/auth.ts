export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  role: string;
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
  age: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: string) => Promise<void>; // Agregar role
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}
