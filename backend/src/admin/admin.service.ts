import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminRepositoryPort } from './domain/admin.repository';
import { UpdateUserByAdminInput } from './domain/admin.types';
import { ADMIN_REPOSITORY } from './admin.tokens';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { EmailService } from '../email/email.service';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private adminRepository: AdminRepositoryPort,
    private emailService: EmailService,
  ) {}

  /**
   * Genera una contraseña temporal segura
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '@#$%&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Asegurar que tenga al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Rellenar el resto
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar los caracteres
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async getAdmins() {
    return await this.adminRepository.findAdmins();
  }

  async getAdminById(id: string) {
    const adminFound = await this.adminRepository.findAdminById(id);

    if (!adminFound) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }
    return adminFound;
  }

  async createAdmin(admin: CreateAdminDto) {
    // Busca si ya existe un administrador con el mismo email
    const adminExists = await this.adminRepository.findAdminByEmail(
      admin.email,
    );

    // Si se encuentra un admin, lanza una excepción
    if (adminExists) {
      throw new ConflictException(
        `Administrador con email ${admin.email} ya existe`,
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const newAdmin = await this.adminRepository.createAdmin({
      ...admin,
      password: hashedPassword,
    });

    return newAdmin;
  }

  async updateAdmin(id: string, adminData: UpdateAdminDto) {
    const adminExists = await this.adminRepository.findAdminById(id);
    if (!adminExists) {
      throw new NotFoundException(`Administrador con ID ${id} no encontrado`);
    }

    // Si se proporciona una nueva contraseña, encriptarla
    const updateData = { ...adminData };
    if (adminData.password) {
      updateData.password = await bcrypt.hash(adminData.password, 10);
    }

    const updatedAdmin = await this.adminRepository.updateAdmin(id, updateData);
    return updatedAdmin;
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    const adminExists = await this.adminRepository.findAdminById(id);

    if (!adminExists) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    await this.adminRepository.deleteAdmin(id);

    return { message: `Admin con ID ${id} eliminado` };
  }

  async getStats() {
    const totalUsers = await this.adminRepository.countUsers();
    const totalAdmins = await this.adminRepository.countAdmins();

    // Usuarios registrados hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await this.adminRepository.countUsersCreatedAfter(today);

    // Usuarios esta semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const usersThisWeek =
      await this.adminRepository.countUsersCreatedAfter(weekAgo);

    // Usuarios este mes
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const usersThisMonth =
      await this.adminRepository.countUsersCreatedAfter(monthAgo);

    // Últimos 5 usuarios registrados
    const recentUsers = await this.adminRepository.findRecentUsers(5);

    // Últimos logins
    const recentLogins = await this.adminRepository.findRecentLogins(5);

    // Usuarios por rol
    const usersByRole = await this.adminRepository.groupUsersByRole();

    return {
      totalUsers,
      totalAdmins,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      recentUsers,
      recentLogins,
      usersByRole,
    };
  }

  async getAllUsers() {
    return await this.adminRepository.findAllUsers();
  }

  async updateUser(id: string, userData: UpdateUserByAdminDto) {
    const userFound = await this.adminRepository.findUserById(id);

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Construir objeto de actualización solo con campos definidos
    const dataToUpdate: UpdateUserByAdminInput = {};

    if (userData.email !== undefined) {
      dataToUpdate.email = userData.email;
    }
    if (userData.name !== undefined) {
      dataToUpdate.name = userData.name;
    }
    if (userData.phone !== undefined) {
      dataToUpdate.phone = userData.phone;
    }
    if (userData.role !== undefined) {
      dataToUpdate.role = userData.role;
    }

    const updatedUser = await this.adminRepository.updateUserByAdmin(
      id,
      dataToUpdate,
    );

    return updatedUser;
  }

  async deleteUser(id: string) {
    const userFound = await this.adminRepository.findUserById(id);

    if (!userFound) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.adminRepository.deleteUser(id);
    return { message: `Usuario con ID ${id} eliminado` };
  }

  async updateAvatar(adminId: string, filename: string) {
    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedAdmin = await this.adminRepository.updateAdminAvatar(
      adminId,
      avatarUrl,
    );

    return { admin: updatedAdmin, avatar: avatarUrl };
  }

  async createUser(user: CreateUserDto) {
    // Busca si ya existe un usuario con el mismo email
    const userExists = await this.adminRepository.findUserByEmail(user.email);

    // Si se encuentra un user, lanza una excepción
    if (userExists) {
      throw new ConflictException(`Usuario con email ${user.email} ya existe`);
    }

    // Si no se proporciona contraseña, generar una temporal
    const temporaryPassword = user.password || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const requirePasswordChange = !user.password; // true si se generó automáticamente

    const newUser = await this.adminRepository.createUserByAdmin({
      email: user.email,
      name: user.name,
      rut: user.rut,
      phone: user.phone,
      role: user.role || 'user',
      password: hashedPassword,
      requirePasswordChange,
    });

    // Si se generó una contraseña temporal, enviar email
    if (!user.password) {
      try {
        await this.emailService.sendPasswordSetupEmail(
          newUser.email,
          newUser.name || 'Usuario',
          temporaryPassword,
        );
        console.log(
          `✅ Email de configuración enviado a: ${newUser.email} con contraseña temporal: ${temporaryPassword}`,
        );
      } catch (error) {
        console.error('❌ Error enviando email de configuración:', error);
        // No lanzar error, el usuario fue creado exitosamente
      }
    }

    return newUser;
  }

  async searchUserByEmail(email: string) {
    const user = await this.adminRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminRepository.findAdminAuthById(adminId);
    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!isValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const isSame = await bcrypt.compare(dto.newPassword, admin.password);
    if (isSame) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.adminRepository.updateAdminPassword(adminId, hashedPassword);

    return { message: 'Contraseña actualizada exitosamente' };
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
        const rowNumber = i + 2; // +2 porque Excel empieza en 1 y primera fila es header

        try {
          // Validar campos requeridos (solo email y rut son obligatorios ahora)
          if (!row.email || !row.rut) {
            results.errors.push({
              row: rowNumber,
              error: 'Faltan campos requeridos (email, rut)',
              data: row,
            });
            continue;
          }

          // Preparar datos del usuario
          const email = String(row.email).trim();
          const rut = String(row.rut).trim();
          const name = row.name ? String(row.name).trim() : '';
          const phone = row.phone ? String(row.phone).trim() : null;
          const role =
            row.role &&
            ['user', 'admin'].includes(String(row.role).toLowerCase())
              ? (String(row.role).toLowerCase() as 'user' | 'admin')
              : 'user';

          // Validar phone si se proporciona (debe ser 8 dígitos)
          if (phone && !/^[0-9]{8}$/.test(phone)) {
            results.errors.push({
              row: rowNumber,
              error: 'El teléfono debe tener exactamente 8 dígitos',
              data: row,
            });
            continue;
          }

          // Generar contraseña temporal si no se proporciona
          const temporaryPassword = row.password
            ? String(row.password).trim()
            : this.generateTemporaryPassword();

          // Validar que el email no exista
          const existingUser =
            await this.adminRepository.findUserByEmail(email);

          if (existingUser) {
            results.errors.push({
              row: rowNumber,
              error: `Usuario con email ${email} ya existe`,
              data: row,
            });
            continue;
          }

          // Crear usuario
          const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
          const requirePasswordChange = !row.password; // true si se generó automáticamente

          const newUser = await this.adminRepository.createUserByAdmin({
            email,
            password: hashedPassword,
            name: name || null,
            rut,
            phone,
            role,
            requirePasswordChange,
          });

          // Si se generó contraseña temporal, enviar email
          if (!row.password) {
            try {
              await this.emailService.sendPasswordSetupEmail(
                newUser.email,
                newUser.name || 'Usuario',
                temporaryPassword,
              );
            } catch (error) {
              console.error(
                `❌ Error enviando email a ${newUser.email}:`,
                error,
              );
              // No lanzar error, el usuario fue creado exitosamente
            }
          }

          results.success.push({
            row: rowNumber,
            user: newUser,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error desconocido';

          results.errors.push({
            row: i + 2,
            error: errorMessage,
            data: row,
          });
        }
      }

      return {
        message: `Procesados ${results.total} registros: ${results.success.length} exitosos, ${results.errors.length} con errores`,
        ...results,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new BadRequestException(
        `Error procesando archivo Excel: ${errorMessage}`,
      );
    }
  }
}
