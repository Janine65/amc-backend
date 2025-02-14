import { ApiProperty } from '@nestjs/swagger';
import { Budgetentity } from '../../budget/entities/budget.entity';
import { JournalEntity } from '../../journal/entities/journal.entity';

export class Fiscalyearentity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  name: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  state: number | null;
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
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  year: number | null;
  @ApiProperty({
    type: () => Budgetentity,
    isArray: true,
    required: false,
  })
  budget?: Budgetentity[];
  @ApiProperty({
    type: () => JournalEntity,
    isArray: true,
    required: false,
  })
  journal?: JournalEntity[];
}
