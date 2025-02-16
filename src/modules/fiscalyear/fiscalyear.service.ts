import { Injectable } from '@nestjs/common';
import { CreateFiscalyearDto } from './dto/create-fiscalyear.dto';
import { UpdateFiscalyearDto } from './dto/update-fiscalyear.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FiscalyearEntity } from './entities/fiscalyear.entity';
import { RetDataDto } from 'src/utils/ret-data.dto';
import { CreateJournalDto } from '../journal/dto/create-journal.dto';
import { mkdirSync } from 'fs';
import { ConfigService } from 'src/config/config.service';
import { Workbook, Worksheet } from 'exceljs';
import { AccountEntity } from '../account/entities/account.entity';
import {
  setCellValueFormat,
  iFontSizeHeader,
  iFontSizeTitel,
  iFontSizeRow,
} from 'src/utils/general.service';

export class Bilanz extends AccountEntity {
  amount: number = 0;
  amountVJ: number = 0;
  amountNJ: number = 0;
  budget: number = 0;
  budgetVJ: number = 0;
  budgetNJ: number = 0;
}

@Injectable()
export class FiscalyearService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createFiscalyearDto: CreateFiscalyearDto) {
    return this.prisma.fiscalyear.create({
      data: {
        ...createFiscalyearDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.fiscalyear.findMany({ orderBy: { year: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.fiscalyear.findUnique({ where: { id } });
  }

  update(id: number, updateFiscalyearDto: UpdateFiscalyearDto) {
    return this.prisma.fiscalyear.update({
      where: { id },
      data: { ...updateFiscalyearDto, updatedAt: new Date() },
    });
  }

  remove(id: number) {
    return this.prisma.fiscalyear.delete({ where: { id } });
  }

  async getFiscalyearFK() {
    const fiscalyears = await this.prisma.fiscalyear.findMany({
      orderBy: { year: 'desc' },
    });
    const fiscalyearFK: FiscalyearEntity[] = fiscalyears.map<FiscalyearEntity>(
      (fiscalyear) => {
        return new FiscalyearEntity(fiscalyear);
      },
    );
    for (const fiscalyear of fiscalyearFK) {
      if (fiscalyear.state === 1) {
        fiscalyear.name = fiscalyear.name + ' - offen';
        fiscalyear.$css = 'offen';
      } else if (fiscalyear.state === 2) {
        fiscalyear.name = fiscalyear.name + ' - prov. geschlossen';
        fiscalyear.$css = 'prov-closed';
      } else {
        fiscalyear.name = fiscalyear.name + ' - geschlossen';
        fiscalyear.$css = 'closed';
      }
    }
    return fiscalyearFK;
  }
  getFiscalyearByYear(
    year: number,
  ): object | PromiseLike<object | undefined> | undefined {
    return this.prisma.fiscalyear.findUnique({ where: { year: year } });
  }
  async closeYear(year: number, state: number) {
    /**
     * Ein Geschäftsjahr wird geschlossen (provisorisch oder definitiv)
     * 1. Neues Fiscalyear eröffnen - sofern nicht schon eröffnet
     * 2. Gewinn / Verlust berechnen
     * 3. Kontoeröffnung (Saldovortrag)en erfassen
     * 4. im Journal die Nummerierung vornehmen
     * 5. Status vom alten Fiscalyear setzen
     */
    const retdata: RetDataDto = new RetDataDto();
    const inextyear = year + 1;
    const fiscalyear = await this.prisma.fiscalyear.findUnique({
      where: { year: year },
      include: {
        journal: {
          select: {
            id: true,
            date: true,
            amount: true,
            account_journal_from_accountToaccount: true,
            account_journal_to_accountToaccount: true,
          },
        },
      },
    });
    if (!fiscalyear) {
      retdata.type = 'error';
      retdata.message = 'Konnte Geschäftsjahr ' + year + ' nicht finden.';
      return retdata;
    }
    let next_fiscalyear = await this.prisma.fiscalyear.findUnique({
      where: { year: inextyear },
      include: { journal: true },
    });
    if (!next_fiscalyear) {
      next_fiscalyear = await this.prisma.fiscalyear.create({
        data: {
          year: inextyear,
          name: 'AMC-Buchhaltung ' + inextyear.toString(),
          state: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          journal: true,
        },
      });
      // Dateipfad für Belege erstellen
      const pathname = this.configService.documents;
      try {
        mkdirSync(pathname + inextyear);
        mkdirSync(pathname + inextyear + '/receipt');
      } catch (error) {
        console.log(error);
      }
    }

    if (next_fiscalyear.journal.length > 0) {
      // Kontoeröffnung (Saldovorträgen löschen
      await this.prisma.journal.deleteMany({
        where: {
          year: inextyear,
          OR: [{ from_account: 39 }, { to_account: 39 }],
        },
      });
    }

    const datas: CreateJournalDto[] = [];
    let igewinn = 0;
    // Aktiv
    const lstJournalA1 = await this.prisma.journal.groupBy({
      where: {
        year: year,
        account_journal_from_accountToaccount: {
          is: { level: 1 },
        },
      },
      by: ['from_account'],
      _sum: {
        amount: true,
      },
      orderBy: { from_account: 'asc' },
    });
    for (const jour of lstJournalA1) {
      igewinn += Number(jour._sum.amount);
      datas.push({
        date: new Date(inextyear + '-01-01T00:00:00.000Z'),
        year: inextyear,
        memo: 'Kontoeröffnung (Saldovortrag)',
        amount: Number(jour._sum.amount),
        status: 1,
        from_account: jour.from_account,
        to_account: 39,
        journalno: datas.length + 1,
      });
      datas[datas.length - 1].amount =
        Math.round(datas[datas.length - 1].amount! * 100) / 100;
    }

    const lstJournalB1 = await this.prisma.journal.groupBy({
      where: {
        year: year,
        account_journal_to_accountToaccount: {
          is: { level: 1 },
        },
      },
      by: ['to_account'],
      _sum: {
        amount: true,
      },
      orderBy: { to_account: 'asc' },
    });
    for (const jour of lstJournalB1) {
      igewinn -= Number(jour._sum.amount);
      const rec = datas.find((x) => x.from_account === jour.to_account);
      if (rec) {
        rec.amount = Number(rec.amount ?? 0) - Number(jour._sum.amount ?? 0);
        rec.amount = Math.round(rec.amount * 100) / 100;
      } else {
        datas.push({
          date: new Date(inextyear + '-01-01T00:00:00.000Z'),
          year: inextyear,
          memo: 'Kontoeröffnung (Saldovortrag)',
          amount: -Number(jour._sum.amount),
          status: 1,
          from_account: jour.to_account ?? 0,
          to_account: 39,
          journalno: datas.length + 1,
        });
        datas[datas.length - 1].amount =
          Math.round(datas[datas.length - 1].amount! * 100) / 100;
      }
    }
    // Passiv
    const lstJournalA2 = await this.prisma.journal.groupBy({
      where: {
        year: year,
        from_account: { not: 39 },
        account_journal_from_accountToaccount: {
          is: { level: 2 },
        },
      },
      by: ['from_account'],
      _sum: {
        amount: true,
      },
      orderBy: { from_account: 'asc' },
    });
    for (const jour of lstJournalA2) {
      igewinn -= Number(jour._sum.amount);
      datas.push({
        date: new Date(inextyear + '-01-01T00:00:00.000Z'),
        year: inextyear,
        memo: 'Kontoeröffnung (Saldovortrag)',
        amount: Number(jour._sum.amount),
        status: 1,
        from_account: 39,
        to_account: jour.from_account,
        journalno: datas.length + 1,
      });
      datas[datas.length - 1].amount =
        Math.round(datas[datas.length - 1].amount! * 100) / 100;
    }

    const lstJournalB2 = await this.prisma.journal.groupBy({
      where: {
        year: year,
        to_account: { not: 39 },
        account_journal_to_accountToaccount: {
          is: { level: 2 },
        },
      },
      by: ['to_account'],
      _sum: {
        amount: true,
      },
      orderBy: { to_account: 'asc' },
    });
    for (const jour of lstJournalB2) {
      igewinn += Number(jour._sum.amount);
      const rec = datas.find((x) => x.to_account === jour.to_account);
      if (rec) {
        rec.amount = Number(rec.amount) - Number(jour._sum.amount);
        rec.amount = Math.round(rec.amount * 100) / 100;
      } else {
        datas.push({
          date: new Date(inextyear + '-01-01T00:00:00.000Z'),
          year: inextyear,
          memo: 'Kontoeröffnung (Saldovortrag)',
          amount: -Number(jour._sum.amount!),
          status: 1,
          from_account: 39,
          to_account: jour.to_account,
          journalno: datas.length + 1,
        });
        datas[datas.length - 1].amount =
          Math.round(datas[datas.length - 1].amount! * 100) / 100;
      }
    }

    // Eröffnungsbuchungen erstellen
    await this.prisma.journal.createMany({
      data: datas.map((data) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    // Budget kopieren, sofern nicht schon vorhanden
    const budget = await this.prisma.budget.findMany({
      where: { year: inextyear },
    });
    if (budget.length === 0) {
      const lstBudget = await this.prisma.budget.findMany({
        where: { year: year },
      });
      await this.prisma.budget.createMany({
        data: lstBudget.map((bud) => ({
          ...bud,
          id: undefined,
          year: inextyear,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      });
    }

    // Status vom alten Fiscalyear setzen
    await this.prisma.fiscalyear.update({
      where: { id: fiscalyear.id },
      data: { state: state },
    });

    retdata.type = 'info';
    retdata.message =
      'AMC-Buchhaltung ' +
      year +
      ' wurde erfolgreich beendet mit Gewinn/Verlust ' +
      igewinn.toFixed(2);
    retdata.data = { gewinn: Math.round(igewinn * 100) / 100 };
    return retdata;
  }

  async writeBilanz(year: number) {
    const retdata: RetDataDto = new RetDataDto();
    const iVJahr = year - 1;
    const iNJahr = year + 1;

    const workbook = new Workbook();
    workbook.creator = 'Janine Franken';
    workbook.calcProperties.fullCalcOnLoad = true;

    const bsheet = workbook.addWorksheet('Bilanz', {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: '&18Auto-Moto-Club Swissair',
        oddFooter: '&14Bilanz ' + year,
      },
    });

    const esheet = workbook.addWorksheet('Erfolgsrechnung', {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: '&18Auto-Moto-Club Swissair',
        oddFooter: '&14Erfolgsrechnung ' + year,
      },
    });

    const busheet = workbook.addWorksheet('Budget', {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: '&18Auto-Moto-Club Swissair',
        oddFooter: '&14Budget ' + iNJahr,
      },
    });

    const accData = await this.prisma.account.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });
    const arBudget = await this.prisma.budget.findMany({
      where: { year: { in: [iVJahr, year, iNJahr] } },
      orderBy: [{ year: 'asc' }, { account: 'asc' }],
    });

    const arBilanz: Bilanz[] = [];
    for (const element of accData) {
      const bilanz: Bilanz = new Bilanz(element);
      arBilanz.push(bilanz);
    }
    for (const element of arBudget) {
      const found = arBilanz.findIndex((rec) => rec.id == element.account);
      if (found > -1) {
        switch (element.year) {
          case Number(year):
            arBilanz[found].budget = Number(element.amount ?? 0);
            break;
          case iVJahr:
            arBilanz[found].budgetVJ = Number(element.amount ?? 0);
            break;
          case iNJahr:
            arBilanz[found].budgetNJ = Number(element.amount ?? 0);
            break;
          default:
            break;
        }
      }
    }

    const arrJournalFA = await this.prisma.journal.groupBy({
      where: {
        year: year,
      },
      by: ['from_account'],
      _sum: {
        amount: true,
      },
      orderBy: { from_account: 'asc' },
    });

    const arrJournalTA = await this.prisma.journal.groupBy({
      where: {
        year: year,
      },
      by: ['to_account'],
      _sum: {
        amount: true,
      },
      orderBy: { to_account: 'asc' },
    });

    const arrJournalFV = await this.prisma.journal.groupBy({
      where: {
        year: iVJahr,
      },
      by: ['from_account'],
      _sum: {
        amount: true,
      },
      orderBy: { from_account: 'asc' },
    });

    const arrJournalTV = await this.prisma.journal.groupBy({
      where: {
        year: iVJahr,
      },
      by: ['to_account'],
      _sum: {
        amount: true,
      },
      orderBy: { to_account: 'asc' },
    });

    for (const bilanz of arBilanz) {
      let found = arrJournalFA.find((rec) => rec.from_account == bilanz.id);
      if (found) bilanz.amount += Number(found._sum.amount);
      found = arrJournalFV.find((rec) => rec.from_account == bilanz.id);
      if (found) bilanz.amountVJ += Number(found._sum.amount);

      if ([1, 4].includes(bilanz.level!)) {
        let foundT = arrJournalTA.find((rec) => rec.to_account == bilanz.id);
        if (foundT) bilanz.amount -= Number(foundT._sum.amount);

        foundT = arrJournalTV.find((rec) => rec.to_account == bilanz.id);
        if (foundT) bilanz.amountVJ -= Number(foundT._sum.amount);
      } else if ([2, 3].includes(bilanz.level!)) {
        let foundT = arrJournalTA.find((rec) => rec.to_account == bilanz.id);
        if (foundT) bilanz.amount = Number(foundT._sum.amount) - bilanz.amount;

        foundT = arrJournalTV.find((rec) => rec.to_account == bilanz.id);
        if (foundT)
          bilanz.amountVJ = Number(foundT._sum.amount) - bilanz.amountVJ;
      }
    }

    // Schreibe Bilanzdaten
    setCellValueFormat(bsheet, 'B1', 'Bilanz ' + year, false, undefined, {
      bold: true,
      size: iFontSizeHeader,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'B3', 'Konto', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'C3', 'Bezeichnung', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'D3', 'Saldo ' + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    bsheet.getCell('D3').alignment = { horizontal: 'right' };
    setCellValueFormat(bsheet, 'E3', 'Saldo ' + iVJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    bsheet.getCell('E3').alignment = { horizontal: 'right' };
    setCellValueFormat(bsheet, 'F3', 'Differenz', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    bsheet.getCell('F3').alignment = { horizontal: 'right' };

    const accBData = arBilanz.filter(function (value) {
      return (
        (value.status == 1 || value.amount != 0 || value.amountVJ != 0) &&
        value.level! < 3
      );
    });

    let Total = this.writeArray(bsheet, accBData, 4, false);
    let row = Total.lastRow + 2;
    let formula1 = { formula: 'D' + Total.total1 + '-D' + Total.total2 };
    let formula2 = { formula: 'E' + Total.total1 + '-E' + Total.total2 };
    let formula3 = { formula: 'D' + row + '-E' + row };
    setCellValueFormat(
      bsheet,
      'B' + row,
      'Gewinn / Verlust',
      true,
      'B' + row + ':C' + row,
      { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
    );
    setCellValueFormat(bsheet, 'D' + row, formula1, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'E' + row, formula2, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'F' + row, formula3, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    bsheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    bsheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    bsheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';

    row += 2;
    formula1 = { formula: 'D' + Total.lastRow + '+D' + (Total.lastRow + 2) };
    formula2 = { formula: 'E' + Total.lastRow + '+E' + (Total.lastRow + 2) };
    formula3 = { formula: 'D' + row + '-E' + row };
    setCellValueFormat(
      bsheet,
      'B' + row,
      'Vermögen Ende Jahr',
      true,
      'B' + row + ':C' + row,
      { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
    );
    setCellValueFormat(bsheet, 'D' + row, formula1, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'E' + row, formula2, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(bsheet, 'F' + row, formula3, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    bsheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    bsheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    bsheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';

    bsheet.getColumn('C').width = 32;
    bsheet.getColumn('D').width = 18;
    bsheet.getColumn('E').width = 18;
    bsheet.getColumn('F').width = 18;

    // Schreibe Erfolgsrechnung
    setCellValueFormat(
      esheet,
      'B1',
      'Erfolgsrechnung ' + year,
      false,
      undefined,
      { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
    );
    setCellValueFormat(esheet, 'B3', 'Konto', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'C3', 'Bezeichnung', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'D3', 'Saldo ' + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('D3').alignment = { horizontal: 'right' };
    setCellValueFormat(esheet, 'E3', 'Saldo ' + iVJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('E3').alignment = { horizontal: 'right' };
    setCellValueFormat(esheet, 'F3', 'Differenz', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('F3').alignment = { horizontal: 'right' };
    setCellValueFormat(esheet, 'G3', 'Budget ' + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('G3').alignment = { horizontal: 'right' };
    setCellValueFormat(esheet, 'H3', 'Differenz', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('H3').alignment = { horizontal: 'right' };

    const accEData = arBilanz.filter(function (value) {
      return (
        (value.status == 1 ||
          value.amount != 0 ||
          value.amountVJ != 0 ||
          value.budget != 0 ||
          value.budgetNJ != 0) &&
        value.level! > 2 &&
        value.level! < 9
      );
    });
    Total = this.writeArray(esheet, accEData, 4, true);
    row = Total.lastRow + 2;
    formula1 = { formula: 'D' + Total.total2 + '-D' + Total.total1 };
    formula2 = { formula: 'E' + Total.total2 + '-E' + Total.total1 };
    formula3 = { formula: 'D' + row + '-E' + row };
    let formula4 = { formula: 'G' + Total.total2 + '-G' + Total.total1 };
    let formula5 = { formula: 'G' + row + '-D' + row };
    setCellValueFormat(
      esheet,
      'B' + row,
      'Gewinn / Verlust',
      true,
      'B' + row + ':C' + row,
      { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
    );
    setCellValueFormat(esheet, 'D' + row, formula1, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'E' + row, formula2, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'F' + row, formula3, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'G' + row, formula4, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(esheet, 'H' + row, formula5, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    esheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    esheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    esheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    esheet.getCell('G' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    esheet.getCell('H' + row).numFmt = '#,##0.00;[Red]-#,##0.00';

    esheet.getColumn('C').width = 32;
    esheet.getColumn('D').width = 18;
    esheet.getColumn('E').width = 18;
    esheet.getColumn('F').width = 18;
    esheet.getColumn('G').width = 18;
    esheet.getColumn('H').width = 18;

    // Schreibe Budgetvergleich
    setCellValueFormat(busheet, 'B1', 'Budget ' + iNJahr, false, undefined, {
      bold: true,
      size: iFontSizeHeader,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'B3', 'Konto', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'C3', 'Bezeichnung', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'D3', 'Saldo ' + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('D3').alignment = { horizontal: 'right' };
    setCellValueFormat(busheet, 'E3', 'Budget ' + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('E3').alignment = { horizontal: 'right' };
    setCellValueFormat(busheet, 'F3', 'Differenz', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('F3').alignment = { horizontal: 'right' };
    setCellValueFormat(busheet, 'G3', 'Budget ' + iNJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('G3').alignment = { horizontal: 'right' };
    setCellValueFormat(busheet, 'H3', 'Differenz', true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('H3').alignment = { horizontal: 'right' };

    Total = this.writeArray(busheet, accEData, 4, true, true);

    row = Total.lastRow + 2;
    formula1 = { formula: 'D' + Total.total2 + '-D' + Total.total1 };
    formula2 = { formula: 'E' + Total.total2 + '-E' + Total.total1 };
    formula3 = { formula: 'E' + row + '-D' + row };
    formula4 = { formula: 'G' + Total.total2 + '-G' + Total.total1 };
    formula5 = { formula: 'G' + row + '-E' + row };
    setCellValueFormat(
      busheet,
      'B' + row,
      'Gewinn / Verlust',
      true,
      'B' + row + ':C' + row,
      { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
    );
    setCellValueFormat(busheet, 'D' + row, formula1, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'E' + row, formula2, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'F' + row, formula3, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'G' + row, formula4, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(busheet, 'H' + row, formula5, true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    busheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    busheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    busheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    busheet.getCell('G' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
    busheet.getCell('H' + row).numFmt = '#,##0.00;[Red]-#,##0.00';

    busheet.getColumn('C').width = 32;
    busheet.getColumn('D').width = 18;
    busheet.getColumn('E').width = 18;
    busheet.getColumn('F').width = 18;
    busheet.getColumn('G').width = 18;
    busheet.getColumn('H').width = 18;

    const filename = 'Bilanz-' + year + '.xlsx';
    await workbook.xlsx
      .writeFile(this.configService.exports + filename)
      .catch((e) => {
        console.error(e);
        return String(e);
      });

    retdata.type = 'info';
    retdata.message = 'Bilanz ' + year + ' wurde erfolgreich erstellt';
    retdata.data = { filename: filename };
    return retdata;
  }

  /**
   *
   * @param {ExcelJS.Worksheet} sheet
   * @param {Array} arData
   * @param {number} firstRow
   * @param {boolean} fBudget
   * @param {boolean} fBudgetVergleich
   */
  private writeArray(
    sheet: Worksheet,
    arData: Bilanz[],
    firstRow: number,
    fBudget = false,
    fBudgetVergleich = false,
  ) {
    let row = firstRow;
    let cellLevel = 0;

    for (let ind2 = 0; ind2 < arData.length; ind2++) {
      const element = arData[ind2];
      if (element.level == element.order) {
        row++;
        cellLevel = row;
        setCellValueFormat(
          sheet,
          'B' + row,
          element.name,
          true,
          'B' + row + ':C' + row,
          { name: 'Tahoma', bold: true, size: iFontSizeTitel },
        );

        setCellValueFormat(sheet, 'D' + row, '', true, '', {
          name: 'Tahoma',
          bold: true,
          size: iFontSizeTitel,
        });
        setCellValueFormat(sheet, 'E' + row, '', true, '', {
          name: 'Tahoma',
          bold: true,
          size: iFontSizeTitel,
        });
        setCellValueFormat(sheet, 'F' + row, '', true, '', {
          name: 'Tahoma',
          bold: true,
          size: iFontSizeTitel,
        });

        sheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        sheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        sheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        if (fBudget) {
          setCellValueFormat(sheet, 'G' + row, '', true, '', {
            name: 'Tahoma',
            bold: true,
            size: iFontSizeTitel,
          });
          setCellValueFormat(sheet, 'H' + row, '', true, '', {
            name: 'Tahoma',
            bold: true,
            size: iFontSizeTitel,
          });

          sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
          sheet.getCell('H' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        }
      } else {
        const font = { name: 'Tahoma', size: iFontSizeRow };
        setCellValueFormat(sheet, 'B' + row, element.order, true, '', font);
        setCellValueFormat(sheet, 'C' + row, element.name, true, '', font);
        setCellValueFormat(sheet, 'D' + row, element.amount, true, '', font);
        setCellValueFormat(sheet, 'E' + row, element.amountVJ, true, '', font);

        switch (element.level) {
          case 2:
          case 4:
            setCellValueFormat(
              sheet,
              'F' + row,
              { formula: 'E' + row + '-D' + row },
              true,
              '',
              font,
            );
            break;

          case 1:
          case 6:
            setCellValueFormat(
              sheet,
              'F' + row,
              { formula: 'D' + row + '-E' + row },
              true,
              '',
              font,
            );
            break;

          default:
            break;
        }

        sheet.getCell('D' + cellLevel).value = {
          formula: '=SUM(D' + (cellLevel + 1) + ':' + 'D' + row + ')',
        };
        sheet.getCell('E' + cellLevel).value = {
          formula: '=SUM(E' + (cellLevel + 1) + ':' + 'E' + row + ')',
        };
        sheet.getCell('F' + cellLevel).value = {
          formula: '=SUM(F' + (cellLevel + 1) + ':' + 'F' + row + ')',
        };

        sheet.getCell('D' + row).alignment = {
          horizontal: 'right',
        };
        sheet.getCell('E' + row).alignment = {
          horizontal: 'right',
        };
        sheet.getCell('F' + row).alignment = {
          horizontal: 'right',
        };

        sheet.getCell('D' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        sheet.getCell('E' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        sheet.getCell('F' + row).numFmt = '#,##0.00;[Red]-#,##0.00';

        if (fBudget) {
          setCellValueFormat(sheet, 'G' + row, element.budget, true, '', font);

          switch (element.level) {
            case 2:
            case 4:
              setCellValueFormat(
                sheet,
                'H' + row,
                { formula: 'G' + row + '-D' + row },
                true,
                '',
                font,
              );
              break;

            case 1:
            case 6:
              setCellValueFormat(
                sheet,
                'H' + row,
                { formula: 'D' + row + '-G' + row },
                true,
                '',
                font,
              );
              break;

            default:
              break;
          }

          sheet.getCell('G' + cellLevel).value = {
            formula: '=SUM(G' + (cellLevel + 1) + ':' + 'G' + row + ')',
          };
          sheet.getCell('H' + cellLevel).value = {
            formula: '=SUM(H' + (cellLevel + 1) + ':' + 'H' + row + ')',
          };

          sheet.getCell('G' + row).alignment = {
            horizontal: 'right',
          };
          sheet.getCell('H' + row).alignment = {
            horizontal: 'right',
          };

          sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
          sheet.getCell('H' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
        }

        if (fBudgetVergleich) {
          setCellValueFormat(sheet, 'E' + row, element.budget, true, '', font);
          setCellValueFormat(
            sheet,
            'F' + row,
            { formula: 'E' + row + '-D' + row },
            true,
            '',
            font,
          );
          setCellValueFormat(
            sheet,
            'G' + row,
            element.budgetNJ,
            true,
            '',
            font,
          );
          setCellValueFormat(
            sheet,
            'H' + row,
            { formula: 'G' + row + '-E' + row },
            true,
            '',
            font,
          );
        }
      }

      row++;
    }

    return { lastRow: row - 1, total1: firstRow + 1, total2: cellLevel };
  }
}
