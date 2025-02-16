import { ApiProperty } from '@nestjs/swagger';
import { AnlaesseEntity } from '../../anlaesse/entities/anlaesse.entity';
import { AdressenEntity } from '../../adressen/entities/adressen.entity';
import { meisterschaft } from '@prisma/client';

export class MeisterschaftEntity implements Readonly<meisterschaft> {
  constructor(partial: Partial<meisterschaft>) {
    Object.assign(this, partial);
  }
  id: number;
  mitgliedid: number;
  eventid: number;
  punkte: number | null;
  wurf1: number | null;
  wurf2: number | null;
  wurf3: number | null;
  wurf4: number | null;
  wurf5: number | null;
  zusatz: number | null;
  streichresultat: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  total_kegel: number | null;

  @ApiProperty({
    type: () => AnlaesseEntity,
    required: false,
  })
  anlaesse?: AnlaesseEntity;
  @ApiProperty({
    type: () => AdressenEntity,
    required: false,
  })
  adressen?: AdressenEntity;
}
