import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserPublic,
} from './user.types';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export interface UserRepositoryPort {
  findAll(page: number, limit: number): Promise<PaginatedResult<UserPublic>>;
  findById(id: string): Promise<User | null>;
  findByIdPublic(id: string): Promise<UserPublic | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<UserPublic>;
  update(id: string, data: UpdateUserInput): Promise<UserPublic>;
  updateAvatar(id: string, avatar: string): Promise<UserPublic>;
  updatePassword(
    id: string,
    password: string,
    requirePasswordChange: boolean,
  ): Promise<UserPublic>;
  delete(id: string): Promise<void>;
}
