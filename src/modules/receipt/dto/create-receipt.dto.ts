import { IsString } from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  receipt: string;
  @IsString()
  jahr?: string;
  @IsString()
  bezeichnung?: string;
}
