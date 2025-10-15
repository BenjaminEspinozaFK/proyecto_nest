import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('/admins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminsService: AdminService) {}

  // Gestionar usuarios desde admin - DEBE IR ANTES de @Get(':id')
  @Get('users')
  @Roles('admin')
  async getAllUsers() {
    return this.adminsService.getAllUsers();
  }

  @Get()
  async getAllAdmins() {
    return this.adminsService.getAdmins();
  }

  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.adminsService.getAdminById(id);
  }

  @Post()
  async createAdmin(@Body() admin: CreateAdminDto) {
    console.log('Creating admin:', admin);
    return this.adminsService.createAdmin(admin);
  }

  @Put(':id')
  async updateAdmin(@Param('id') id: string, @Body() admin: UpdateAdminDto) {
    return this.adminsService.updateAdmin(id, admin);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminsService.deleteAdmin(id);
  }

  @Put('users/:id')
  @Roles('admin')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserByAdminDto,
  ) {
    return await this.adminsService.updateUser(id, user);
  }

  @Delete('users/:id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return await this.adminsService.deleteUser(id);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    console.log('=== ADMIN AVATAR ENDPOINT HIT ===');
    console.log('User from JWT:', req.user);
    console.log('File:', file);

    const adminId = req.user?.userId as string;
    return this.adminsService.updateAvatar(adminId, file.filename);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: any) {
    const adminId = req.user?.userId as string;
    return this.adminsService.getAdminById(adminId);
  }
}
