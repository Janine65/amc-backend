import { ApiProperty } from '@nestjs/swagger';
import { BudgetEntity } from '../../budget/entities/budget.entity';
import { JournalEntity } from '../../journal/entities/journal.entity';
import { Expose } from 'class-transformer';
import { fiscalyear } from '@prisma/client';

export class FiscalyearEntity implements fiscalyear {
  constructor(partial: Partial<FiscalyearEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;
  name: string | null;
  state: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  year: number | null;
  $css: string | null;

  @ApiProperty({
    type: () => BudgetEntity,
    isArray: true,
    required: false,
  })
  budget?: BudgetEntity[];
  @ApiProperty({
    type: () => JournalEntity,
    isArray: true,
    required: false,
  })
  journal?: JournalEntity[];
}
