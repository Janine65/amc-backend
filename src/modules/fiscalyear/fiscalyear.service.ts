import { Injectable } from '@nestjs/common';
import { CreateFiscalyearDto } from './dto/create-fiscalyear.dto';
import { UpdateFiscalyearDto } from './dto/update-fiscalyear.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FiscalyearService {
  constructor(private prisma: PrismaService) {}

  create(createFiscalyearDto: CreateFiscalyearDto) {
    return 'This action adds a new fiscalyear';
  }

  findAll() {
    return `This action returns all fiscalyear`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fiscalyear`;
  }

  update(id: number, updateFiscalyearDto: UpdateFiscalyearDto) {
    return `This action updates a #${id} fiscalyear`;
  }

  remove(id: number) {
    return `This action removes a #${id} fiscalyear`;
  }
}
