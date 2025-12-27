import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('files_metadata')
export class FileMetadata {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	filename: string;

	@Column()
	extension: string;

	@Column()
	mime_type: string;

	@Column({ type: 'bigint' })
	size: number;

	@Column()
	path: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	uploaded_at: Date;

	@ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
	user: User;
}
