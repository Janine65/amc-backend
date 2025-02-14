import { Injectable } from '@nestjs/common';
import { CreateKegelkasseDto } from './dto/create-kegelkasse.dto';
import { UpdateKegelkasseDto } from './dto/update-kegelkasse.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KegelkasseService {
  constructor(private prisma: PrismaService) {}

  create(createKegelkasseDto: CreateKegelkasseDto) {
    return 'This action adds a new kegelkasse';
  }

  findAll() {
    return `This action returns all kegelkasse`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kegelkasse`;
  }

  update(id: number, updateKegelkasseDto: UpdateKegelkasseDto) {
    return `This action updates a #${id} kegelkasse`;
  }

  remove(id: number) {
    return `This action removes a #${id} kegelkasse`;
  }
}
