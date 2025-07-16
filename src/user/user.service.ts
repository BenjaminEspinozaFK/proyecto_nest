import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAdminDto } from 'src/admin/dto/update-admin.dto';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  age?: number;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'User 1',
      email: 'user1@example.com',
      password: 'password1',
      age: 25,
    },
    {
      id: 2,
      name: 'User 2',
      email: 'user2@example.com',
      password: 'password2',
      age: 30,
    },
  ];

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | null {
    const userFound = this.users.find((user) => user.id === id);
    if (!userFound) {
      throw new ConflictException(`Usuario con ID ${id} no encontrado`);
    }
    return userFound;
  }

  createUser(user: CreateUserDto) {
    // Verificar si ya existe un usuario con el mismo email
    const userExists = this.users.find(
      (existingUser) => existingUser.email === user.email,
    );

    if (userExists) {
      throw new ConflictException(`Usuario con email ${user.email} ya existe`);
    }

    // Generar nuevo ID
    const newId =
      this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;

    const newUser: User = { ...user, id: newId };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, userData: Partial<UpdateAdminDto>) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new ConflictException(`Usuario con ID ${id} no encontrado`);
    }
    const updatedUser = { ...this.users[userIndex], ...userData };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  deleteUser(id: number): { message: string } {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return { message: `Usuario con ID ${id} eliminado` };
    }
    return { message: `Usuario con ID ${id} no encontrado` };
  }
}
