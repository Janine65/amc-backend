import { Module } from '@nestjs/common';
import { AnlaesseService } from './anlaesse.service';
import { AnlaesseController } from './anlaesse.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AnlaesseController],
  providers: [AnlaesseService],
  imports: [PrismaModule],
})
export class AnlaesseModule {}
