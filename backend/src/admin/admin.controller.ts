import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';

@Controller('/admins')
@ApiBearerAuth()
// @UseGuards(RolesGuard)
// @SetMetadata('role', 'admin')
export class AdminController {
  constructor(private adminsService: AdminService) {}

  // Gestionar usuarios desde admin - DEBE IR ANTES de @Get(':id')
  @Get('users')
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
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserByAdminDto,
  ) {
    return await this.adminsService.updateUser(id, user);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.adminsService.deleteUser(id);
  }
}
