import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetadata } from './file-metadata.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
	constructor(
		@InjectRepository(FileMetadata) private filesRepo: Repository<FileMetadata>,
		private configService: ConfigService,
	) {}

	private async getBasePath() {
		const path = resolve(this.configService.get<string>('FILE_STORAGE_SOURCE')!);
		await fs.promises.mkdir(path, { recursive: true });
		return path;
	}

	private decodeFilename(originalname: string) {
		return new TextDecoder('utf-8').decode(Buffer.from(originalname, 'binary'));
	}

	async saveFile(file: Express.Multer.File, userId: string) {
		if (!file || !file.originalname) {
			throw new BadRequestException('Uploaded file is invalid or missing originalname');
		}
		const basePath = await this.getBasePath();
		const filename = this.decodeFilename(file.originalname);
		const filePath = join(basePath, filename);

		await fs.promises.writeFile(filePath, file.buffer);

		const metadata = this.filesRepo.create({
			filename: filename,
			extension: filename.split('.').pop(),
			mime_type: file.mimetype,
			size: file.size,
			path: filePath,
			user: { id: userId },
		});

		await this.filesRepo.save(metadata);
	}

	async getFilesList(page: number, pageSize: number) {
		return this.filesRepo.find({
			skip: (page - 1) * pageSize,
			take: pageSize,
			order: { uploaded_at: 'DESC' },
		});
	}

	async getFileMetada(id: string) {
		const file = await this.filesRepo.findOneBy({ id });
		if (!file) throw new NotFoundException('File not found');
		return file;
	}

	async deleteFile(id: string) {
		const file = await this.getFileMetada(id);
		await fs.promises.unlink(file.path);
		await this.filesRepo.delete(id);
	}

	async getFile(id: string) {
		const file = await this.getFileMetada(id);
		return fs.createReadStream(file.path);
	}

	async updateFile(id: string, newFile: Express.Multer.File) {
		if (!newFile || !newFile.originalname) {
			throw new BadRequestException('Uploaded file is invalid or missing originalname');
		}
		const file = await this.getFileMetada(id);

		await fs.promises.unlink(file.path);

		const basePath = await this.getBasePath();
		const filename = this.decodeFilename(newFile.originalname);
		const newPath = join(basePath, filename);
		await fs.promises.writeFile(newPath, newFile.buffer);

		file.filename = filename;
		file.extension = filename.split('.').pop()!;
		file.mime_type = newFile.mimetype;
		file.size = newFile.size;
		file.path = newPath;
		await this.filesRepo.save(file);
	}
}
