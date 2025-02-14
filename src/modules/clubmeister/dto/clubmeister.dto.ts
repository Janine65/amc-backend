import { ApiProperty } from '@nestjs/swagger';

export class ClubmeisterDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
  })
  jahr: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  rang: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  vorname: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  nachname: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  punkte: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  anlaesse: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  werbungen: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  mitglieddauer: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  createdAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  updatedAt: Date | null;
  @ApiProperty({
    type: 'boolean',
  })
  status: boolean;
}
