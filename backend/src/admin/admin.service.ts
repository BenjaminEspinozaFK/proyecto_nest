import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';

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

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalAdmins = await this.prisma.admin.count();

    // Usuarios registrados hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await this.prisma.user.count({
      where: { createdAt: { gte: today } },
    });

    // Usuarios esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const usersThisWeek = await this.prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    // Usuarios este mes
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const usersThisMonth = await this.prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    });

    // Últimos 5 usuarios registrados
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    // Últimos logins
    const recentLogins = await this.prisma.user.findMany({
      where: { lastLogin: { not: null } },
      take: 5,
      orderBy: { lastLogin: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        lastLogin: true,
      },
    });

    // Usuarios por rol
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return {
      totalUsers,
      totalAdmins,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      recentUsers,
      recentLogins,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.role,
      })),
    };
  }

  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, userData: UpdateUserByAdminDto) {
    const userFound = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Construir objeto de actualización solo con campos definidos
    const dataToUpdate: any = {};

    if (userData.email !== undefined) {
      dataToUpdate.email = userData.email;
    }
    if (userData.name !== undefined) {
      dataToUpdate.name = userData.name;
    }
    if (userData.age !== undefined) {
      dataToUpdate.age = userData.age;
    }
    if (userData.role !== undefined) {
      dataToUpdate.role = userData.role;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // No devolver password
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const userFound = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateAvatar(adminId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { avatar: avatarUrl },
    });

    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    return { admin: adminWithoutPassword, avatar: avatarUrl };
  }

  async createUser(user: CreateUserDto) {
    // Busca si ya existe un usuario con el mismo email
    const userExists = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    // Si se encuentra un user, lanza una excepción
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
        age: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }

  async searchUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }

  async bulkCreateUsersFromExcel(buffer: Buffer) {
    try {
      // Leer el archivo Excel desde el buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      const results: {
        success: Array<{ row: number; user: any }>;
        errors: Array<{ row: number; error: string; data: any }>;
        total: number;
      } = {
        success: [],
        errors: [],
        total: rows.length,
      };

      // Procesar cada fila
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Validar campos requeridos
          if (!row.email || !row.password || !row.age) {
            results.errors.push({
              row: i + 2, // +2 porque Excel empieza en 1 y primera fila es header
              error: 'Faltan campos requeridos (email, password, age)',
              data: row,
            });
            continue;
          }

          // Crear usuario
          const userData: any = {
            email: String(row.email).trim(),
            password: String(row.password).trim(),
            name: row.name ? String(row.name).trim() : '',
            age: Number(row.age),
            role:
              row.role &&
              ['user', 'admin'].includes(String(row.role).toLowerCase())
                ? (String(row.role).toLowerCase() as 'user' | 'admin')
                : 'user',
          };

          // Validar que el email no exista
          const existingUser = await this.prisma.user.findUnique({
            where: { email: userData.email },
          });

          if (existingUser) {
            results.errors.push({
              row: i + 2,
              error: `Usuario con email ${userData.email} ya existe`,
              data: row,
            });
            continue;
          }

          // Crear usuario
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          const newUser = await this.prisma.user.create({
            data: {
              email: userData.email,
              password: hashedPassword,
              name: userData.name || null,
              age: userData.age,
              role: userData.role,
            },
            select: {
              id: true,
              email: true,
              name: true,
              age: true,
              role: true,
            },
          });

          results.success.push({
            row: i + 2,
            user: newUser,
          });
        } catch (error) {
          results.errors.push({
            row: i + 2,
            error: error.message || 'Error desconocido',
            data: row,
          });
        }
      }

      return {
        message: `Procesados ${results.total} registros: ${results.success.length} exitosos, ${results.errors.length} con errores`,
        ...results,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error procesando archivo Excel: ${error.message}`,
      );
    }
  }
}
