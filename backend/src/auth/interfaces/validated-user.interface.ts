export interface ValidatedUser {
  id: string;
  email: string;
  name: string | null;
  age: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
