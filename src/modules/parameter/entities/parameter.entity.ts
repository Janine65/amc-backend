import { ApiProperty } from '@nestjs/swagger';
import { parameter } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ParameterEntity implements parameter {
  constructor(partial: Partial<ParameterEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;

  @ApiProperty({
    type: 'string',
  })
  key: string;
  @ApiProperty({
    type: 'string',
  })
  value: string;

  createdAt: Date | null;

  updatedAt: Date | null;
}
