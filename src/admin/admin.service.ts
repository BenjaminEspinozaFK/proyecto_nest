import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';

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

  async createAdmin(admin: CreateAdminDto) {
    // Busca si ya existe un administrador con el mismo nombre
    const adminExists = await this.prisma.admin.findUnique({
      where: { name: admin.name },
    });

    // Si se encuentra un admin, lanza una excepción
    if (adminExists) {
      throw new ConflictException(
        `Administrador con nombre ${admin.name} ya existe`,
      );
    }

    const newAdmin = await this.prisma.admin.create({
      data: admin,
    });

    return newAdmin;
  }

  async updateAdmin(id: string, adminData: UpdateAdminDto) {
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!adminExists) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }
    const updatedAdmin = await this.prisma.admin.update({
      where: { id },
      data: adminData,
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
}
