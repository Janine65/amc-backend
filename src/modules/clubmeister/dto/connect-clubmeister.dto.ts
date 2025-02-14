import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class ClubmeisterJahrRangUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  jahr: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  rang: number;
}

@ApiExtraModels(
  ClubmeisterJahrRangUniqueInputDto,
  ClubmeisterJahrRangUniqueInputDto,
)
export class ConnectClubmeisterDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  id?: number;
  @ApiProperty({
    type: ClubmeisterJahrRangUniqueInputDto,
    required: false,
    nullable: true,
  })
  jahr_rang?: ClubmeisterJahrRangUniqueInputDto;
}
