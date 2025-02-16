import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  account: number;
  @IsNumber()
  @IsNotEmpty()
  year: number;
  @IsString()
  @IsOptional()
  memo?: string | null;
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  amount?: number;
}
