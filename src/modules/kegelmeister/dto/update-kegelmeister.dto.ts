
import {ApiProperty} from '@nestjs/swagger'




export class UpdateKegelmeisterDto {
  @ApiProperty({
  type: 'string',
  required: false,
})
jahr?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
rang?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
vorname?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
nachname?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
punkte?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
anlaesse?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
babeli?: number  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
createdAt?: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
updatedAt?: Date  | null;
@ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
})
status?: boolean ;
}
