import { Injectable } from '@nestjs/common';

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
    return this.admins.find((admin) => admin.id === id) || null;
  }

  createAdmin(admin: Admin): Admin {
    const newAdmin = { ...admin, id: this.admins.length + 1 };
    this.admins.push(newAdmin);
    return newAdmin;
  }

  updateAdmin(id: number, admin: Admin): Admin | null {
    const index = this.admins.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.admins[index] = { ...admin, id };
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

  patchAdmin(id: number, partialAdmin: Partial<Admin>): Admin | null {
    const index = this.admins.findIndex((admin) => admin.id === id);
    if (index !== -1) {
      this.admins[index] = { ...this.admins[index], ...partialAdmin };
      return this.admins[index];
    }
    return null;
  }
}
