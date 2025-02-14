import { Module } from '@nestjs/common';
import { AdressenService } from './adressen.service';
import { AdressenController } from './adressen.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  controllers: [AdressenController],
  providers: [AdressenService],
  imports: [PrismaModule, ConfigModule],
  exports: [AdressenService],
})
export class AdressenModule {}
