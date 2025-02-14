import { Injectable } from '@nestjs/common';
import { CreateClubmeisterDto } from './dto/create-clubmeister.dto';
import { UpdateClubmeisterDto } from './dto/update-clubmeister.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClubmeisterService {
  constructor(private prisma: PrismaService) {}

  create(createClubmeisterDto: CreateClubmeisterDto) {
    return 'This action adds a new clubmeister';
  }

  findAll() {
    return `This action returns all clubmeister`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clubmeister`;
  }

  update(id: number, updateClubmeisterDto: UpdateClubmeisterDto) {
    return `This action updates a #${id} clubmeister`;
  }

  remove(id: number) {
    return `This action removes a #${id} clubmeister`;
  }
}
