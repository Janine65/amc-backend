import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateAdressenDto {
  @IsNumber()
  @IsNotEmpty()
  geschlecht: number = 1;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vorname: string;

  @IsString()
  @IsNotEmpty()
  adresse: string;

  @IsNumber()
  @IsNotEmpty()
  plz: number;

  @IsString()
  @IsNotEmpty()
  ort: string;

  @IsString()
  @IsNotEmpty()
  land?: string;

  @IsString()
  telefon_p?: string;

  @IsString()
  telefon_g?: string;

  @IsString()
  mobile?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  eintritt: Date;

  @IsBoolean()
  sam_mitglied?: boolean = false;

  @IsNumber({ maxDecimalPlaces: 2 })
  jahresbeitrag?: number;

  @IsNumber()
  mnr_sam?: number;

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
    default: '3000-01-01',
  })
  austritt: Date;

  @IsBoolean()
  austritt_mail?: boolean = false;

  @IsNumber()
  jahrgang?: number;

  @IsString()
  arbeitgeber?: string;

  @IsBoolean()
  pensioniert?: boolean = false;

  @IsBoolean()
  allianz?: boolean = false;

  @IsString()
  notes?: string;
}
