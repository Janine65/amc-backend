import {
  Controller,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ConfigService } from 'src/config/config.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { RetDataFileDto } from '../ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('files')
export class FileController {
  constructor(
    private configService: ConfigService,
    private fileService: FileService,
  ) {}

  @Get('download')
  @ApiProduces('multipart/form-data')
  @ApiResponse({
    status: 200,
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFile(@Query('filename') filename: string): StreamableFile {
    const file = createReadStream(join(this.configService.exports, filename));
    let type = 'application/pdf';
    if (filename.endsWith('.xlsx')) {
      type =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    if (filename.endsWith('.zip')) {
      type = 'application/zip';
    }
    return new StreamableFile(file, {
      type: type,
      disposition: 'attachment; filename="' + filename + '"',
    });
  }

  @Post('upload')
  @ApiOkResponse({ type: RetDataFileDto })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.fileService.handleFileUpload(file);
  }
}
