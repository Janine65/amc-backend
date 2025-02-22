import { PartialType } from '@nestjs/swagger';
import { CreateKegelmeisterDto } from './create-kegelmeister.dto';

export class UpdateKegelmeisterDto extends PartialType(CreateKegelmeisterDto) {}
