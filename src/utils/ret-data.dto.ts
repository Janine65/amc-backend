import { IsObject, IsString } from 'class-validator';

export class RetDataDto {
  @IsObject()
  data?: object;
  @IsString()
  message: string;
  @IsString()
  type: string;
}

export class RetDataFilesDto extends RetDataDto {
  @IsObject()
  data?: {
    files: string[];
  };
}

export class RetDataFileDto extends RetDataDto {
  @IsObject()
  data?: { filename: string };
}

export class RetDataUserDto extends RetDataDto {
  @IsString()
  cookie?: string;
}
