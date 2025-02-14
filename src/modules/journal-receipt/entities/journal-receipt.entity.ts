import { ApiProperty } from '@nestjs/swagger';
import { JournalEntity } from '../../journal/entities/journal.entity';
import { ReceiptEntity } from '../../receipt/entities/receipt.entity';
import { journal_receipt } from '@prisma/client';

export class JournalReceiptEntity implements journal_receipt {
  constructor(partial: Partial<JournalReceiptEntity>) {
    Object.assign(this, partial);
  }
  id: number;
  journalid: number;
  receiptid: number;

  @ApiProperty({
    type: () => JournalEntity,
    required: false,
  })
  journal?: JournalEntity;
  @ApiProperty({
    type: () => ReceiptEntity,
    required: false,
  })
  receipt?: ReceiptEntity;
}
