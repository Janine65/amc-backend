
import {ApiProperty} from '@nestjs/swagger'


export class AnlaesseDto {
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
}
