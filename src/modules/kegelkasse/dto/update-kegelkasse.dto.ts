
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'




export class UpdateKegelkasseDto {
  @ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
})
datum?: Date ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
kasse?: Prisma.Decimal ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
rappen5?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
rappen10?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
rappen20?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
rappen50?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken1?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken2?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken5?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken10?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken20?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken50?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
franken100?: number ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
total?: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
differenz?: Prisma.Decimal ;
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
}
