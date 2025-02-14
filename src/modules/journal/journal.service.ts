import { Injectable } from '@nestjs/common';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from 'src/config/config.service';
import {
  iFontSizeHeader,
  iFontSizeRow,
  iFontSizeTitel,
  setCellValueFormat,
} from 'src/utils/general.service';
import { RetDataFileDto } from 'src/utils/ret-data.dto';
import { locale } from 'numeral';
import archiver from 'archiver';
import { Workbook } from 'exceljs';
import { createWriteStream, existsSync } from 'fs';
import PDFDocumentWithTables from 'pdfkit-table';

@Injectable()
export class JournalService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createJournalDto: CreateJournalDto) {
    return this.prisma.journal.create({
      data: {
        ...createJournalDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
    });
  }

  findAll() {
    return this.prisma.journal.findMany({
      where: {
        year: Number.parseInt(this.configService.params.get('CLUBJAHR') ?? '0'),
      },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
      orderBy: [{ journalno: 'asc' }, { date: 'asc' }, { from_account: 'asc' }],
    });
  }

  findByYear(year: number) {
    return this.prisma.journal.findMany({
      where: { year: year },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
      orderBy: [{ journalno: 'asc' }, { date: 'asc' }, { from_account: 'asc' }],
    });
  }

  async findByAccount(account: number, year: number) {
    const lstJournal = await this.prisma.journal.findMany({
      where: {
        year: year,
        OR: [{ from_account: account }, { to_account: account }],
      },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
      orderBy: [{ journalno: 'asc' }, { date: 'asc' }, { from_account: 'asc' }],
    });

    const arData: {
      id: number;
      journalno: number | null;
      date: Date;
      memo: string;
      fromAcc?: string | null;
      toAcc?: string | null;
      haben: number;
      soll: number;
    }[] = [];
    lstJournal.forEach((element) => {
      const record: {
        id: number;
        journalno: number | null;
        date: Date;
        memo: string;
        fromAcc?: string | null;
        toAcc?: string | null;
        haben: number;
        soll: number;
      } = {
        id: element.id,
        journalno: element.journalno,
        date: element.date!,
        memo: element.memo!,
        fromAcc:
          element.account_journal_to_accountToaccount?.longname ??
          element.account_journal_to_accountToaccount?.name,
        toAcc:
          element.account_journal_from_accountToaccount?.longname ??
          element.account_journal_from_accountToaccount?.name,
        haben: 0,
        soll: 0,
      };

      if (element.to_account == account) {
        record.haben = Number(element.amount);
        record.soll = 0;
      } else {
        record.soll = Number(element.amount);
        record.haben = 0;
      }
      arData.push(record);
    });
    return arData;
  }

  findOne(id: number) {
    return this.prisma.journal.findUnique({
      where: { id: id },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
    });
  }

  update(id: number, updateJournalDto: UpdateJournalDto) {
    return this.prisma.journal.update({
      data: { ...updateJournalDto, updatedAt: new Date() },
      where: { id },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.journal.delete({ where: { id } });
  }

  async writeJournal(year: number, receipt: boolean): Promise<RetDataFileDto> {
    locale('ch');

    const retData = new RetDataFileDto();
    const lstJournal = await this.prisma.journal.findMany({
      where: { year: year },
      include: {
        account_journal_from_accountToaccount: true,
        account_journal_to_accountToaccount: true,
        journal_receipt: {
          include: {
            receipt: true,
          },
        },
      },
      orderBy: [{ journalno: 'asc' }, { date: 'asc' }, { from_account: 'asc' }],
    });

    const workbook = new Workbook();
    workbook.creator = 'Janine Franken';

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const sheet = workbook.addWorksheet('Journal', {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
        orientation: 'landscape',
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: '&18Auto-Moto-Club Swissair',
        oddFooter: '&14Journal ' + year,
      },
    });

    // Schreibe Journal
    setCellValueFormat(sheet, 'B1', 'Journal ' + year, false, '', {
      bold: true,
      size: iFontSizeHeader,
      name: 'Tahoma',
    });

    const tHeaders: (
      | string
      | {
          label: string;
          property: string;
          valign: string;
          width: number;
          align?: string;
          renderer?: (value: string | number) => string;
        }
    )[] = [
      {
        property: 'journalno',
        label: 'No.',
        valign: 'top',
        width: 50,
        align: 'right',
        renderer: (value: string | number) => {
          return typeof value == 'number' ? Number(value).toFixed(0) : value;
        },
      },
      { property: 'date', label: 'Date', valign: 'top', width: 80 },
      { property: 'from', label: 'From', valign: 'top', width: 50 },
      { property: 'to', label: 'To', valign: 'top', width: 50 },
      { property: 'text', label: 'Booking Text', valign: 'top', width: 150 },
      {
        property: 'amount',
        label: 'Amount',
        valign: 'top',
        align: 'right',
        width: 100,
        renderer: (value: string | number) => {
          return typeof value == 'number' ? Number(value).toFixed(2) : value;
        },
      },
      { property: 'receipt', label: 'Receipt', valign: 'top', width: 250 },
    ];
    setCellValueFormat(sheet, 'B3', 'No', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('B3').alignment = { vertical: 'top' };
    setCellValueFormat(sheet, 'C3', 'Date', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('C3').alignment = { vertical: 'top' };
    setCellValueFormat(sheet, 'D3', 'From ', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('D3').alignment = { vertical: 'top' };
    setCellValueFormat(sheet, 'E3', 'To ', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('E3').alignment = { vertical: 'top' };
    setCellValueFormat(sheet, 'F3', 'Booking Text ', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('F3').alignment = { vertical: 'top' };
    setCellValueFormat(sheet, 'G3', 'Amount', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('G3').alignment = { horizontal: 'right', vertical: 'top' };
    setCellValueFormat(sheet, 'H3', 'Receipt', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    sheet.getCell('H3').alignment = { vertical: 'top' };

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    let row = 4;

    const tRows: { [key: string]: string | { label: string } }[] = [];
    for (const element of lstJournal) {
      const date = new Date(element.date!);
      const dateFmt = date.toLocaleDateString('de-CH', options);
      const num = Number(element.amount ?? 0);

      const rowRecord: { [key: string]: string | { label: string } } = {
        journalno: (element.journalno ?? 0).toFixed(0),
        date: dateFmt,
        from:
          element.account_journal_from_accountToaccount?.order!.toFixed(0) ??
          '0',
        to:
          element.account_journal_to_accountToaccount?.order!.toFixed(0) ?? '0',
        text: element.memo ?? '',
        amount: num.toFixed(2),
        receipt: '',
      };

      sheet.getRow(row).height = 22;
      setCellValueFormat(sheet, 'B' + row, element.journalno ?? 0, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      sheet.getCell('B' + row).alignment = { vertical: 'top' };
      setCellValueFormat(sheet, 'C' + row, dateFmt, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      sheet.getCell('C' + row).alignment = { vertical: 'top' };
      setCellValueFormat(
        sheet,
        'D' + row,
        element.account_journal_from_accountToaccount?.order +
          ' ' +
          element.account_journal_from_accountToaccount?.name,
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('D' + row).alignment = { vertical: 'top' };
      setCellValueFormat(
        sheet,
        'E' + row,
        element.account_journal_to_accountToaccount?.order +
          ' ' +
          element.account_journal_to_accountToaccount?.name,
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('E' + row).alignment = { vertical: 'top' };
      setCellValueFormat(sheet, 'F' + row, element.memo, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      sheet.getCell('F' + row).alignment = { vertical: 'top' };
      setCellValueFormat(sheet, 'G' + row, Number(element.amount), true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]-#,##0.00';
      sheet.getCell('G' + row).alignment = { vertical: 'top' };
      sheet.getCell('H' + row).alignment = { vertical: 'top', wrapText: true };
      let linkAdress = '';
      element.journal_receipt.forEach((receipt) => {
        if (linkAdress == '')
          linkAdress =
            receipt.receipt?.bezeichnung + ': ' + receipt.receipt?.receipt;
        else
          linkAdress +=
            '\r\n' +
            receipt.receipt.bezeichnung +
            ': ' +
            receipt.receipt.receipt;
      });
      setCellValueFormat(sheet, 'H' + row, linkAdress, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      rowRecord.receipt = linkAdress;
      tRows.push(rowRecord);
      row++;
    }

    sheet.getColumn('B').width = 8;
    sheet.getColumn('C').width = 18;
    sheet.getColumn('D').width = 35;
    sheet.getColumn('E').width = 35;
    sheet.getColumn('F').width = 50;
    sheet.getColumn('G').width = 18;
    sheet.getColumn('H').width = 75;

    const filename = 'Journal-' + year;
    await workbook.xlsx
      .writeFile(this.configService.exports + filename + '.xlsx')
      .catch((e: unknown) => {
        console.error(e);
        retData.type = 'error';
        if (e instanceof Error) {
          retData.message = e.message;
        } else {
          retData.message = String(e);
        }
        return retData;
      });

    retData.type = 'info';
    retData.message = 'Datei erstellt';
    retData.data = { filename: filename + '.xlsx' };

    if (receipt) {
      const pdf = new PDFDocumentWithTables({
        autoFirstPage: false,
        bufferPages: true,
        layout: 'landscape',
        size: 'A4',
        info: {
          Title: 'Journal ' + year,
          Author: 'AutoMoto-Club Swissair, Janine Franken',
        },
      });

      // Pipe its output somewhere, like to a file or HTTP response
      // See below for browser usage
      const stream = pdf.pipe(
        createWriteStream(this.configService.exports + filename + '.pdf'),
      );

      const pdfTable: {
        title?: string;
        subtitle?: string;
        headers?: (
          | string
          | {
              label: string;
              property: string;
              valign: string;
              width: number;
              align?: string;
              renderer?: (value: string | number) => string;
            }
        )[];
        datas?: { [key: string]: string | { label: string } }[];
        rows?: string[][];
      } = { headers: tHeaders, datas: tRows };

      // if no page already exists in your PDF, do not forget to add one
      pdf.addPage();
      // Embed a font, set the font size, and render some text
      pdf
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('Journal ' + year)
        .moveDown(1);

      // draw content, by passing data to the addBody method
      await pdf.table(pdfTable, {
        divider: {
          header: { disabled: false, width: 2, opacity: 1 },
          horizontal: { disabled: false, width: 0.5, opacity: 1 },
        },
        padding: [5], // {Number} default: 0
        columnSpacing: 5,
        prepareHeader: () => pdf.font('Helvetica-Bold').fontSize(10),
        prepareRow: () => {
          return pdf.font('Helvetica').fontSize(10);
        },
      });

      // see the range of buffered pages
      const gedrucktAm =
        'Erstellt am: ' + new Date().toLocaleDateString('de-DE', options);
      const range = pdf.bufferedPageRange(); // => { start: 0, count: 1 ... }
      for (let i = range.start, end = range.start + range.count; i < end; i++) {
        pdf.switchToPage(i);

        let x = pdf.page.margins.left + 5;
        const y =
          pdf.page.height -
          pdf.heightOfString(gedrucktAm) -
          pdf.page.margins.bottom;
        console.log(gedrucktAm + ' ' + x + '/' + y);
        pdf.text(gedrucktAm, x, y);

        const text = `Page ${i + 1} of ${range.count}`;
        x =
          pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
        console.log(text + ' ' + x + '/' + y);
        pdf.text(text, x, y);
      }

      // Finalize PDF file
      pdf.end();

      stream.on('finish', () => {
        // create a file to stream archive data to.
        const output = createWriteStream(
          this.configService.exports + filename + '.zip',
        );
        const archive = archiver('zip');

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log(
            'archiver has been finalized and the output file descriptor has closed.',
          );
        });

        // This event is fired when the data source is drained no matter what was the data source.
        // It is not part of this library but rather from the NodeJS Stream API.
        // @see: https://nodejs.org/api/stream.html#stream_event_end
        output.on('end', function () {
          console.log('Data has been drained');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function (err3) {
          if (err3.code === 'ENOENT') {
            // log warning
            console.log(err3);
          } else {
            // throw error
            throw err3;
          }
        });
        archive.on('error', function (err4) {
          throw err4;
        });

        archive.pipe(output, { end: true });

        // append a file
        if (existsSync(this.configService.exports + filename + '.pdf')) {
          archive.file(this.configService.exports + filename + '.pdf', {
            name: filename + '.pdf',
          });
        } else {
          console.error('File not found');
        }

        // append files from a sub-directory and naming it `new-subdir` within the archive
        archive.directory(
          this.configService.documents + year + '/receipt/',
          'receipt',
        );
        void archive.finalize().finally(() => {});
      });

      retData.data = { filename: filename + '.zip' };
    }
    return retData;
  }
}
