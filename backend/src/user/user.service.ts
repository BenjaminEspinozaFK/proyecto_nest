import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return userFound;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    // Verificar si ya existe un usuario con el mismo email
    const userExists = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (userExists) {
      throw new ConflictException(`Usuario con email ${user.email} ya existe`);
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });

    return newUser;
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se proporciona una nueva contraseña, encriptarla
    const updateData = { ...userData };
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return updatedUser;
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `Usuario con ID ${id} eliminado` };
  }

  async updateAvatar(userId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return { user: userWithoutPassword, avatar: avatarUrl };
  }
}
