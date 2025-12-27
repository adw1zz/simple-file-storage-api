import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [AuthModule, TypeOrmModule.forFeature([User])],
	providers: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
