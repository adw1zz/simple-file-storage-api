import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private configService: ConfigService) { }

    async generateTokens(payload: { id: string, device: string }) {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET_KEY'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
        })
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
        })
        return { accessToken, refreshToken };
    }

    async validateUser(id: string, password: string) {
        if (id && password) { return { id }; } return null;
    }
}