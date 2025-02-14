
import {ApiProperty} from '@nestjs/swagger'




export class CreateSessionsDto {
  @ApiProperty({
  type: 'string',
})
sid: string ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
expires?: Date  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
data?: string  | null;
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
})
updatedAt: Date ;
}
