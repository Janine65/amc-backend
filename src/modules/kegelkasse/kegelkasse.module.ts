import { Module } from '@nestjs/common';
import { KegelkasseService } from './kegelkasse.service';
import { KegelkasseController } from './kegelkasse.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [KegelkasseController],
  providers: [KegelkasseService],
  imports: [PrismaModule],
})
export class KegelkasseModule {}
