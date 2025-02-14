
import {ApiProperty} from '@nestjs/swagger'




export class ConnectKegelkasseDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
id?: number ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
datum?: Date ;
}
