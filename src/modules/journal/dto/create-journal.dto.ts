import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateJournalDto {
  @Type(() => Date)
  @IsDateString({ strict: true })
  @ApiProperty({
    type: 'string',
    format: 'date',
    required: false,
    nullable: true,
  })
  date?: Date;
  @IsString()
  memo?: string;

  @IsNumber()
  journalno?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @IsNumber()
  status?: number;

  @IsNumber()
  year: number;

  @IsNumber()
  from_account: number | null;
  @IsNumber()
  to_account: number | null;
}
