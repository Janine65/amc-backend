import { Module } from '@nestjs/common';
import { MeisterschaftService } from './meisterschaft.service';
import { MeisterschaftController } from './meisterschaft.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [MeisterschaftController],
  providers: [MeisterschaftService, ConfigService],
  imports: [PrismaModule],
})
export class MeisterschaftModule {}
