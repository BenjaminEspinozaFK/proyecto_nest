import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        avatar: true,
        lastLogin: true,
        requirePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserById(id: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        avatar: true,
        lastLogin: true,
        requirePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return userFound;
  }

  async createUser(user: CreateUserDto) {
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
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        avatar: true,
        requirePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }

  async updateUser(id: string, userData: UpdateUserDto) {
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
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        avatar: true,
        requirePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        avatar: true,
        requirePasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { user: updatedUser, avatar: avatarUrl };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Buscar el usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Actualizar la contraseña y marcar que ya no requiere cambio
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        requirePasswordChange: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        rut: true,
        phone: true,
        role: true,
        requirePasswordChange: true,
      },
    });

    return {
      message: 'Contraseña actualizada exitosamente',
      user: updatedUser,
    };
  }
}
