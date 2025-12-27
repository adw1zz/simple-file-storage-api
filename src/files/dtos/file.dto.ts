import { ApiResponseProperty } from '@nestjs/swagger';
import { FileMetadata } from '../file-metadata.entity';

export class FileDto {
    constructor(fileMetadata: FileMetadata) {
        this.id = fileMetadata.id;
        this.filename = fileMetadata.filename;
        this.extension = fileMetadata.extension;
        this.mime_type = fileMetadata.mime_type;
        this.size = fileMetadata.size;
        this.uploaded_at = fileMetadata.uploaded_at;
    }

    @ApiResponseProperty()
    id: string;

    @ApiResponseProperty()
    filename: string;

    @ApiResponseProperty()
    extension: string;

    @ApiResponseProperty()
    mime_type: string;

    @ApiResponseProperty()
    size: number;

    @ApiResponseProperty()
    uploaded_at: Date;
}
