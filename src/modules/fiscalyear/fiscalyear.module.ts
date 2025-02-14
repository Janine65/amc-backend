import { Module } from '@nestjs/common';
import { FiscalyearService } from './fiscalyear.service';
import { FiscalyearController } from './fiscalyear.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FiscalyearController],
  providers: [FiscalyearService],
  imports: [PrismaModule],
})
export class FiscalyearModule {}
