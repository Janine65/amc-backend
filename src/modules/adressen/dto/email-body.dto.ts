import { IsOptional, IsString } from 'class-validator';

export class EmailBody {
  @IsString()
  email_signature: string | undefined;
  @IsString()
  email_an: string | undefined;
  @IsString()
  @IsOptional()
  email_cc: string | undefined;
  @IsString()
  @IsOptional()
  email_bcc: string | undefined;
  @IsString()
  email_subject: string | undefined;
  @IsString()
  email_body: string | undefined;
  @IsString()
  @IsOptional()
  email_uploadfiles: string | undefined;
}
