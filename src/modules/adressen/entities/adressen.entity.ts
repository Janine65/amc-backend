import { adressen } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ClubmeisterEntity } from '../../clubmeister/entities/clubmeister.entity';
import { KegelmeisterEntity } from '../../kegelmeister/entities/kegelmeister.entity';
import { MeisterschaftEntity } from '../../meisterschaft/entities/meisterschaft.entity';
import { Expose, Transform } from 'class-transformer';

export class AdressenEntity implements adressen {
  constructor(partial: Partial<AdressenEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  createdAt: Date;

  updatedAt: Date;

  mnr: number | null;
  geschlecht: number;
  name: string;
  vorname: string;
  adresse: string;
  plz: number;
  ort: string;
  land: string;
  telefon_p: string | null;
  telefon_g: string | null;
  mobile: string | null;
  email: string | null;

  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
  })
  eintritt: Date | null;
  sam_mitglied: boolean;
  @Transform((value) => parseFloat(value.value))
  jahresbeitrag: number | null;
  mnr_sam: number | null;
  vorstand: boolean;
  ehrenmitglied: boolean;
  veteran1: boolean;
  veteran2: boolean;
  revisor: boolean;
  motojournal: boolean;

  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
  })
  austritt: Date | null;

  austritt_mail: boolean;
  adressenid: number | null;
  jahrgang: number | null;
  arbeitgeber: string | null;
  pensioniert: boolean;
  allianz: boolean;
  notes: string | null;
  fullname: string | null;

  adressen?: AdressenEntity | null;
  other_adressen?: AdressenEntity[];
  clubmeister?: ClubmeisterEntity[];
  kegelmeister?: KegelmeisterEntity[];
  meisterschaft?: MeisterschaftEntity[];
}
