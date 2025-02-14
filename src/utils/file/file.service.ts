import { BadRequestException, Injectable } from '@nestjs/common';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from 'src/config/config.service';
import { RetDataFileDto } from '../ret-data.dto';

@Injectable()
export class FileService {
  constructor(private configService: ConfigService) {}

  handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }

    // validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('invalid file type');
    }

    // validate file size (e.g., max 50mb)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('file is too large!');
    }
    writeFileSync(
      join(this.configService.uploads, file.originalname),
      file.buffer,
    );
    const retData: RetDataFileDto = {
      type: 'info',
      message: 'file uploaded',
      data: { filename: file.originalname },
    };
    return retData;
  }
}
