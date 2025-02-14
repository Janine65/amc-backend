/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccountEntity } from './entities/account.entity';
import { RetDataFileDto } from 'src/utils/ret-data.dto';
import { Workbook } from 'exceljs';
import {
  setCellValueFormat,
  iFontSizeHeader,
  iFontSizeTitel,
  iFontSizeRow,
} from 'src/utils/general.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async writeKontoauszug(year: number, all: boolean) {
    const retData: RetDataFileDto = new RetDataFileDto();
    retData.data = { filename: 'Kontoauszug_' + year + '.xlsx' };

    const workbok = new Workbook();
    workbok.creator = 'Janine Franken';
    workbok.calcProperties.fullCalcOnLoad = true;

    const lstAccount = await this.getAccountJahr(year, all ? 1 : 0);

    for (const account of lstAccount) {
      const lstJournal = await this.prisma.journal.findMany({
        where: {
          OR: [{ from_account: account.id }, { to_account: account.id }],
          year: year,
        },
        orderBy: [{ date: 'asc' }],
      });

      const sSheetName = account.order + ' ' + account.name!.replace('/', '');
      const sheet = workbok.addWorksheet(sSheetName.substring(0, 31), {
        pageSetup: {
          fitToPage: true,
          fitToHeight: 1,
          fitToWidth: 1,
        },
        properties: {
          defaultRowHeight: 18,
        },
        headerFooter: {
          oddHeader: '&18Auto-Moto-Club Swissair',
          oddFooter: '&14' + account.name + ' ' + account.name + ' ' + year,
        },
      });

      setCellValueFormat(
        sheet,
        'B1',
        account.order + ' ' + account.name,
        false,
        undefined,
        { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
      );
      setCellValueFormat(sheet, 'B3', 'No.', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'C3', 'Datum', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'D3', 'Gegenkonto', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'E3', 'Text ', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'F3', 'Soll ', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      sheet.getCell('F3').alignment = { horizontal: 'right' };
      setCellValueFormat(sheet, 'G3', 'Haben', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      sheet.getCell('G3').alignment = { horizontal: 'right' };
      setCellValueFormat(sheet, 'H3', 'Saldo', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      sheet.getCell('H3').alignment = { horizontal: 'right' };
      sheet.getColumn('B').width = 12;
      sheet.getColumn('C').width = 12;
      sheet.getColumn('D').width = 35;
      sheet.getColumn('E').width = 55;
      sheet.getColumn('F').width = 12;
      sheet.getColumn('G').width = 12;
      sheet.getColumn('H').width = 12;

      let iSaldo = 0.0;
      let iRow = 4;

      for (const entry of lstJournal) {
        const iAmount = Number(entry.amount ?? 0);

        setCellValueFormat(
          sheet,
          'B' + iRow,
          entry.journalno,
          true,
          undefined,
          { size: iFontSizeRow, name: 'Tahoma' },
        );
        setCellValueFormat(sheet, 'C' + iRow, entry.date, true, undefined, {
          size: iFontSizeRow,
          name: 'Tahoma',
        });
        setCellValueFormat(sheet, 'E' + iRow, entry.memo, true, undefined, {
          size: iFontSizeRow,
          name: 'Tahoma',
        });
        sheet.getCell('F' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
        sheet.getCell('G' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
        sheet.getCell('H' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';

        if (entry.from_account == account.id) {
          const toAcc = lstAccount.find((rec) => rec.id == entry.to_account);
          if (toAcc)
            setCellValueFormat(
              sheet,
              'D' + iRow,
              toAcc.order + ' ' + toAcc.name,
              true,
              undefined,
              { size: iFontSizeTitel, name: 'Tahoma' },
            );
          else
            setCellValueFormat(
              sheet,
              'D' + iRow,
              entry.to_account,
              true,
              undefined,
              { size: iFontSizeTitel, name: 'Tahoma' },
            );

          setCellValueFormat(sheet, 'F' + iRow, iAmount, true, undefined, {
            size: iFontSizeTitel,
            name: 'Tahoma',
          });
          setCellValueFormat(sheet, 'G' + iRow, '', true, undefined, {
            size: iFontSizeTitel,
            name: 'Tahoma',
          });
          if (account.level == 2 || account.level == 6) iSaldo -= iAmount;
          else iSaldo += iAmount;
          setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, undefined, {
            size: iFontSizeTitel,
            name: 'Tahoma',
          });
        } else {
          const fromAcc = lstAccount.find(
            (rec) => rec.id == entry.from_account,
          );
          if (fromAcc)
            setCellValueFormat(
              sheet,
              'D' + iRow,
              fromAcc.order + ' ' + fromAcc.name,
              true,
              undefined,
              { size: iFontSizeRow, name: 'Tahoma' },
            );
          else
            setCellValueFormat(
              sheet,
              'D' + iRow,
              entry.from_account,
              true,
              undefined,
              { size: iFontSizeRow, name: 'Tahoma' },
            );
          setCellValueFormat(sheet, 'F' + iRow, '', true, undefined, {
            size: iFontSizeRow,
            name: 'Tahoma',
          });
          setCellValueFormat(sheet, 'G' + iRow, iAmount, true, undefined, {
            size: iFontSizeRow,
            name: 'Tahoma',
          });
          if (account.level == 2 || account.level == 6) iSaldo += iAmount;
          else iSaldo -= iAmount;
          setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, undefined, {
            size: iFontSizeRow,
            name: 'Tahoma',
          });
        }
        iRow++;
      }
    }

    const filename = 'Kontoauszug-' + year + '.xlsx';
    await workbok.xlsx
      .writeFile(this.configService.exports + filename)
      .catch((e) => {
        console.error(e);
        retData.type = 'error';
        retData.message = String(e);
        return retData;
      });

    return retData;
  }

  async getAccountSummary(jahr: number) {
    const arData: {
      id: number | undefined;
      name: string;
      level: number;
      order: number;
      status: number;
      amount: number;
      budget?: number;
      diff?: number;
      $css?: string;
    }[] = [];

    const lstAccount = await this.prisma.account.findMany({
      where: {
        order: { gte: 10 },
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });

    for (const account of lstAccount) {
      arData.push({
        id: account.id,
        level: account.level!,
        order: account.order!,
        name:
          account.longname || account.order!.toString() + ' ' + account.name!,
        status: account.status!,
        amount: 0,
        budget: 0,
        diff: 0,
        $css: account.status ? 'active' : 'inactive',
      });

      // read budget
      const lstBudget = await this.prisma.budget.findMany({
        where: {
          year: jahr,
          account_budget_accountToaccount: { is: { id: account.id } },
        },
      });
      if (lstBudget.length > 0) {
        arData[arData.length - 1].budget = Number(lstBudget[0].amount!);
      }

      //get amount on Journal from account
      const lstJournalA = await this.prisma.journal.groupBy({
        where: {
          year: jahr,
          account_journal_from_accountToaccount: { is: { id: account.id } },
        },
        by: ['from_account'],
        _sum: {
          amount: true,
        },
      });

      //get amount on Journal to account
      const lstJournalB = await this.prisma.journal.groupBy({
        where: {
          year: jahr,
          account_journal_to_accountToaccount: { is: { id: account.id } },
        },
        by: ['to_account'],
        _sum: {
          amount: true,
        },
      });

      const amountA = Number(lstJournalA[0]?._sum?.amount) || 0;
      const amountB = Number(lstJournalB[0]?._sum?.amount) || 0;

      if (account.level == 1 || account.level == 4) {
        arData[arData.length - 1].amount = amountA - amountB;
        arData[arData.length - 1].diff =
          arData[arData.length - 1].amount - arData[arData.length - 1].budget!;
      } else {
        arData[arData.length - 1].amount = amountB - amountA;
        arData[arData.length - 1].diff =
          arData[arData.length - 1].budget! - arData[arData.length - 1].amount;
      }
    }

    return arData;
  }

  async getFKData() {
    const arResult: { id?: number; value?: string }[] = [];
    const lstAccount = await this.prisma.account.findMany({
      where: { order: { gte: 10 } },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });

    for (const account of lstAccount) {
      arResult.push({
        id: account.id,
        value:
          account.longname || account.order!.toString() + ' ' + account.name!,
      });
    }

    return arResult;
  }
  async getAmountOneAcc(order: number, date: Date) {
    const lstJournalA = await this.prisma.journal.groupBy({
      where: {
        year: date.getFullYear(),
        date: { lte: date },
        account_journal_from_accountToaccount: { is: { order: order } },
      },

      by: ['from_account'],
      _sum: {
        amount: true,
      },
    });

    const lstJournalB = await this.prisma.journal.groupBy({
      where: {
        year: date.getFullYear(),
        date: { lte: date },
        account_journal_to_accountToaccount: { is: { order: order } },
      },
      by: ['to_account'],
      _sum: {
        amount: true,
      },
    });

    const amountA = Number(lstJournalA[0]?._sum?.amount) || 0;
    const amountB = Number(lstJournalB[0]?._sum?.amount) || 0;

    return { amount: (amountA - amountB).toFixed(2) }; // Sollsaldo
  }
  async getOneDataByOrder(order: number) {
    return this.prisma.account.findFirst({
      where: { order: order },
    });
  }
  async getAccountJahr(jahr: number, all: number) {
    let lstAccount: AccountEntity[] = [];
    if (all == 0) {
      lstAccount = await this.prisma.account.findMany({
        where: {
          OR: [
            { journal_journal_from_accountToaccount: { some: { year: jahr } } },
            { journal_journal_to_accountToaccount: { some: { year: jahr } } },
          ],
        },
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
      });
    } else {
      lstAccount = await this.prisma.account.findMany({
        where: { order: { gt: 10 } },
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
      });
    }

    return lstAccount;
  }

  async create(createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        ...createAccountDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.account.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });
  }

  async findOne(id: number) {
    return this.prisma.account.findUnique({ where: { id } });
  }

  async update(id: number, updateAccountDto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: {
        ...updateAccountDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.account.delete({ where: { id } });
  }
}
