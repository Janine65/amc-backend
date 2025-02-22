import { kegelkasse, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntity } from '../../journal/entities/journal.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { Expose, Transform } from 'class-transformer';

export class KegelkasseEntity implements kegelkasse {
  constructor(kegelkasse: kegelkasse) {
    Object.assign(this, kegelkasse);
  }
  @Expose()
  id: number;
  @ApiProperty({
    type: 'string',
    format: 'date',
  })
  datum: Date;
  @Transform((value) => parseFloat(value.value))
  kasse: Prisma.Decimal;
  rappen5: number;
  rappen10: number;
  rappen20: number;
  rappen50: number;
  franken1: number;
  franken2: number;
  franken5: number;
  franken10: number;
  franken20: number;
  franken50: number;
  franken100: number;
  @Transform((value) => parseFloat(value.value))
  total: Prisma.Decimal;
  @Transform((value) => parseFloat(value.value))
  differenz: Prisma.Decimal;
  journalid: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
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
