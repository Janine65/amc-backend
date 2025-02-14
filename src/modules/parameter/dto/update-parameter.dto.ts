import { PartialType } from '@nestjs/swagger';
import { CreateParameterDto } from './create-parameter.dto';

export class UpdateParameterDto extends PartialType(CreateParameterDto) {}
