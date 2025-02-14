
import {ApiProperty} from '@nestjs/swagger'
import {Meisterschaftentity} from '../../meisterschaft/entities/meisterschaft.entity'


export class Anlaesseentity {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
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
  nullable: true,
})
beschreibung: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
punkte: number  | null;
@ApiProperty({
  type: 'boolean',
})
istkegeln: boolean ;
@ApiProperty({
  type: 'boolean',
})
istsamanlass: boolean ;
@ApiProperty({
  type: 'boolean',
})
nachkegeln: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
gaeste: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
anlaesseid: number  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
createdAt: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
updatedAt: Date  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
status: number ;
@ApiProperty({
  type: 'string',
})
longname: string ;
@ApiProperty({
  type: () => Anlaesseentity,
  required: false,
  nullable: true,
})
anlaesse?: Anlaesseentity  | null;
@ApiProperty({
  type: () => Anlaesseentity,
  isArray: true,
  required: false,
})
other_anlaesse?: Anlaesseentity[] ;
@ApiProperty({
  type: () => Meisterschaftentity,
  isArray: true,
  required: false,
})
meisterschaft?: Meisterschaftentity[] ;
}
