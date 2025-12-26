import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService, private configService: ConfigService) { }

    @Post('signin')
    async signin(@Body() body: { id: string; password: string }){
        const user = await this.authService.validateUser(body.id, body.password);
        if (!user) {
            return {error: ''}
        }
    }
}
