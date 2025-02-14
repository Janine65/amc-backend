import { Module } from '@nestjs/common';
import { KegelmeisterService } from './kegelmeister.service';
import { KegelmeisterController } from './kegelmeister.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [KegelmeisterController],
  providers: [KegelmeisterService],
  imports: [PrismaModule],
})
export class KegelmeisterModule {}
