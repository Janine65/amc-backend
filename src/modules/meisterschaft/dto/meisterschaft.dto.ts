
import {ApiProperty} from '@nestjs/swagger'


export class MeisterschaftDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
punkte: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
wurf1: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
wurf2: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
wurf3: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
wurf4: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
wurf5: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
zusatz: number  | null;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
streichresultat: boolean  | null;
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
  nullable: true,
})
total_kegel: number  | null;
}
