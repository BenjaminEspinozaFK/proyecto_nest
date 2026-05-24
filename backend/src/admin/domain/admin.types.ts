export interface Admin {
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
  deletedAt?: Date | null;
}

export type AdminPublic = Omit<Admin, 'password'>;

export interface AdminAuth {
  id: string;
  password: string;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  name?: string;
  rut: string;
  phone?: string;
  role?: string;
}

export interface UpdateAdminInput {
  email?: string;
  password?: string;
  name?: string;
  rut?: string;
  phone?: string;
  role?: string;
}

export interface AdminUserList {
  id: string;
  email: string;
  name: string | null;
  rut: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserCreated {
  id: string;
  email: string;
  name: string | null;
  rut: string;
  phone: string | null;
  role: string;
  requirePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserRecent {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
  role: string;
}

export interface AdminUserLogin {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  lastLogin: Date | null;
}

export interface UsersByRoleItem {
  role: string;
  count: number;
}

export interface CreateUserByAdminInput {
  email: string;
  name: string | null;
  rut: string;
  phone?: string | null;
  role: 'user' | 'admin';
  password: string;
  requirePasswordChange: boolean;
}

export interface UpdateUserByAdminInput {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
}
