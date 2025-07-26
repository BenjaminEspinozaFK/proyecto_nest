"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdmins() {
        return await this.prisma.admin.findMany();
    }
    async getAdminById(id) {
        const adminFound = await this.prisma.admin.findUnique({
            where: { id },
        });
        if (!adminFound) {
            throw new common_1.NotFoundException(`Administrador con ID ${id} no encontrado`);
        }
        return adminFound;
    }
    async createAdmin(admin) {
        const adminExists = await this.prisma.admin.findUnique({
            where: { name: admin.name },
        });
        if (adminExists) {
            throw new common_1.ConflictException(`Administrador con nombre ${admin.name} ya existe`);
        }
        const newAdmin = await this.prisma.admin.create({
            data: admin,
        });
        return newAdmin;
    }
    async updateAdmin(id, adminData) {
        const adminExists = await this.prisma.admin.findUnique({
            where: { id },
        });
        if (!adminExists) {
            throw new common_1.NotFoundException(`Administrador con ID ${id} no encontrado`);
        }
        const updatedAdmin = await this.prisma.admin.update({
            where: { id },
            data: adminData,
        });
        return updatedAdmin;
    }
    async deleteAdmin(id) {
        const adminExists = await this.prisma.admin.findUnique({
            where: { id },
        });
        if (!adminExists) {
            throw new common_1.NotFoundException(`Admin con ID ${id} no encontrado`);
        }
        await this.prisma.admin.delete({
            where: { id },
        });
        return { message: `Admin con ID ${id} eliminado` };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map