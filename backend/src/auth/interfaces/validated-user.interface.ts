export interface ValidatedUser {
  id: string;
  email: string;
  name: string | null;
  age: number;
  role: 'user' | 'admin';
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
}
