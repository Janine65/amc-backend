import { IsNumber, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name: string;
  @IsNumber()
  level: number;
  @IsNumber()
  parent: number;
  @IsNumber()
  order: number;
  @IsNumber()
  status: number;
}
