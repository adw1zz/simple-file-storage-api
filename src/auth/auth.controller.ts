import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthCommandDto, TokensDto, RefreshTokensCommandDto } from './dtos';

@Controller('')
@ApiTags('Auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	@ApiResponse({
		status: 200,
		type: TokensDto,
	})
	@ApiBody({
		type: AuthCommandDto,
	})
	async signup(@Body() body: AuthCommandDto, @Req() req: Request) {
		const device = req.headers['user-agent'] || 'unknown';
		return this.authService.signup(body.email, body.password, device);
	}

	@Post('signin')
	@ApiResponse({
		status: 200,
		type: TokensDto,
	})
	@ApiBody({
		type: AuthCommandDto,
	})
	async signin(@Body() body: AuthCommandDto, @Req() req: Request) {
		const user = await this.authService.validateUser(body.email, body.password);
		if (!user) {
			return { error: 'Invalid credentials' };
		}
		return this.authService.generateTokens(user, req.headers['user-agent'] || 'unknown');
	}

	@Post('signin/new_token')
	@ApiResponse({
		status: 200,
		type: TokensDto,
	})
	@ApiBody({
		type: RefreshTokensCommandDto,
	})
	async refresh(@Body() body: RefreshTokensCommandDto, @Req() req: Request) {
		return this.authService.refreshTokens(
			body.refreshToken,
			req.headers['user-agent'] || 'unknown',
		);
	}

	@Post('logout')
	@ApiResponse({
		status: 200,
	})
	@UseGuards(JwtAuthGuard)
	async logout(@Req() req: Request) {
		await this.authService.logout(
			(req.user as any)!.id,
			req.headers['user-agent'] || 'unknown',
		);
		return;
	}
}
