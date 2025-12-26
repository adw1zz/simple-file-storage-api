import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Token } from './token.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions, JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		ConfigModule,
		TypeOrmModule.forFeature([User, Token]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.get<JwtModuleOptions['secret']>('JWT_ACCESS_SECRET_KEY')!,
				signOptions: { expiresIn: config.get<JwtSignOptions['expiresIn']>('JWT_ACCESS_EXPIRES_IN') },
			})
		}),
	],
	providers: [
		AuthService,
		JwtStrategy,
		{
			provide: 'ACCESS_JWT',
			useExisting: JwtService
		},
		{
			provide: 'REFRESH_JWT',
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				new JwtService({
					secret: config.get<JwtModuleOptions['secret']>('JWT_REFRESH_SECRET_KEY')!,
					signOptions: { expiresIn: config.get<JwtSignOptions['expiresIn']>('JWT_REFRESH_EXPIRES_IN') },
				}),
		}
	],
	controllers: [AuthController],
})
export class AuthModule { }
