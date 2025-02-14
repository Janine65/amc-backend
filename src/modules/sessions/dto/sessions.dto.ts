
import {ApiProperty} from '@nestjs/swagger'


export class SessionsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
sid: string ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
expires: Date  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
data: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
createdAt: Date  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
})
updatedAt: Date ;
}
