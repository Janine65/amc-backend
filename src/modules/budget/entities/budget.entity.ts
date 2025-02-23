import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from '../../account/entities/account.entity';
import { FiscalyearEntity } from '../../fiscalyear/entities/fiscalyear.entity';
import { Expose, Transform } from 'class-transformer';
import { budget } from '@prisma/client';

export class BudgetEntity implements budget {
  constructor(partial: Partial<BudgetEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;
  account: number;
  year: number;
  memo: string | null;
  @Transform((value) => parseFloat(value.value))
  amount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;

  @ApiProperty({
    type: () => AccountEntity,
    required: false,
  })
  account_budget_accountToaccount?: AccountEntity;
  @ApiProperty({
    type: () => FiscalyearEntity,
    required: false,
  })
  fiscalyear?: FiscalyearEntity;
}
