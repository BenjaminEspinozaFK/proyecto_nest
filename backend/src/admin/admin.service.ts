import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAdmins() {
    return await this.prisma.admin.findMany();
  }

  async getAdminById(id: string) {
    const adminFound = await this.prisma.admin.findUnique({
      where: { id },
    });

    //Si admin es null, lanza un error
    if (!adminFound) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }
    return adminFound;
  }

  async createAdmin(admin: CreateAdminDto): Promise<Admin> {
    // Busca si ya existe un administrador con el mismo email
    const adminExists = await this.prisma.admin.findUnique({
      where: { email: admin.email },
    });

    // Si se encuentra un admin, lanza una excepción
    if (adminExists) {
      throw new ConflictException(
        `Administrador con email ${admin.email} ya existe`,
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const newAdmin = await this.prisma.admin.create({
      data: {
        ...admin,
        password: hashedPassword,
      },
    });

    return newAdmin;
  }

  async updateAdmin(id: string, adminData: UpdateAdminDto): Promise<Admin> {
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!adminExists) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }

    // Si se proporciona una nueva contraseña, encriptarla
    const updateData = { ...adminData };
    if (adminData.password) {
      updateData.password = await bcrypt.hash(adminData.password, 10);
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
    });
    return updatedAdmin;
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!adminExists) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: `Admin con ID ${id} eliminado` };
  }
  async getAllUsers() {
    return await this.prisma.user.findMany();
  }
}
