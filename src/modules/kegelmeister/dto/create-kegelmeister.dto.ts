import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateKegelmeisterDto {
  @IsString()
  jahr: string;
  @IsNumber()
  rang?: number | null;
  @IsString()
  vorname?: string | null;
  @IsString()
  nachname?: string | null;
  @IsNumber()
  punkte?: number | null;
  @IsNumber()
  anlaesse?: number | null;
  @IsNumber()
  @IsOptional()
  babeli?: number | null;
  @IsBoolean()
  status?: boolean;
  @IsNumber()
  mitgliedid: number;
}
