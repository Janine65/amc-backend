import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAnlaesseDto {
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
  })
  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  datum!: Date;
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsOptional()
  @IsString()
  beschreibung?: string;
  @IsOptional()
  @IsNumber()
  punkte?: number = 50;
  @IsOptional()
  @IsBoolean()
  istkegeln?: boolean = false;
  @IsOptional()
  @IsBoolean()
  istsamanlass?: boolean = false;
  @IsOptional()
  @IsBoolean()
  nachkegeln?: boolean = false;
  @IsOptional()
  @IsNumber()
  gaeste?: number = 0;
  @IsOptional()
  @IsNumber()
  status?: number = 1;
  @IsOptional()
  @IsNumber()
  anlaesseid?: number;
}
