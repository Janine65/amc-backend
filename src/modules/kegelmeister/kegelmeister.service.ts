import { Injectable } from '@nestjs/common';
import { CreateKegelmeisterDto } from './dto/create-kegelmeister.dto';
import { UpdateKegelmeisterDto } from './dto/update-kegelmeister.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OverviewDto } from '../adressen/dto/overview.dto';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class KegelmeisterService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createKegelmeisterDto: CreateKegelmeisterDto) {
    return this.prisma.kegelmeister.create({
      data: {
        ...createKegelmeisterDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.kegelmeister.findMany({
      orderBy: [{ jahr: 'asc' }, { rang: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.kegelmeister.findUnique({ where: { id } });
  }

  update(id: number, updateKegelmeisterDto: UpdateKegelmeisterDto) {
    return this.prisma.kegelmeister.update({
      data: {
        ...updateKegelmeisterDto,
        updatedAt: new Date(),
      },
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.kegelmeister.delete({ where: { id } });
  }

  findAllByJahr(jahr: string) {
    return this.prisma.kegelmeister.findMany({
      where: { jahr: jahr },
      orderBy: [{ jahr: 'asc' }, { rang: 'asc' }],
    });
  }

  async overview() {
    const arResult: OverviewDto[] = [{ label: 'Kegelmeisterschaft', value: 0 }];
    const year = this.configService.params.get('CLUBJAHR');
    arResult[0].value = await this.prisma.kegelmeister.count({
      where: {
        jahr: year,
      },
    });
    return arResult;
  }

  async calcMeister(jahr: string) {
    // streichresulte entfernen
    await this.prisma.meisterschaft.updateMany({
      data: { streichresultat: false, updatedAt: new Date() },
      where: {
        anlaesse: {
          datum: {
            gte: new Date(jahr + '-01-01T00:00:00Z'),
            lte: new Date(jahr + '-12-31T23:59:59Z'),
          },
          istkegeln: true,
        },
      },
    });
    await this.prisma.kegelmeister.deleteMany({
      where: {
        jahr: jahr,
      },
    });

    const laAdressen = await this.prisma.adressen.findMany({
      where: {
        meisterschaft: {
          some: {
            total_kegel: { gt: 0 },
            anlaesse: {
              datum: {
                gte: new Date(jahr + '-01-01T00:00:00Z'),
                lte: new Date(jahr + '-12-31T23:59:59Z'),
              },
              istkegeln: true,
            },
          },
        },
      },
      include: {
        meisterschaft: {
          where: {
            total_kegel: { gt: 0 },
            anlaesse: {
              datum: {
                gte: new Date(jahr + '-01-01T00:00:00Z'),
                lte: new Date(jahr + '-12-31T23:59:59Z'),
              },
              istkegeln: true,
            },
          },
          include: { anlaesse: true },
          orderBy: { total_kegel: 'desc' },
        },
      },
    });
    let actJahr: boolean = jahr == this.configService.params.get('CLUBJAHR');
    if (actJahr) {
      const cntAnl = await this.prisma.anlaesse.count({
        where: {
          datum: {
            gte: new Date(),
            lte: new Date(jahr + '-12-31T23:59:59Z'),
          },
          istkegeln: true,
        },
      });
      if (cntAnl > 0) {
        actJahr = false;
      }
    }

    const laKegelmeister: CreateKegelmeisterDto[] = [];
    for (const adr of laAdressen) {
      const kegelmeisterRec: CreateKegelmeisterDto =
        new CreateKegelmeisterDto();
      kegelmeisterRec.jahr = jahr;
      kegelmeisterRec.mitgliedid = adr.id;
      kegelmeisterRec.nachname = adr.name;
      kegelmeisterRec.vorname = adr.vorname;
      kegelmeisterRec.anlaesse = 0;
      kegelmeisterRec.status = true;
      let totalKegel = 0;
      let babeli = 0;
      let anzErg = 0;
      for (const meister of adr.meisterschaft) {
        totalKegel += Number(meister.total_kegel);
        if (meister.wurf1 == 9) babeli++;
        if (meister.wurf2 == 9) babeli++;
        if (meister.wurf3 == 9) babeli++;
        if (meister.wurf4 == 9) babeli++;
        if (meister.wurf5 == 9) babeli++;
        if (meister.anlaesse.nachkegeln == false) kegelmeisterRec.anlaesse++;
        anzErg++;
        if (
          actJahr &&
          anzErg > Number(this.configService.params.get('ANZAHL_KEGEL'))
        ) {
          totalKegel -= Number(meister.total_kegel);
          meister.streichresultat = true;
          await this.prisma.meisterschaft.update({
            data: { streichresultat: true, updatedAt: new Date() },
            where: { id: meister.id },
          });
        }
      }
      kegelmeisterRec.punkte = totalKegel;
      kegelmeisterRec.babeli = babeli;
      laKegelmeister.push(kegelmeisterRec);
    }
    laKegelmeister.sort((a, b) => {
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
      if (a.babeli! < b.babeli!) {
        return 1;
      } else if (a.babeli! > b.babeli!) {
        return -1;
      }
      return 0;
    });

    let i = 1;
    const punkteMin = laKegelmeister[0].punkte! * 0.4;

    for (const kegelmeister of laKegelmeister) {
      kegelmeister.rang = i;
      if (kegelmeister.punkte! < punkteMin) {
        kegelmeister.status = false;
      }
      await this.prisma.kegelmeister.create({
        data: { ...kegelmeister, createdAt: new Date(), updatedAt: new Date() },
      });
      i++;
    }
    return laKegelmeister;
  }
}
