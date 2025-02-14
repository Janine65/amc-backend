import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ConfigService, PrismaService],
  exports: [ConfigService],
})
export class ConfigModule {}
