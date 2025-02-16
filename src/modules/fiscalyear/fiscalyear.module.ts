import { Module } from '@nestjs/common';
import { FiscalyearService } from './fiscalyear.service';
import { FiscalyearController } from './fiscalyear.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [FiscalyearController],
  providers: [FiscalyearService, ConfigService],
  imports: [PrismaModule],
})
export class FiscalyearModule {}
