import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeisterschaftDto } from './dto/create-meisterschaft.dto';
import { UpdateMeisterschaftDto } from './dto/update-meisterschaft.dto';
import { MeisterEnitity } from './entities/meister.entity';
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

  getMeisterschaftForEvent(eventid: number) {
    return this.prisma.meisterschaft.findMany({
      where: {
        anlaesse: {
          id: eventid,
        },
      },
      include: { adressen: true },
      orderBy: [{ adressen: { fullname: 'asc' } }],
    });
  }

  getMeisterschaftForMitglied(mitgliedid: number) {
    return this.prisma.meisterschaft.findMany({
      where: {
        adressen: {
          id: mitgliedid,
        },
      },
      include: { anlaesse: true },
      orderBy: [{ anlaesse: { datum: 'desc' } }],
    });
  }

  async getMeisterForMitglied(mitgliedid: number) {
    const adresse = await this.prisma.adressen.findUnique({
      where: { id: mitgliedid },
      include: {
        clubmeister: {
          orderBy: [{ jahr: 'desc' }],
        },
        kegelmeister: {
          orderBy: [{ jahr: 'desc' }],
        },
      },
    });

    if (!adresse) {
      throw new NotFoundException('Mitglied nicht gefunden');
    }
    const clubmeister = await this.prisma.clubmeister.findMany({
      where: { rang: 1 },
      orderBy: [{ jahr: 'desc' }],
    });

    const kegelmeister = await this.prisma.kegelmeister.findMany({
      where: { rang: 1 },
      orderBy: [{ jahr: 'desc' }],
    });

    const alMeister: MeisterEnitity[] = [];

    for (const cm of adresse.clubmeister) {
      const meister: MeisterEnitity = new MeisterEnitity();
      meister.fillDataClub(cm);
      const found = clubmeister.find((c) => c.jahr === cm.jahr);
      if (found) meister.diffErsterC = found.punkte! - meister.punkteC!;
      alMeister.push(meister);
    }

    for (const km of adresse.kegelmeister) {
      let meister = alMeister.find((c) => c.jahr === Number(km.jahr));
      if (!meister) {
        meister = new MeisterEnitity();
        meister.fillDataKegel(km);
        const found = kegelmeister.find((k) => k.jahr === km.jahr);
        if (found) meister.diffErsterK = found.punkte! - meister.punkteK!;
        alMeister.push(meister);
      } else {
        meister.fillDataKegel(km);
        const found = kegelmeister.find((k) => k.jahr === km.jahr);
        if (found) meister.diffErsterK = found.punkte! - meister.punkteK!;
      }
    }

    return alMeister;
  }

  checkJahr(jahr: string) {
    return this.prisma.meisterschaft.count({
      where: {
        streichresultat: true,
        anlaesse: {
          datum: {
            gte: new Date(jahr + '-01-01T00:00:00Z'),
            lte: new Date(jahr + '-12-31T23:59:59Z'),
          },
        },
      },
    });
  }

  async getChartData(jahr: string) {
    return this.prisma.anlaesse.findMany({
      where: {
        datum: {
          gte: new Date(jahr + '-01-01T00:00:00Z'),
          lte: new Date(jahr + '-12-31T23:59:59Z'),
        },
      },
      include: {
        _count: { select: { meisterschaft: true } },
        anlaesse: {
          include: {
            _count: { select: { meisterschaft: true } },
          },
        },
      },
      orderBy: [{ datum: 'asc' }],
    });
  }
}
