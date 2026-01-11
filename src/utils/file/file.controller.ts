import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { RetDataFileDto } from '../ret-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(
    private configService: ConfigService,
    private fileService: FileService,
  ) {}

  @Get('download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFile(@Query('filename') filename: string, @Res() res: Response) {
    res.attachment(filename);
    res.sendFile(filename, { root: this.configService.exports }, (err) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
    });
    return;
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
