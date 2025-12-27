import { ApiResponseProperty } from '@nestjs/swagger';

export class UserDto {
	@ApiResponseProperty({
		type: 'string',
	})
	id: string;

	@ApiResponseProperty({
		type: 'string',
	})
	email: string;
}
