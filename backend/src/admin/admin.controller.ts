import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
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

  // Gestionar usuarios desde admin
  @Get('stats')
  @Roles('admin')
  async getStats() {
    return this.adminsService.getStats();
  }

  @Get('users')
  @Roles('admin')
  async getAllUsers() {
    return this.adminsService.getAllUsers();
  }

  @Post('users')
  @Roles('admin')
  async createUser(@Body() user: CreateUserDto) {
    return await this.adminsService.createUser(user);
  }

  @Get('users/search')
  @Roles('admin')
  async searchUserByEmail(@Query('email') email: string) {
    return await this.adminsService.searchUserByEmail(email);
  }

  @Get()
  async getAllAdmins() {
    return this.adminsService.getAdmins();
  }

  // Endpoints específicos ANTES de los genéricos con :id
  @Get('me')
  @Roles('admin')
  async getMyProfile(@Req() req: any) {
    const adminId = req.user?.userId as string;
    const admin = await this.adminsService.getAdminById(adminId);
    // No devolver la contraseña
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  @Put('me')
  @Roles('admin')
  async updateMyProfile(@Req() req: any, @Body() updateData: UpdateAdminDto) {
    const adminId = req.user?.userId as string;
    return this.adminsService.updateAdmin(adminId, updateData);
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

  @Post('chat')
  @Roles('admin')
  async chatWithOllama(@Body(ValidationPipe) body: ChatMessageDto) {
    return await this.adminsService.processChatMessage(body.message);
  }
}
