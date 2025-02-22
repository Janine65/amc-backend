import { Module } from '@nestjs/common';
import { KegelmeisterService } from './kegelmeister.service';
import { KegelmeisterController } from './kegelmeister.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [KegelmeisterController],
  providers: [KegelmeisterService, ConfigService],
  imports: [PrismaModule],
})
export class KegelmeisterModule {}
