import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { RolesGuard } from '../auth/roles.guard';

@Controller('/admins')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@SetMetadata('role', 'admin')
export class AdminController {
  constructor(private adminsService: AdminService) {}

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

  @Get('users')
  async getAllUsers() {
    return this.adminsService.getAllUsers();
  }
}
