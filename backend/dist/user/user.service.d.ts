import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserById(id: string): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createUser(user: CreateUserDto): Promise<User>;
    updateUser(id: string, userData: UpdateUserDto): Promise<User>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
