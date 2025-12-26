import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Token } from './token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Token) private tokensRepo: Repository<Token>,
    ) { }

    async generateTokens(user: User, device: string) {
        const payload = {
            id: user.id,
            email: user.email,
            device
        }
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET_KEY'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
        })
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
        })

        await this.tokensRepo.save({
            user,
            refresh_token: refreshToken,
            accessToken: accessToken,
            device_name: device,
        })

        return { accessToken, refreshToken };
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return user;
    }

    async signup(email: string, password: string, device: string) {
        const hashedPassword = await bcrypt.hash(password, this.configService.get<number>('BCRYPT_ROUNDS')!);
        const user = await this.usersRepo.save({ email, password: hashedPassword });
        return this.generateTokens(user, device);
    }

    async refreshTokens(refreshToken: string, device: string) {
        try {
            this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY') });
            const tokenEntity = await this.tokensRepo.findOne({
                where: { refresh_token: refreshToken, device_name: device },
                relations: ['user']
            })

            if (!tokenEntity) throw new Error('Invalid refresh token');

            return this.generateTokens(tokenEntity.user, device);
        } catch {
            throw new Error('Invalid refresh token')
        }
    }

    async logout(userId: string, device: string) {
        await this.tokensRepo.delete({ user: { id: userId }, device_name: device })
    }
}