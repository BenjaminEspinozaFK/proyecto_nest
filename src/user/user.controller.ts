import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService, User } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(): User[] {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string): User | null {
    return this.usersService.getUserById(+id);
  }

  @Post()
  createUser(@Body() user: CreateUserDto): User {
    return this.usersService.createUser(user);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): { message: string } {
    return this.usersService.deleteUser(+id);
  }
}
