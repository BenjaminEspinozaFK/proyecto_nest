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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
@Controller('/admins')
export class AdminController {
  constructor(private adminsService: AdminService) {}

  @Get()
  getAllAdmins(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminsService.getAdmins(page, limit);
  }

  @Get(':id')
  getAdminById(@Param('id') id: string): CreateAdminDto | null {
    return this.adminsService.getAdminById(parseInt(id));
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createAdmin(@Body() admin: CreateAdminDto) {
    console.log('Creating admin:', admin);
    return this.adminsService.createAdmin(admin);
  }

  @Put(':id')
  updateAdmin(@Param('id') id: string, @Body() admin: UpdateAdminDto) {
    return this.adminsService.updateAdmin(parseInt(id), admin);
  }

  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    return this.adminsService.deleteAdmin(parseInt(id));
  }

  @Patch(':id')
  patchAdmin(
    @Param('id') id: string,
    @Body() partialAdmin: Partial<UpdateAdminDto>,
  ) {
    return this.adminsService.patchAdmin(parseInt(id), partialAdmin);
  }
}
