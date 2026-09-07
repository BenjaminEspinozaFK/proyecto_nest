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
  Patch,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { avatarMulterConfig } from 'src/common/multer-avatar.config';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.userId as string;
    return this.usersService.getUserById(userId);
  }

  @Put('me')
  async updateMyProfile(@Req() req: any, @Body() userData: UpdateUserDto) {
    const userId = req.user?.userId as string;
    return this.usersService.updateUser(userId, userData);
  }

  @Patch('me/change-password')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user?.userId as string;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', avatarMulterConfig))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user?.userId as string;
    return this.usersService.updateAvatar(userId, file.filename);
  }

  // Las rutas de abajo operan sobre cualquier usuario por id — solo un
  // admin puede usarlas (antes eran accesibles por cualquier usuario
  // autenticado, permitiendo tomar el control de cuentas ajenas)
  @Get()
  @Roles('admin')
  async getUsers(@Query() query: PaginationDto) {
    return this.usersService.getUsers(query.page ?? 1, query.limit ?? 20);
  }

  @Get(':id')
  @Roles('admin')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  @Roles('admin')
  async createUser(@Body() user: CreateUserDto) {
    return this.usersService.createUser(user);
  }

  @Put(':id')
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.updateUser(id, user);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.deleteUser(id);
  }
}
