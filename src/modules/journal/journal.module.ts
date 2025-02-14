import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  controllers: [JournalController],
  providers: [JournalService, ConfigService],
  imports: [PrismaModule],
})
export class JournalModule {}
