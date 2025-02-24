import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
  })
  name: string;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    format: 'email',
    required: true,
    nullable: false,
  })
  email: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'password',
    required: false,
    nullable: true,
  })
  password: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    default: 'user',
    required: true,
    nullable: false,
    enum: ['user', 'admin', 'revisor'],
  })
  role?: string;
}
