import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { TokenPayloadDto } from './dtos';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		@InjectRepository(Token) private tokensRepo: Repository<Token>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_ACCESS_SECRET_KEY')!,
		});
	}

	async validate(payload: TokenPayloadDto) {
		const tokenEntity = await this.tokensRepo.findOne({
			where: { user: { id: payload.id }, device_name: payload.device },
			relations: ['user'],
		});

		if (!tokenEntity) {
			throw new UnauthorizedException();
		}

		return payload;
	}
}
