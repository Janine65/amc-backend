import { IsNumber, IsString } from 'class-validator';

export class UploadFilesDto {
  @IsString()
  year: string;
  @IsNumber()
  journalId?: number;
  @IsString()
  uploadfiles: string;
}
