import { Module } from '@nestjs/common';
import { KegelkasseService } from './kegelkasse.service';
import { KegelkasseController } from './kegelkasse.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [KegelkasseController],
  providers: [KegelkasseService, ConfigService],
  imports: [PrismaModule],
})
export class KegelkasseModule {}
