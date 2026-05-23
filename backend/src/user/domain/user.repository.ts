import { CreateUserInput, UpdateUserInput, User, UserPublic } from './user.types';

export interface UserRepositoryPort {
  findAll(): Promise<UserPublic[]>;
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
