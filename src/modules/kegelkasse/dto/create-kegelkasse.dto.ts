import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateKegelkasseDto {
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
  })
  datum: Date;
  @IsNumber({ maxDecimalPlaces: 2 })
  kasse: number;
  @IsNumber()
  rappen5: number;
  @IsNumber()
  rappen10: number;
  @IsNumber()
  rappen20: number;
  @IsNumber()
  rappen50: number;
  @IsNumber()
  franken1: number;
  @IsNumber()
  franken2: number;
  @IsNumber()
  franken5: number;
  @IsNumber()
  franken10: number;
  @IsNumber()
  franken20: number;
  @IsNumber()
  franken50: number;
  @IsNumber()
  franken100: number;
  @IsNumber({ maxDecimalPlaces: 2 })
  total: number;
  @IsNumber({ maxDecimalPlaces: 2 })
  differenz: number;
  @IsNumber()
  @IsOptional()
  userid?: number | null;
  @IsNumber()
  @IsOptional()
  journalid?: number | null;
}
