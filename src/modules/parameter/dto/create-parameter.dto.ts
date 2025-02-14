import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParameterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
  })
  key: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
  })
  value: string;
}
