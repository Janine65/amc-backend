import { Injectable } from '@nestjs/common';
import { CreateClubmeisterDto } from './dto/create-clubmeister.dto';
import { UpdateClubmeisterDto } from './dto/update-clubmeister.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OverviewDto } from '../adressen/dto/overview.dto';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ClubmeisterService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createClubmeisterDto: CreateClubmeisterDto) {
    return this.prisma.clubmeister.create({
      data: {
        ...createClubmeisterDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.clubmeister.findMany({
      orderBy: [{ jahr: 'asc' }, { rang: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.clubmeister.findUnique({ where: { id } });
  }

  update(id: number, updateClubmeisterDto: UpdateClubmeisterDto) {
    return this.prisma.clubmeister.update({
      data: {
        ...updateClubmeisterDto,
        updatedAt: new Date(),
      },
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.clubmeister.delete({ where: { id } });
  }

  findAllByJahr(jahr: string) {
    return this.prisma.clubmeister.findMany({
      where: { jahr: jahr },
      orderBy: [{ jahr: 'asc' }, { rang: 'asc' }],
    });
  }

  async overview() {
    const arResult: OverviewDto[] = [{ label: 'Clubmeisterschaft', value: 0 }];
    const year = this.configService.params.get('CLUBJAHR');
    arResult[0].value = await this.prisma.clubmeister.count({
      where: {
        jahr: year,
      },
    });
    return arResult;
  }

  async calcMeister(jahr: string) {
    const laAdressen = await this.prisma.adressen.findMany({
      where: {
        meisterschaft: {
          some: {
            anlaesse: {
              datum: {
                gte: new Date(jahr + '-01-01T00:00:00Z'),
                lte: new Date(jahr + '-12-31T23:59:59Z'),
              },
              punkte: { gte: 0 },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        vorname: true,
        eintritt: true,
        meisterschaft: {
          where: {
            anlaesse: {
              datum: {
                gte: new Date(jahr + '-01-01T00:00:00Z'),
                lte: new Date(jahr + '-12-31T23:59:59Z'),
              },
              punkte: { gte: 0 },
            },
          },
        },
        _count: {
          select: {
            other_adressen: {
              where: {
                eintritt: {
                  gte: new Date(jahr + '-01-01T00:00:00Z'),
                  lte: new Date(jahr + '-12-31T23:59:59Z'),
                },
              },
            },
          },
        },
      },
    });

    await this.prisma.clubmeister.deleteMany({
      where: {
        jahr: jahr,
      },
    });

    let sumPunkte = 0;
    const laClubmeister: CreateClubmeisterDto[] = [];
    for (const adr of laAdressen) {
      const clubmeisterRec: CreateClubmeisterDto = new CreateClubmeisterDto();
      clubmeisterRec.jahr = jahr;
      clubmeisterRec.mitgliedid = adr.id;
      clubmeisterRec.mitglieddauer =
        new Date().getFullYear() - adr.eintritt!.getFullYear();
      clubmeisterRec.nachname = adr.name;
      clubmeisterRec.vorname = adr.vorname;
      clubmeisterRec.anlaesse = adr.meisterschaft.length;
      clubmeisterRec.status = true;
      clubmeisterRec.werbungen = adr._count.other_adressen;
      sumPunkte = 0;
      for (const meister of adr.meisterschaft) {
        sumPunkte += Number(meister.punkte);
      }
      clubmeisterRec.punkte = sumPunkte;
      laClubmeister.push(clubmeisterRec);
    }
    laClubmeister.sort((a, b) => {
      if (a.punkte! < b.punkte!) {
        return 1;
      } else if (a.punkte! > b.punkte!) {
        return -1;
      }
      if (a.anlaesse! < b.anlaesse!) {
        return 1;
      } else if (a.anlaesse! > b.anlaesse!) {
        return -1;
      }
      if (a.werbungen! < b.werbungen!) {
        return 1;
      } else if (a.werbungen! > b.werbungen!) {
        return -1;
      }
      if (a.mitglieddauer! < b.mitglieddauer!) {
        return 1;
      } else if (a.mitglieddauer! > b.mitglieddauer!) {
        return -1;
      }
      return 0;
    });

    let i = 1;
    const punkteMin = laClubmeister[0].punkte! * 0.4;
    for (const clubmeister of laClubmeister) {
      clubmeister.rang = i;
      if (clubmeister.punkte! < punkteMin) {
        clubmeister.status = false;
      }
      await this.prisma.clubmeister.create({
        data: { ...clubmeister, createdAt: new Date(), updatedAt: new Date() },
      });
      i++;
    }
    return laClubmeister;
  }
}
