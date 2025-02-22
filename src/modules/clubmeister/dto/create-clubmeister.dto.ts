import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateClubmeisterDto {
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
  werbungen?: number | null;
  @IsNumber()
  mitglieddauer?: number | null;
  @IsNumber()
  mitgliedid: number;
  @IsBoolean()
  status?: boolean;
}
