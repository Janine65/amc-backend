import { Injectable } from '@nestjs/common';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParameterService {
  constructor(private prisma: PrismaService) {}

  create(createParameterDto: CreateParameterDto) {
    const paramData = {
      ...createParameterDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.prisma.parameter.create({ data: paramData });
  }

  findAll() {
    return this.prisma.parameter.findMany();
  }

  findOne(id: number) {
    return this.prisma.parameter.findUnique({ where: { id: id } });
  }

  update(id: number, updateParameterDto: UpdateParameterDto) {
    return this.prisma.parameter.update({
      data: updateParameterDto,
      where: { id: id },
    });
  }

  remove(id: number) {
    return this.prisma.parameter.delete({ where: { id: id } });
  }
}
