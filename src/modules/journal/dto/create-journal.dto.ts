import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJournalDto {
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
    nullable: true,
  })
  date: Date;
  @IsString()
  memo?: string;

  @IsNumber()
  @IsOptional()
  journalno?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsNumber()
  from_account: number | null;
  @IsNumber()
  to_account: number | null;
}
