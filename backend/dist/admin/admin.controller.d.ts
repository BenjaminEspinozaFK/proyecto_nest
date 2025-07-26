import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
export declare class AdminController {
    private adminsService;
    constructor(adminsService: AdminService);
    getAllAdmins(): Promise<{
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
    updateAdmin(id: string, admin: UpdateAdminDto): Promise<{
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
