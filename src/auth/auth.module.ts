import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: false,
			validationSchema: Joi.object({
				JWT_ACCESS_SECRET_KEY: Joi.string().required(),
				JWT_REFRESH_SECRET_KEY: Joi.string().required(),
				JWT_ACCESS_EXPIRES_IN: Joi.string()
					.pattern(/^\d+[smhd]$/)
					.required(),
				JWT_REFRESH_EXPIRES_IN: Joi.string()
					.pattern(/^\d+[smhd]$/)
					.required(),
			}),
		}),
	],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
