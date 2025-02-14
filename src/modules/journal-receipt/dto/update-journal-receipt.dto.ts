import { PartialType } from '@nestjs/swagger';
import { CreateJournalReceiptDto } from './create-journal-receipt.dto';

export class UpdateJournalReceiptDto extends PartialType(
  CreateJournalReceiptDto,
) {}
