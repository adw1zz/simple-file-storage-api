import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Token } from './auth/token.entity';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: Joi.object({
				JWT_ACCESS_SECRET_KEY: Joi.string().required(),
				JWT_REFRESH_SECRET_KEY: Joi.string().required(),
				JWT_ACCESS_EXPIRES_IN: Joi.string()
					.pattern(/^\d+[smhd]$/)
					.required(),
				JWT_REFRESH_EXPIRES_IN: Joi.string()
					.pattern(/^\d+[smhd]$/)
					.required(),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().port().required(),
				DB_USER: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_NAME: Joi.string().required(),
				BCRYPT_ROUNDS: Joi.number().required().min(2),
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				type: 'mysql',
				host: config.get<string>('DB_HOST'),
				port: config.get<number>('DB_PORT'),
				username: config.get<string>('DB_USER'),
				password: config.get<string>('DB_PASSWORD'),
				database: config.get<string>('DB_NAME'),
				entities: [User, Token],
				synchronize: true,
			}),
		}),
		AuthModule,
		UsersModule,
		FilesModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
