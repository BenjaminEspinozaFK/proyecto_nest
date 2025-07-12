import { Injectable, ConflictException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

export interface Admin {
  id: number;
  name: string;
  age: number;
}

@Injectable()
export class AdminService {
  private admins: Admin[] = [
    { id: 1, name: 'Admin 1', age: 30 },
    { id: 2, name: 'Admin 2', age: 25 },
  ];

  getAdmins(page?: number, limit?: number): Admin[] {
    if (page && limit) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return this.admins.slice(startIndex, endIndex);
    }
    return this.admins;
  }

  getAdminById(id: number): Admin | null {
    const adminFound = this.admins.find((admin) => admin.id === id);
    //Si admin es null, lanza un error
    if (!adminFound) {
      throw new ConflictException(`Administrador con ID ${id} no encontrado`);
    }
    return adminFound;
  }

  createAdmin(admin: CreateAdminDto): Admin {
    // Busca si ya existe un administrador con el mismo nombre
    const adminExists = this.admins.find(
      (existingAdmin) => existingAdmin.name === admin.name,
    );

    // Si se encuentra un admin, lanza una excepción
    if (adminExists) {
      throw new ConflictException(
        `Administrador con nombre ${admin.name} ya existe`,
      );
    }

    // Generar nuevo ID
    const newId =
      this.admins.length > 0
        ? Math.max(...this.admins.map((a) => a.id)) + 1
        : 1;

    const newAdmin: Admin = { ...admin, id: newId };
    this.admins.push(newAdmin);
    return newAdmin;
  }

  updateAdmin(id: number, admin: UpdateAdminDto): Admin | null {
    const index = this.admins.findIndex((a) => a.id === id);
    if (index !== -1) {
      // Mantener los valores existentes para campos opcionales
      this.admins[index] = {
        ...this.admins[index],
        ...admin,
        id,
      };
      return this.admins[index];
    }
    return null;
  }

  deleteAdmin(id: number): { message: string } {
    const index = this.admins.findIndex((admin) => admin.id === id);
    if (index !== -1) {
      this.admins.splice(index, 1);
      return { message: `Administrador con ID ${id} eliminado` };
    }
    return { message: `Administrador con ID ${id} no encontrado` };
  }

  patchAdmin(id: number, partialAdmin: Partial<UpdateAdminDto>): Admin | null {
    const index = this.admins.findIndex((admin) => admin.id === id);
    if (index !== -1) {
      this.admins[index] = { ...this.admins[index], ...partialAdmin };
      return this.admins[index];
    }
    return null;
  }

  // Métodos para seeding
  seedAdmin(admin: Admin): void {
    this.admins.push(admin);
  }

  clearAdmins(): void {
    this.admins = [];
  }
}
