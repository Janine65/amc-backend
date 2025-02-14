
import {ApiProperty} from '@nestjs/swagger'




export class ConnectAnlaesseDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
}
