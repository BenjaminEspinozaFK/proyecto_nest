import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './user/user.module';

@Module({
  imports: [AdminModule, UsersModule],
})
export class AppModule {}
