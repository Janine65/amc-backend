import { ApiProperty } from '@nestjs/swagger';
import { AdressenEntity } from '../../adressen/entities/adressen.entity';
import { clubmeister } from '@prisma/client';

export class ClubmeisterEntity implements clubmeister {
  constructor(clubmeister: clubmeister) {
    Object.assign(this, clubmeister);
  }
  id: number;
  jahr: string;
  rang: number | null;
  vorname: string | null;
  nachname: string | null;
  mitgliedid: number;
  punkte: number | null;
  anlaesse: number | null;
  werbungen: number | null;
  mitglieddauer: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  status: boolean;

  @ApiProperty({
    type: () => AdressenEntity,
    required: false,
  })
  adressen?: AdressenEntity;
}
