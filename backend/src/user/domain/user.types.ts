export interface User {
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
  deletedAt: Date | null;
}

export type UserPublic = Omit<User, 'password' | 'deletedAt'>;

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  rut: string;
  phone?: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
}
