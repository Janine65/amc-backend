import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class BudgetAccountYearUniqueInputDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  account: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  year: number;
}

@ApiExtraModels(
  BudgetAccountYearUniqueInputDto,
  BudgetAccountYearUniqueInputDto,
)
export class ConnectBudgetDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  id?: number;
  @ApiProperty({
    type: BudgetAccountYearUniqueInputDto,
    required: false,
    nullable: true,
  })
  account_year?: BudgetAccountYearUniqueInputDto;
}
