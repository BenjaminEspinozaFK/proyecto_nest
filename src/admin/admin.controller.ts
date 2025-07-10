import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AdminService, Admin } from './admin.service';

@Controller('/admins')
export class AdminController {
  constructor(private adminsService: AdminService) {}

  @Get()
  getAllAdmins(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminsService.getAdmins(page, limit);
  }

  @Get('/:id')
  getAdminById(@Param('id') id: string): Admin | null {
    return this.adminsService.getAdminById(parseInt(id));
  }

  @Post()
  createAdmin(@Body() admin: Admin): Admin {
    console.log('Creating admin:', admin);
    return this.adminsService.createAdmin(admin);
  }

  @Put(':id')
  updateAdmin(@Param('id') id: string, @Body() admin: Admin) {
    return this.adminsService.updateAdmin(parseInt(id), admin);
  }

  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    return this.adminsService.deleteAdmin(parseInt(id));
  }

  @Patch(':id')
  patchAdmin(@Param('id') id: string, @Body() partialAdmin: Partial<Admin>) {
    return this.adminsService.patchAdmin(parseInt(id), partialAdmin);
  }
}
