import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService, ConfigService],
  imports: [PrismaModule],
})
export class ReceiptModule {}
