
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'

export class KegelmeisterJahrRangUniqueInputDto {
    @ApiProperty({
  type: 'string',
})
jahr: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
rang: number ;
  }

@ApiExtraModels(KegelmeisterJahrRangUniqueInputDto)
export class ConnectKegelmeisterDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
id?: number ;
@ApiProperty({
  type: KegelmeisterJahrRangUniqueInputDto,
  required: false,
  nullable: true,
})
jahr_rang?: KegelmeisterJahrRangUniqueInputDto ;
}
