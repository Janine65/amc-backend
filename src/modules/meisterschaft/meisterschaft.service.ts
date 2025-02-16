import { Injectable } from '@nestjs/common';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class MeisterschaftService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createMeisterschaftDto: CreateMeisterschaftDto) {
    return this.prisma.meisterschaft.create({
      data: {
        ...createMeisterschaftDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  findAll() {
    const clubjahr = this.configService.params.get('CLUBJAHR');
    const date = new Date(clubjahr + '-01-01T00:00:00Z');
    return this.prisma.meisterschaft.findMany({
      where: {
        anlaesse: {
          datum: {
            gte: date,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.meisterschaft.findUnique({ where: { id } });
  }

  update(id: number, updateMeisterschaftDto: UpdateMeisterschaftDto) {
    return this.prisma.meisterschaft.update({
      data: {
        ...updateMeisterschaftDto,
        updatedAt: new Date(),
      },
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.meisterschaft.delete({ where: { id } });
  }
}
