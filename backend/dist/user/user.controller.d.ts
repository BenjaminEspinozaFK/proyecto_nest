import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    createUser(user: CreateUserDto): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, user: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        age: number;
        password: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
