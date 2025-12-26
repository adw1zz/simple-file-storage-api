import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tokens')
export class Token {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	refresh_token: string;

	@Column()
	accessToken: string;

	@Column()
	device_name: string;

	@ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
	user: User;
}
