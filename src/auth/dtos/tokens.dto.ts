import { ApiResponseProperty } from '@nestjs/swagger';

export class TokensDto {
	@ApiResponseProperty({
		type: 'string',
	})
	accessToken: string;

	@ApiResponseProperty({
		type: 'string',
	})
	refreshToken: string;
}
