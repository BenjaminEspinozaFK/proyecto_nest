import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRepositoryPort } from './domain/user.repository';
import { USER_REPOSITORY } from './user.tokens';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: UserRepositoryPort,
  ) {}

  async getUsers() {
    return this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const userFound = await this.userRepository.findByIdPublic(id);

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return userFound;
  }

  async createUser(user: CreateUserDto) {
    const userExists = await this.userRepository.findByEmail(user.email);

    if (userExists) {
      throw new ConflictException(`Usuario con email ${user.email} ya existe`);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    return this.userRepository.create({
      ...user,
      password: hashedPassword,
    });
  }

  async updateUser(id: string, userData: UpdateUserDto) {
    const userExists = await this.userRepository.findById(id);

    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const updateData = { ...userData };
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.userRepository.update(id, updateData);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const userExists = await this.userRepository.findById(id);

    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.userRepository.delete(id);

    return { message: `Usuario con ID ${id} eliminado` };
  }

  async updateAvatar(userId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedUser = await this.userRepository.updateAvatar(
      userId,
      avatarUrl,
    );

    return { user: updatedUser, avatar: avatarUrl };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    const updatedUser = await this.userRepository.updatePassword(
      userId,
      hashedPassword,
      false,
    );

    return {
      message: 'Contraseña actualizada exitosamente',
      user: updatedUser,
    };
  }
}
