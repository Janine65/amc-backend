import { ApiProperty } from '@nestjs/swagger';
import { AdressenEntity } from '../../adressen/entities/adressen.entity';
import { kegelmeister } from '@prisma/client';
import { Expose } from 'class-transformer';

export class KegelmeisterEntity implements kegelmeister {
  constructor(kegelmeister: kegelmeister) {
    Object.assign(this, kegelmeister);
  }

  @Expose()
  id: number;
  jahr: string;
  rang: number | null;
  vorname: string | null;
  nachname: string | null;
  mitgliedid: number;
  punkte: number | null;
  anlaesse: number | null;
  babeli: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: boolean;
  @ApiProperty({
    type: () => AdressenEntity,
    required: false,
  })
  adressen?: AdressenEntity;
}
