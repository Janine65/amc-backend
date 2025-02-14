import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from '../../account/entities/account.entity';
import { Fiscalyearentity } from '../../fiscalyear/entities/fiscalyear.entity';

export class Budgetentity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  account: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  year: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  memo: string | null;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    nullable: true,
  })
  amount: Prisma.Decimal | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  createdAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  updatedAt: Date | null;
  @ApiProperty({
    type: () => AccountEntity,
    required: false,
  })
  account_budget_accountToaccount?: AccountEntity;
  @ApiProperty({
    type: () => Fiscalyearentity,
    required: false,
  })
  fiscalyear?: Fiscalyearentity;
}
