import { Injectable } from '@nestjs/common';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeisterschaftService {
  constructor(private prisma: PrismaService) {}

  create(createMeisterschaftDto: CreateMeisterschaftDto) {
    return 'This action adds a new meisterschaft';
  }

  findAll() {
    return `This action returns all meisterschaft`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meisterschaft`;
  }

  update(id: number, updateMeisterschaftDto: UpdateMeisterschaftDto) {
    return `This action updates a #${id} meisterschaft`;
  }

  remove(id: number) {
    return `This action removes a #${id} meisterschaft`;
  }
}
