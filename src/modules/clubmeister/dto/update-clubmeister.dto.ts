import { PartialType } from '@nestjs/swagger';
import { CreateClubmeisterDto } from './create-clubmeister.dto';

export class UpdateClubmeisterDto extends PartialType(CreateClubmeisterDto) {}
