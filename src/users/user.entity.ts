import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Token } from '../auth/token.entity';
import { FileMetadata } from '../files/file-metadata.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@OneToMany(() => Token, (token) => token.user)
	tokens: Token[];

	@OneToMany(() => FileMetadata, (file) => file.user)
	files: FileMetadata[];
}
