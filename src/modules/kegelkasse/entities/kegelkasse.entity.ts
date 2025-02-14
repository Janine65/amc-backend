import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntity } from '../../journal/entities/journal.entity';
import { UserEntity } from '../../users/entities/user.entity';

export class Kegelkasseentity {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  datum: Date;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  kasse: Prisma.Decimal;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  rappen5: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  rappen10: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  rappen20: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  rappen50: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken1: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken2: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken5: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken10: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken20: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken50: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  franken100: number;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  total: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  differenz: Prisma.Decimal;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  journalid: number | null;
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
  userid: number | null;
  @ApiProperty({
    type: () => JournalEntity,
    required: false,
    nullable: true,
  })
  journal?: JournalEntity | null;
  @ApiProperty({
    type: () => UserEntity,
    required: false,
    nullable: true,
  })
  user?: UserEntity | null;
}
