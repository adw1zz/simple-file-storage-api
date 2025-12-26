import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Token } from './token.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Token]),
	],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule { }
