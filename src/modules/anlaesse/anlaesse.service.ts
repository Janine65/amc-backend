import { Injectable } from '@nestjs/common';
import { CreateAnlaesseDto } from './dto/create-anlaesse.dto';
import { UpdateAnlaesseDto } from './dto/update-anlaesse.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnlaesseService {
  constructor(private prisma: PrismaService) {}

  create(createAnlaesseDto: CreateAnlaesseDto) {
    return 'This action adds a new anlaesse';
  }

  findAll() {
    return `This action returns all anlaesse`;
  }

  findOne(id: number) {
    return `This action returns a #${id} anlaesse`;
  }

  update(id: number, updateAnlaesseDto: UpdateAnlaesseDto) {
    return `This action updates a #${id} anlaesse`;
  }

  remove(id: number) {
    return `This action removes a #${id} anlaesse`;
  }
}
