import { ApiProperty } from '@nestjs/swagger';
import { MeisterschaftEntity } from '../../meisterschaft/entities/meisterschaft.entity';
import { anlaesse } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AnlaesseEntity implements anlaesse {
  constructor(partial: Partial<AnlaesseEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
  })
  datum: Date;
  name: string;
  beschreibung: string | null;
  punkte: number | null;
  istkegeln: boolean;
  istsamanlass: boolean;
  nachkegeln: boolean;
  gaeste: number | null;
  anlaesseid: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: number;
  longname: string;

  @ApiProperty({
    type: () => AnlaesseEntity,
    required: false,
    nullable: true,
  })
  anlaesse?: AnlaesseEntity | null;
  @ApiProperty({
    type: () => AnlaesseEntity,
    isArray: true,
    required: false,
  })
  other_anlaesse?: AnlaesseEntity[];
  @ApiProperty({
    type: () => MeisterschaftEntity,
    isArray: true,
    required: false,
  })
  meisterschaft?: MeisterschaftEntity[];
}
