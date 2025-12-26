import { ApiProperty, } from '@nestjs/swagger';
import { IsString, } from 'class-validator';

export class RefreshTokensCommandDto {
    @ApiProperty({
        description: 'refresh token',
    })
    @IsString()
    refreshToken: string;
}
