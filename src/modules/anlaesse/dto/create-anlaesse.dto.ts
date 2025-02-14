
import {ApiProperty} from '@nestjs/swagger'




export class CreateAnlaesseDto {
  @ApiProperty({
  type: 'string',
  format: 'date-time',
})
datum: Date ;
@ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
beschreibung?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
punkte?: number  | null;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
})
istkegeln?: boolean ;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
})
istsamanlass?: boolean ;
@ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
})
nachkegeln?: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 0,
  required: false,
  nullable: true,
})
gaeste?: number  | null;
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
  default: 1,
  required: false,
})
status?: number ;
@ApiProperty({
  type: 'string',
})
longname: string ;
}
