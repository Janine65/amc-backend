import { Injectable } from '@nestjs/common';
import { CreateKegelkasseDto } from './dto/create-kegelkasse.dto';
import { UpdateKegelkasseDto } from './dto/update-kegelkasse.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RetDataFileDto } from 'src/utils/ret-data.dto';
import { locale } from 'numeral';
import { Workbook, Worksheet } from 'exceljs';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  copyFileSync,
  chmod,
} from 'fs';
import PDFDocumentWithTables from 'pdfkit-table';
import { setCellValueFormat, formatDateLong } from 'src/utils/general.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class KegelkasseService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createKegelkasseDto: CreateKegelkasseDto) {
    return this.prisma.kegelkasse.create({
      data: {
        ...createKegelkasseDto,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }

  findAll() {
    return this.prisma.kegelkasse.findMany();
  }

  findOne(id: number) {
    return this.prisma.kegelkasse.findUnique({ where: { id } });
  }

  findOneByDatum(datum: Date) {
    return this.prisma.kegelkasse.findFirst({
      where: { datum: datum },
      include: {
        journal: {
          include: {
            account_journal_from_accountToaccount: true,
            account_journal_to_accountToaccount: true,
          },
        },
      },
    });
  }

  findByJahr(jahr: string) {
    return this.prisma.kegelkasse.findMany({
      where: {
        datum: {
          gte: new Date(jahr + '-01-01T00:00:00Z'),
          lt: new Date(parseInt(jahr) + 1 + '-01-01T00:00:00Z'),
        },
      },
      include: {
        journal: {
          include: {
            account_journal_from_accountToaccount: true,
            account_journal_to_accountToaccount: true,
          },
        },
      },
      orderBy: { datum: 'asc' },
    });
  }

  update(id: number, updateKegelkasseDto: UpdateKegelkasseDto) {
    return this.prisma.kegelkasse.update({
      data: {
        ...updateKegelkasseDto,
        updatedAt: new Date(),
      },
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.kegelkasse.delete({ where: { id } });
  }

  async genReceiptPDF(id: number) {
    const retDataFile: RetDataFileDto = new RetDataFileDto();
    retDataFile.data = { filename: 'receipt.pdf' };
    retDataFile.type = 'info';
    retDataFile.message = 'genReceiptPDF';

    const kegelkasse = await this.prisma.kegelkasse.findUnique({
      where: { id: id },
      include: { user: true },
    });
    if (!kegelkasse) {
      retDataFile.type = 'error';
      retDataFile.message = 'Kegelkasse nicht gefunden';
      retDataFile.data = undefined;
      return retDataFile;
    }

    const iFontSizeHeader = 18;
    const iFontSizeTitel = 14;

    locale('ch');

    if (kegelkasse.journalid && kegelkasse.journalid > 0) {
      const workbook = new Workbook();
      // Force workbook calculation on load
      workbook.calcProperties.fullCalcOnLoad = true;

      const sSheetName = 'Kegelkasse';
      const sheet = workbook.addWorksheet(sSheetName.substring(0, 31), {
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
          oddFooter:
            '&14erstellt am ' +
            new Date().toLocaleDateString('de-CH', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }),
        },
      });

      sheet.getColumn('A').width = 17;
      sheet.getColumn('B').width = 17;
      sheet.getColumn('C').width = 17;

      const kegelDate = new Date(kegelkasse.datum);
      const kegelDateFormat = kegelDate.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      setCellValueFormat(
        sheet,
        'A1',
        'Kegelkasse ' + kegelDateFormat,
        false,
        'A1:C1',
        { bold: true, size: iFontSizeHeader, name: 'Tahoma' },
      );

      const tHeaders: (
        | string
        | {
            label: string;
            property: string;
            valign?: string;
            width: number;
            align?: string;
            renderer?: (value: string | number) => string;
          }
      )[] = [
        {
          property: 'value',
          label: 'Einheit',
          width: 80,
          align: 'right',
          renderer: (value: string) => {
            return typeof value == 'number' ? Number(value).toFixed(2) : value;
          },
        },
        { property: 'field', label: 'Anzahl', width: 80, align: 'right' },
        {
          property: 'sum',
          label: 'Total',
          width: 80,
          align: 'right',
          renderer: (value: string) => {
            return typeof value == 'number' ? Number(value).toFixed(2) : value;
          },
        },
      ];

      setCellValueFormat(sheet, 'A3', 'Einheit', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'B3', 'Anzahl', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'C3', 'Total', true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });

      const tRows: { [key: string]: string | { label: string } }[] = [];
      let sumTotal = 0;
      let row = 4;
      let record = this.writeKegelLine(sheet, row, 0.05, kegelkasse.rappen5);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.1, kegelkasse.rappen10);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.2, kegelkasse.rappen20);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.5, kegelkasse.rappen50);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 1, kegelkasse.franken1);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 2, kegelkasse.franken2);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 5, kegelkasse.franken5);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 10, kegelkasse.franken10);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 20, kegelkasse.franken20);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 50, kegelkasse.franken50);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 100, kegelkasse.franken100);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      row++;
      setCellValueFormat(
        sheet,
        'A' + row,
        'Total',
        true,
        'A' + row + ':B' + row,
        { bold: true, size: iFontSizeTitel, name: 'Tahoma' },
      );
      setCellValueFormat(sheet, 'C' + row, sumTotal, true, undefined, {
        bold: true,
        size: iFontSizeTitel,
        name: 'Tahoma',
      });
      // eslint-disable-next-line no-useless-escape
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({
        value: 'bold:Total',
        sum: `bold:${sumTotal.toFixed(2)}`,
        field: '',
      });
      row++;
      row++;
      setCellValueFormat(
        sheet,
        'A' + row,
        'Kasse',
        true,
        'A' + row + ':B' + row,
        { bold: true, size: iFontSizeTitel, name: 'Tahoma' },
      );
      setCellValueFormat(
        sheet,
        'C' + row,
        Number(kegelkasse.kasse),
        true,
        undefined,
        { bold: true, size: iFontSizeTitel, name: 'Tahoma' },
      );
      // eslint-disable-next-line no-useless-escape
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({ value: '', sum: '', field: '' });
      tRows.push({
        value: 'bold:Kasse',
        sum: `bold:${kegelkasse.kasse.toFixed(2)}`,
        field: '',
      });
      row++;
      setCellValueFormat(
        sheet,
        'A' + row,
        'Differenz',
        true,
        'A' + row + ':B' + row,
        { bold: true, size: iFontSizeTitel, name: 'Tahoma' },
      );
      setCellValueFormat(
        sheet,
        'C' + row,
        Number(kegelkasse.differenz),
        true,
        undefined,
        {
          bold: true,
          size: iFontSizeTitel,
          name: 'Tahoma',
          color: { argb: 'CD143C' },
        },
      );
      // eslint-disable-next-line no-useless-escape
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({
        value: 'bold:Differenz',
        sum: `bold:${kegelkasse.differenz.toFixed(2)}`,
        field: '',
      });
      row++;
      row++;
      setCellValueFormat(
        sheet,
        'A' + row,
        'Glattbrugg, den ' + formatDateLong(kegelDate),
        false,
        'A' + row + ':C' + row,
        { bold: false, italic: true, size: iFontSizeTitel, name: 'Tahoma' },
      );

      const filename =
        'Kegelkasse-' +
        kegelkasse.datum.toISOString().substring(0, 10) +
        '.xlsx';
      await workbook.xlsx
        .writeFile(this.configService.exports + filename)
        .catch((e) => {
          console.error(e);
          retDataFile.type = 'error';
          retDataFile.message = String(e);
          return retDataFile;
        });

      const table = {
        headers: tHeaders,
        datas: tRows,
      };

      const filenamePDF = filename.replace('.xlsx', '.pdf');
      const pdf = new PDFDocumentWithTables();
      pdf.arguments = {
        autoFirstPage: true,
        bufferPages: true,
        layout: 'portrait',
        size: 'A4',
        info: {
          Title: 'Kegelkasse ' + kegelDateFormat,
          Author: 'AutoMoto-Club Swissair, Janine Franken',
        },
      };
      // Embed a font, set the font size, and render some text
      pdf
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('Kegelkasse ' + kegelDateFormat)
        .moveDown(2);

      // draw content, by passing data to the addBody method
      await pdf.table(table, {
        divider: {
          header: { disabled: false, width: 2, opacity: 1 },
          horizontal: { disabled: false, width: 0.5, opacity: 1 },
          //vertical: { disabled: false, width: 0.5, opacity: 1 },
        },
        padding: [5, 5, 5, 5], // {Number} default: 0
        columnSpacing: 5,
        prepareHeader: () => pdf.font('Helvetica-Bold').fontSize(11),
        prepareRow: () => pdf.font('Helvetica').fontSize(11),
      });

      pdf
        .moveDown(2)
        .fontSize(12)
        .text(
          'Glattbrugg, den ' + formatDateLong(kegelDate),
          pdf.page.margins.left + 5,
        )
        .moveDown(1)
        .font('Helvetica-Oblique')
        .text(
          'Kegelkasse erfasst durch ' + kegelkasse.user!.name,
          pdf.page.margins.left + 5,
        )
        .font('Helvetica')
        .fontSize(10);

      // see the range of buffered pages
      const gedrucktAm =
        'Erstellt am: ' +
        new Date().toLocaleDateString('de-CH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
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

        const text = `Seite ${i + 1} von ${range.count}`;
        x =
          pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
        console.log(text + ' ' + x + '/' + y);
        pdf.text(text, x, y);
      }

      // Pipe its output somewhere, like to a file or HTTP response
      // See below for browser usage
      pdf.pipe(createWriteStream(global.exports + filenamePDF));

      // Finalize PDF file
      pdf.end();

      // PDF an Journaleintrag hängen
      const receipt = 'receipt/' + filenamePDF;
      const path = this.configService.documents + kegelDate.getFullYear() + '/';
      if (!existsSync(path)) {
        mkdirSync(path);
        mkdirSync(path + '/receipt');
      }
      let newReceipt = await this.prisma.receipt.create({
        data: {
          receipt: receipt,
          jahr: kegelDate.getFullYear().toString(),
          bezeichnung: 'Kegelkasse ' + kegelDateFormat,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const newFilename = 'receipt/journal-' + newReceipt.id + '.pdf';
      newReceipt.receipt = newFilename;
      retDataFile.data.filename = newFilename;
      newReceipt = await this.prisma.receipt.update({
        where: { id: newReceipt.id },
        data: { receipt: newFilename },
      });
      await this.prisma.journal_receipt.create({
        data: {
          journal: { connect: { id: kegelkasse.journalid } },
          receipt: { connect: { id: newReceipt.id } },
        },
      });
      copyFileSync(global.exports + filenamePDF, path + newFilename);
      chmod(path + newFilename, '0640', (err) => {
        if (err) {
          console.log(err);
          retDataFile.message +=
            'Error while changing the mode of the file - ' + err.message + '; ';
        }
      });
    } else {
      retDataFile.type = 'error';
      retDataFile.message = 'Journal nicht gefunden';
      retDataFile.data = undefined;
      return retDataFile;
    }
    return retDataFile;
  }

  /**
   *
   * @param {ExcelJS.Worksheet} sheet
   * @param {number} row
   * @param {number} value
   * @param {number} field
   * @return {Object}
   */
  private writeKegelLine(
    sheet: Worksheet,
    row: number,
    value: number,
    field: number,
  ) {
    setCellValueFormat(sheet, 'A' + row, value, true, undefined, {
      bold: false,
      size: 13,
      name: 'Tahoma',
    });
    sheet.getCell('A' + row).numFmt = '#,##0.00';
    setCellValueFormat(sheet, 'B' + row, field, true, undefined, {
      bold: false,
      size: 13,
      name: 'Tahoma',
    });
    sheet.getCell('B' + row).numFmt = '#,##0';
    setCellValueFormat(sheet, 'C' + row, field * value, true, undefined, {
      bold: false,
      size: 13,
      name: 'Tahoma',
    });
    // eslint-disable-next-line no-useless-escape
    sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
    return {
      sum: (field * value).toFixed(2).toString(),
      value: value.toFixed(2).toString(),
      field: field.toLocaleString(),
    };
  }
}
