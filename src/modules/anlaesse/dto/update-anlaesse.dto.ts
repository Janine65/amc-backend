import { PartialType } from '@nestjs/swagger';
import { CreateAnlaesseDto } from './create-anlaesse.dto';

export class UpdateAnlaesseDto extends PartialType(CreateAnlaesseDto) {}
