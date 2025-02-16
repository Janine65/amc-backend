import { PartialType } from '@nestjs/swagger';
import { CreateFiscalyearDto } from './create-fiscalyear.dto';

export class UpdateFiscalyearDto extends PartialType(CreateFiscalyearDto) {}
