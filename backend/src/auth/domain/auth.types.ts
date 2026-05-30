export interface AuthAdmin {
  id: string;
  email: string;
  password: string;
  name: string | null;
  rut: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  name: string | null;
  rut: string;
  phone: string | null;
  role: string;
  avatar: string | null;
  lastLogin: Date | null;
  requirePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthAdminProfile {
  id: string;
  email: string;
  name: string | null;
  rut: string;
  role: string;
  avatar: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string | null;
  rut: string;
  role: string;
  avatar: string | null;
  lastLogin: Date | null;
  requirePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthUserInput {
  email: string;
  password: string;
  name?: string;
  rut: string;
  phone?: string;
  role?: string;
}

export interface ResetTokenTarget {
  id: string;
}
