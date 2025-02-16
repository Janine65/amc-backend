import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateMeisterschaftDto {
  @IsNumber()
  mitgliedid: number;
  @IsNumber()
  eventid: number;
  @IsNumber()
  punkte?: number | null;
  @IsNumber()
  @IsOptional()
  wurf1?: number | null;
  @IsNumber()
  @IsOptional()
  wurf2?: number | null;
  @IsNumber()
  @IsOptional()
  wurf3?: number | null;
  @IsNumber()
  @IsOptional()
  wurf4?: number | null;
  @IsNumber()
  @IsOptional()
  wurf5?: number | null;
  @IsNumber()
  @IsOptional()
  zusatz?: number | null;
  @IsBoolean()
  @IsOptional()
  streichresultat?: boolean | null;
  @IsNumber()
  @IsOptional()
  total_kegel?: number | null;
}
