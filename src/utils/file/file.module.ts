import { Module } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { FileController } from './file.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [ConfigService, FileService],
  imports: [PrismaModule],
  exports: [],
})
export class FileModule {}
