import { Module } from '@nestjs/common';
import { AnlaesseService } from './anlaesse.service';
import { AnlaesseController } from './anlaesse.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [AnlaesseController],
  providers: [AnlaesseService, ConfigService],
  imports: [PrismaModule],
})
export class AnlaesseModule {}
