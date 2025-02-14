import { ApiProperty } from '@nestjs/swagger';
import { JournalReceiptEntity } from '../../journal-receipt/entities/journal-receipt.entity';
import { Expose } from 'class-transformer';
import { receipt } from '@prisma/client';

export class ReceiptEntity implements receipt {
  constructor(partial: Partial<ReceiptEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  receipt: string;
  createdAt: Date;
  updatedAt: Date;
  jahr: string | null;
  bezeichnung: string | null;
  @ApiProperty({
    type: () => JournalReceiptEntity,
    isArray: true,
    required: false,
  })
  journal_receipt?: JournalReceiptEntity[];
}
