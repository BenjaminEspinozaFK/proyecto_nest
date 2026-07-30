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
} from '@nestjs/common';
import { Patch } from '@nestjs/common';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';
import { avatarMulterConfig } from 'src/common/multer-avatar.config';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
  async getAllUsers(@Query() query: PaginationDto) {
    return this.adminsService.getAllUsers(query.page ?? 1, query.limit ?? 20);
  }

  @Post('users')
  @Roles('admin')
  async createUser(@Body() user: CreateUserDto, @Req() req: any) {
    return await this.adminsService.createUser(user, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Post('users/bulk-excel')
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new Error('Solo se permiten archivos Excel (.xlsx, .xls)'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async bulkCreateUsersFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return await this.adminsService.bulkCreateUsersFromExcel(file.buffer, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Get('users/search')
  @Roles('admin')
  async searchUserByEmail(@Query('email') email: string) {
    return await this.adminsService.searchUserByEmail(email);
  }

  @Get()
  @Roles('admin')
  async getAllAdmins() {
    return this.adminsService.getAdmins();
  }

  // Endpoints específicos ANTES de los genéricos con :id
  @Get('me')
  @Roles('admin')
  async getMyProfile(@Req() req: any) {
    const adminId = req.user?.userId as string;
    return this.adminsService.getAdminById(adminId);
  }

  @Put('me')
  @Roles('admin')
  async updateMyProfile(@Req() req: any, @Body() updateData: UpdateAdminDto) {
    const adminId = req.user?.userId as string;
    return this.adminsService.updateAdmin(adminId, updateData, {
      id: adminId,
      name: req.user?.name,
    });
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', avatarMulterConfig))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const adminId = req.user?.userId as string;
    return this.adminsService.updateAvatar(adminId, file.filename);
  }

  @Get(':id')
  @Roles('admin')
  async getAdminById(@Param('id') id: string) {
    return this.adminsService.getAdminById(id);
  }

  @Post()
  @Roles('admin')
  async createAdmin(@Body() admin: CreateAdminDto, @Req() req: any) {
    return this.adminsService.createAdmin(admin, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Put(':id')
  @Roles('admin')
  async updateAdmin(
    @Param('id') id: string,
    @Body() admin: UpdateAdminDto,
    @Req() req: any,
  ) {
    return this.adminsService.updateAdmin(id, admin, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Delete(':id')
  @Roles('admin')
  async deleteAdmin(@Param('id') id: string, @Req() req: any) {
    return this.adminsService.deleteAdmin(id, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Put('users/:id')
  @Roles('admin')
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserByAdminDto,
    @Req() req: any,
  ) {
    return await this.adminsService.updateUser(id, user, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Delete('users/:id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return await this.adminsService.deleteUser(id, {
      id: req.user?.userId,
      name: req.user?.name,
    });
  }

  @Patch('me/change-password')
  @Roles('admin')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const adminId = req.user?.userId as string;
    return this.adminsService.changePassword(adminId, dto);
  }
}
