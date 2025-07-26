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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsers() {
        return await this.prisma.user.findMany();
    }
    async getUserById(id) {
        const userFound = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!userFound) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return userFound;
    }
    async createUser(user) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: user.email },
        });
        if (userExists) {
            throw new common_1.ConflictException(`Usuario con email ${user.email} ya existe`);
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await this.prisma.user.create({
            data: {
                ...user,
                password: hashedPassword,
            },
        });
        return newUser;
    }
    async updateUser(id, userData) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
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
    async deleteUser(id) {
        const userExists = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: `Usuario con ID ${id} eliminado` };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=user.service.js.map