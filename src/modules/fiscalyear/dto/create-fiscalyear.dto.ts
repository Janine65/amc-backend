import { IsNumber, IsString } from 'class-validator';

export class CreateFiscalyearDto {
  @IsString()
  name?: string | null;
  @IsNumber()
  state?: number | null;
  @IsNumber()
  year?: number | null;
}
