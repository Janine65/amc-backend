import { ApiProperty } from '@nestjs/swagger';
import { Budgetentity } from '../../budget/entities/budget.entity';
import { JournalEntity } from '../../journal/entities/journal.entity';
import { account } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AccountEntity implements account {
  constructor(partial: Partial<AccountEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;
  name: string | null;
  level: number | null;
  order: number | null;
  status: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  longname: string | null;

  @ApiProperty({
    type: () => Budgetentity,
    isArray: true,
    required: false,
  })
  budget_budget_accountToaccount?: Budgetentity[];
  @ApiProperty({
    type: () => JournalEntity,
    isArray: true,
    required: false,
  })
  journal_journal_from_accountToaccount?: JournalEntity[];
  @ApiProperty({
    type: () => JournalEntity,
    isArray: true,
    required: false,
  })
  journal_journal_to_accountToaccount?: JournalEntity[];
}
