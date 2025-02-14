import { Module } from '@nestjs/common';
import { JournalReceiptService } from './journal-receipt.service';
import { JournalReceiptController } from './journal-receipt.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [JournalReceiptController],
  providers: [JournalReceiptService, ConfigService],
  imports: [PrismaModule],
})
export class JournalReceiptModule {}
