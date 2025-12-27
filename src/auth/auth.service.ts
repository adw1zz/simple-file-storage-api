import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Token } from './token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { TokenPayloadDto } from './dtos';

@Injectable()
export class AuthService {
	constructor(
		@Inject('ACCESS_JWT') private accessJwtService: JwtService,
		@Inject('REFRESH_JWT') private refreshJwtService: JwtService,
		private configService: ConfigService,
		@InjectRepository(User) private usersRepo: Repository<User>,
		@InjectRepository(Token) private tokensRepo: Repository<Token>,
	) { }

	async generateTokens(user: User, device: string) {
		const payload: TokenPayloadDto = {
			id: user.id,
			email: user.email,
			device,
		};
		const accessToken = this.accessJwtService.sign(payload);
		const refreshToken = this.refreshJwtService.sign(payload);

		const tokenEntity = await this.tokensRepo.findOne({
			where: { user: { id: user.id }, device_name: device },
		});

		if (tokenEntity) {
			tokenEntity.refresh_token = refreshToken;
			await this.tokensRepo.save(tokenEntity);
		} else {
			await this.tokensRepo.save({
				user,
				refresh_token: refreshToken,
				device_name: device,
			});
		}

		return { accessToken, refreshToken };
	}

	async validateUser(email: string, password: string) {
		const user = await this.usersRepo.findOne({ where: { email } });
		if (!user) {
			throw new NotFoundException('User not found');
		}
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			throw new BadRequestException('Invalid password');
		}
		return user;
	}

	async signup(email: string, password: string, device: string) {
		const existing = await this.usersRepo.findOne({ where: { email } });
		if (existing) {
			throw new ConflictException('User already exists');
		}
		const hashedPassword = await bcrypt.hash(
			password,
			this.configService.get<number>('BCRYPT_ROUNDS')!,
		);
		const user = await this.usersRepo.save({ email, password: hashedPassword });
		return this.generateTokens(user, device);
	}

	async refreshTokens(refreshToken: string, device: string) {
		try {
			this.refreshJwtService.verify(refreshToken);
			const tokenEntity = await this.tokensRepo.findOne({
				where: { refresh_token: refreshToken },
				relations: ['user'],
			});

			if (!tokenEntity) throw new UnauthorizedException();

			return this.generateTokens(tokenEntity.user, device);
		} catch {
			throw new UnauthorizedException();
		}
	}

	async logout(userId: string, device: string) {
		await this.tokensRepo.delete({ user: { id: userId }, device_name: device });
	}
}
