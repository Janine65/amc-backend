import { IsObject, IsString } from 'class-validator';

export class RetDataDto {
  @IsObject()
  data?: object;
  @IsString()
  message: string;
  @IsString()
  type: string;

  constructor(data?: object, message?: string, type?: string) {
    this.data = data;
    this.message = message || '';
    this.type = type || 'info';
  }
}

export class RetDataFilesDto extends RetDataDto {
  @IsObject()
  data?: {
    files: string[];
  };
  constructor(data?: object, message?: string, type?: string) {
    super(data, message, type);
  }
}

export class RetDataFileDto extends RetDataDto {
  @IsObject()
  data?: { filename: string };
  constructor(data?: object, message?: string, type?: string) {
    super(data, message, type);
  }
}

export class RetDataUserDto extends RetDataDto {
  @IsString()
  cookie?: string;
  constructor(data?: object, cookie?: string, message?: string, type?: string) {
    super(data, message, type);
    this.cookie = cookie;
  }
}
