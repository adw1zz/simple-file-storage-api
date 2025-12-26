import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthCommandDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'email as login',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		example: 'strongPassword123',
		description: 'Min 5 symbols',
	})
	@IsString()
	@MinLength(5)
	password: string;
}
