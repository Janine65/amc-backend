import { PartialType } from '@nestjs/swagger';
import { CreateKegelkasseDto } from './create-kegelkasse.dto';

export class UpdateKegelkasseDto extends PartialType(CreateKegelkasseDto) {}
