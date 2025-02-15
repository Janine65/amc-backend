import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAnlaesseDto {
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  datum: Date;
  @IsString()
  name: string;
  @IsString()
  beschreibung?: string;
  @IsNumber()
  punkte?: number = 50;
  @IsBoolean()
  istkegeln?: boolean = false;
  @IsBoolean()
  istsamanlass?: boolean = false;
  @IsBoolean()
  nachkegeln?: boolean = false;
  @IsNumber()
  gaeste?: number = 0;
  @IsNumber()
  status?: number = 1;
}
