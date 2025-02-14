import { Injectable } from '@nestjs/common';
import { CreateKegelmeisterDto } from './dto/create-kegelmeister.dto';
import { UpdateKegelmeisterDto } from './dto/update-kegelmeister.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KegelmeisterService {
  constructor(private prisma: PrismaService) {}

  create(createKegelmeisterDto: CreateKegelmeisterDto) {
    return 'This action adds a new kegelmeister';
  }

  findAll() {
    return `This action returns all kegelmeister`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kegelmeister`;
  }

  update(id: number, updateKegelmeisterDto: UpdateKegelmeisterDto) {
    return `This action updates a #${id} kegelmeister`;
  }

  remove(id: number) {
    return `This action removes a #${id} kegelmeister`;
  }
}
