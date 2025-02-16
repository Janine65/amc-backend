import { journal } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from '../../account/entities/account.entity';
import { FiscalyearEntity } from '../../fiscalyear/entities/fiscalyear.entity';
import { JournalReceiptEntity } from '../../journal-receipt/entities/journal-receipt.entity';
import { Kegelkasseentity } from '../../kegelkasse/entities/kegelkasse.entity';
import { Expose, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class JournalEntity implements journal {
  constructor(partial: Partial<JournalEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;

  from_account: number | null;
  to_account: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
  })
  date: Date | null;
  memo: string | null;
  journalno: number | null;
  @Transform((value) => parseFloat(value.value))
  amount: Decimal | null;
  status: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  year: number | null;

  @ApiProperty({
    type: () => AccountEntity,
    required: false,
    nullable: true,
  })
  account_journal_from_accountToaccount?: AccountEntity | null;
  @ApiProperty({
    type: () => AccountEntity,
    required: false,
    nullable: true,
  })
  account_journal_to_accountToaccount?: AccountEntity | null;
  @ApiProperty({
    type: () => FiscalyearEntity,
    required: false,
    nullable: true,
  })
  fiscalyear?: FiscalyearEntity | null;
  @ApiProperty({
    type: () => JournalReceiptEntity,
    isArray: true,
    required: false,
  })
  journal_receipt?: JournalReceiptEntity[];
  @ApiProperty({
    type: () => Kegelkasseentity,
    isArray: true,
    required: false,
  })
  kegelkasse?: Kegelkasseentity[];
}
