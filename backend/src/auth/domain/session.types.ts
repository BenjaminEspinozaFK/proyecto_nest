export interface Session {
  id: string;
  userId: string | null;
  adminId: string | null;
  refreshToken: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
}

export interface CreateSessionInput {
  userId?: string;
  adminId?: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}
