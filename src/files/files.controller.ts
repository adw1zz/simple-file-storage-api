import { Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto, FileListQueryDto } from './dtos';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('file')
@ApiTags('Files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('access-token')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        return this.filesService.saveFile(file, req.user.id);
    }

    @Get('list')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 200,
        type: FileDto,
        isArray: true
    })
    async list(@Query() query: FileListQueryDto) {
        const filesList = await this.filesService.getFilesList(query?.page!, query?.list_size!);
        return filesList.map(fileMetadata => new FileDto(fileMetadata))
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 200,
        type: FileDto
    })
    async getFile(@Param('id') id: string) {
        const fileMetadata = await this.filesService.getFileMetada(id);
        return new FileDto(fileMetadata)
    }

    @Delete('delete/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    async delete(@Param('id') id: string) {
        return this.filesService.deleteFile(id);
    }

    @Get('download/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 200,
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    async download(@Param('id') id: string, @Res() res: Response) {
        const stream = await this.filesService.getFile(id);
        const file = await this.filesService.getFileMetada(id);
        const safeFilename = encodeURIComponent(file.filename);
        res.setHeader('Content-Type', file.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        stream.pipe(res);
    }

    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('access-token')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    async update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.filesService.updateFile(id, file);
    }
}
