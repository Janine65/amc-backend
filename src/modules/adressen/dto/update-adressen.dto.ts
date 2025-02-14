import { PartialType } from '@nestjs/swagger';
import { CreateAdressenDto } from './create-adressen.dto';

export class UpdateAdressenDto extends PartialType(CreateAdressenDto) {}
