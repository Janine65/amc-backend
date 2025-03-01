import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @IsOptional()
  telefon_p?: string;

  @IsString()
  @IsOptional()
  telefon_g?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
    default: new Date().toISOString(),
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  eintritt: Date;

  @IsBoolean()
  sam_mitglied?: boolean = false;

  @IsNumber({ maxDecimalPlaces: 2 })
  jahresbeitrag?: number = 78;

  @IsNumber()
  @IsOptional()
  mnr_sam?: number;

  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
    default: '3000-01-01',
  })
  @Type(() => Date)
  @IsDate()
  austritt: Date;

  @IsBoolean()
  austritt_mail?: boolean = false;

  @IsNumber()
  @IsOptional()
  jahrgang?: number;

  @IsString()
  @IsOptional()
  arbeitgeber?: string;

  @IsBoolean()
  pensioniert?: boolean = false;

  @IsBoolean()
  allianz?: boolean = false;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  adressenid?: number;
}
