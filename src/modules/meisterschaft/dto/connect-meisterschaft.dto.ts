import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class MeisterschaftMitgliedidEventidUniqueInputDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  mitgliedid: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    default: 0,
  })
  eventid: number;
}

@ApiExtraModels(
  MeisterschaftMitgliedidEventidUniqueInputDto,
  MeisterschaftMitgliedidEventidUniqueInputDto,
)
export class ConnectMeisterschaftDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  id?: number;
  @ApiProperty({
    type: MeisterschaftMitgliedidEventidUniqueInputDto,
    required: false,
    nullable: true,
  })
  mitgliedid_eventid?: MeisterschaftMitgliedidEventidUniqueInputDto;
}
