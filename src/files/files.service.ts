import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetadata } from './file-metadata.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {

    constructor(
        @InjectRepository(FileMetadata) private filesRepo: Repository<FileMetadata>,
        private configService: ConfigService,
    ) { }

    private getBasePath() {
        return this.configService.get<string>('FILES_PATH')!;
    }

    async saveFile(file: Express.Multer.File, userId: string) {
        const basePath = this.getBasePath();
        const filePath = join(basePath, file.originalname);

        await fs.promises.writeFile(filePath, file.buffer);

        const metadata = this.filesRepo.create({
            filename: file.originalname,
            extension: file.originalname.split('.').pop(),
            mime_type: file.mimetype,
            size: file.size,
            path: filePath,
            user: { id: userId }
        })

        await this.filesRepo.save(metadata)
    }

    async getFilesList(page: number, pageSize: number) {
        return this.filesRepo.find({
            skip: (page - 1) * pageSize,
            take: pageSize,
            order: { uploaded_at: 'DESC' }
        })
    }

    async getFileMetada(id: string) {
        const file = await this.filesRepo.findOneBy({ id })
        if (!file) throw new NotFoundException('File not found')
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
        const file = await this.getFileMetada(id);

        await fs.promises.unlink(file.path);

        const basePath = this.getBasePath();
        const newPath = join(basePath, newFile.originalname);
        await fs.promises.writeFile(newPath, newFile.buffer);

        file.filename = newFile.originalname;
        file.extension = newFile.originalname.split('.').pop()!;
        file.mime_type = newFile.mimetype;
        file.size = newFile.size;
        file.path = newPath;
        await this.filesRepo.save(file);
    }
}
