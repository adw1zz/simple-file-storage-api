import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dtos';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Request } from 'express';
import { User } from './user.entity';
import { TokenPayloadDto } from 'src/auth/dtos';

@Controller('')
@ApiTags('Users')
export class UsersController {
    @Get('info')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 200,
        type: UserDto
    })
    async info(@Req() req: Request) {
        const user = req.user as TokenPayloadDto;
        const res: UserDto = {
            id: user.id,
            email: user.email
        }
        return res
    }
}
