import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAdmins(): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAdminById(id: string): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createAdmin(admin: CreateAdminDto): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAdmin(id: string, adminData: UpdateAdminDto): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }>;
}
