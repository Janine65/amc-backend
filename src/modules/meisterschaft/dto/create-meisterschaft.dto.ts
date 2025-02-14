
import {ApiProperty} from '@nestjs/swagger'




export class CreateMeisterschaftDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 50,
  required: false,
  nullable: true,
})
punkte?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
wurf1?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
wurf2?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
wurf3?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
wurf4?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
wurf5?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 5,
  required: false,
  nullable: true,
})
zusatz?: number  | null;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
  nullable: true,
})
streichresultat?: boolean  | null;
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
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
total_kegel?: number  | null;
}
