import { Module } from '@nestjs/common';
import { ClubmeisterService } from './clubmeister.service';
import { ClubmeisterController } from './clubmeister.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [ClubmeisterController],
  providers: [ClubmeisterService, ConfigService],
  imports: [PrismaModule],
})
export class ClubmeisterModule {}
