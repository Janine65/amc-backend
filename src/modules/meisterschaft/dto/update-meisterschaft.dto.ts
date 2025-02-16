import { PartialType } from '@nestjs/swagger';
import { CreateMeisterschaftDto } from './create-meisterschaft.dto';

export class UpdateMeisterschaftDto extends PartialType(
  CreateMeisterschaftDto,
) {}
