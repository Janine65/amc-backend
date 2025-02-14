import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterAdressenDto {
  @IsString()
  @IsOptional()
  adresse?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  vorname?: string;
  @IsString()
  @IsOptional()
  ort?: string;
  @IsNumber()
  @IsOptional()
  plz?: number;
  @IsBoolean()
  @IsOptional()
  sam_mitglied?: boolean;
  @IsBoolean()
  @IsOptional()
  vorstand?: boolean;
  @IsBoolean()
  @IsOptional()
  revisor?: boolean;
  @IsBoolean()
  @IsOptional()
  ehrenmitglied?: boolean;
}
