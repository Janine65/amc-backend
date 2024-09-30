import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Kegelkasse } from '@/models/kegelkasse';
import { Op, Sequelize } from 'sequelize';
import { Journal } from '@/models/journal';
import { Account } from '@/models/account';
import { Meisterschaft } from '@/models/meisterschaft';
import { Anlaesse, JournalReceipt, Receipt, User } from '@/models/init-models';
import { locale } from 'numeral';
import { Workbook, Worksheet } from 'exceljs';
import PDFDocumentWithTables from 'pdfkit-table';
import { chmod, copyFileSync, createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { systemVal } from '@/utils/system';
import { formatDateLong, setCellValueFormat } from './general.service';
import { RetDataFile } from '@/models/generel';


@Service()
export class KegelkasseService {
  public async findAllKegelkasse(): Promise<Kegelkasse[]> {
    const allKegelkasse: Kegelkasse[] = await Kegelkasse.findAll();
    return allKegelkasse;
  }

  public async findKegelkasseById(kegelkasseId: string): Promise<Kegelkasse> {
    const findKegelkasse: Kegelkasse | null = await Kegelkasse.findByPk(kegelkasseId);
    if (!findKegelkasse) throw new GlobalHttpException(409, "Kegelkassen doesn't exist");

    return findKegelkasse;
  }

  public async findKegelkasseByDatum(jahr: string, monat: string): Promise<Kegelkasse | null> {
    const findKegelkasse = await Kegelkasse.findOne({
      where: [Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('datum')), monat),
      Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), jahr)],
      include: [
        {
          model: Journal, as: 'journal', required: false,
          include: [
            { model: Account, as: 'fromAccountAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
            { model: Account, as: 'toAccountAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] }
          ]
        }
      ]
    });

    return findKegelkasse;
  }

  public async findKegelkasseByJahr(jahr: string): Promise<Kegelkasse[]> {
    const findKegelkasse = await Kegelkasse.findAll({
      where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), jahr),
      include: [
        {
          model: Journal, as: 'journal', required: false,
          include: [
            { model: Account, as: 'fromAccountAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
            { model: Account, as: 'toAccountAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] }
          ]
        }
      ],
      order: ["datum"]
    });

    for (const kegel of findKegelkasse) {
      const { count } = await Meisterschaft.findAndCountAll({
        where: { total_kegel: { [Op.gt]: 5 } },
        include: [{ model: Anlaesse, as: 'event', where: { datum: kegel.datum } }]
      });
      kegel.cntUsers = count;
    }
    return findKegelkasse;
  }

  public async createKegelkasse(kegelkasseData: Kegelkasse): Promise<Kegelkasse> {
    const findKegelkasse: Kegelkasse | null = await Kegelkasse.findOne({
      where: { datum: kegelkasseData.datum }
    });
    if (findKegelkasse) throw new GlobalHttpException(409, `This kegelkasse at ${kegelkasseData.datum} already exists`);

    const createKegelkasseData: Kegelkasse = await Kegelkasse.create(kegelkasseData);
    if (createKegelkasseData.journalid && createKegelkasseData.journalid > 0) {
      createKegelkasseData.setJournal(createKegelkasseData.journalid);
    }
    return createKegelkasseData;
  }

  public async updateKegelkasse(kegelkasseId: string, kegelkasseData: Kegelkasse): Promise<Kegelkasse> {
    const findKegelkasse: Kegelkasse | null = await Kegelkasse.findByPk(kegelkasseId);
    if (!findKegelkasse) throw new GlobalHttpException(409, "Kegelkassen doesn't exist");

    await Kegelkasse.update(kegelkasseData, { where: { id: kegelkasseId } });
    if (findKegelkasse.journalid && findKegelkasse.journalid > 0) {
      findKegelkasse.setJournal(findKegelkasse.journalid);
    }

    const updateKegelkasse: Kegelkasse | null = await Kegelkasse.findByPk(kegelkasseId);
    return updateKegelkasse!;
  }

  public async deleteKegelkasse(kegelkasseId: string): Promise<Kegelkasse> {
    const findKegelkasse: Kegelkasse | null = await Kegelkasse.findByPk(kegelkasseId);
    if (!findKegelkasse) throw new GlobalHttpException(409, "Kegelkassen doesn't exist");

    await Kegelkasse.destroy({ where: { id: kegelkasseId } });

    if (findKegelkasse.journalid && findKegelkasse.journalid > 0) {
      Journal.destroy({ where: { id: findKegelkasse.journalid } });
    }
    return findKegelkasse;
  }

  public async generateKegelkassePDF(kegelkasseId: number): Promise<RetDataFile> {
    const kegelkasse: Kegelkasse | null = await Kegelkasse.findByPk(kegelkasseId, {
      include: [{
        model: User, as: 'user', required: true
      }]
    });
    if (!kegelkasse) throw new GlobalHttpException(409, "Kegelkassen doesn't exist");

    const iFontSizeHeader = 18
    const iFontSizeTitel = 14

    locale('ch');

    const payload: RetDataFile = {
      type: 'info',
      message: '',
      data: {filename: ''}
    }

    if (kegelkasse.journalid && kegelkasse.journalid > 0) {
      const workbook = new Workbook();
      // Force workbook calculation on load
      workbook.calcProperties.fullCalcOnLoad = true;

      let sSheetName = "Kegelkasse";
      let sheet = workbook.addWorksheet(sSheetName.substring(0, 31), {
        pageSetup: {
          fitToPage: true,
          fitToHeight: 1,
          fitToWidth: 1,
        },
        properties: {
          defaultRowHeight: 18
        },
        headerFooter: {
          oddHeader: "&18Auto-Moto-Club Swissair",
          oddFooter: "&14erstellt am " + new Date().toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' })
        }
      });

      sheet.getColumn('A').width = 17;
      sheet.getColumn('B').width = 17;
      sheet.getColumn('C').width = 17;

      const kegelDate = new Date(kegelkasse.datum)
      const kegelDateFormat = kegelDate.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' });

      setCellValueFormat(sheet, 'A1', "Kegelkasse " + kegelDateFormat, false, "A1:C1", { bold: true, size: iFontSizeHeader, name: 'Tahoma' });

      const tHeaders = [
          {
              property: 'value', label: 'Einheit', width: 80, align: "right",
              renderer: (value: string) => { return typeof value == 'number' ? Number(value).toFixed(2) : value }
          },
          { property: 'field', label: 'Anzahl', width: 80, align: "right" },
          {
              property: 'sum', label: 'Total', width: 80, align: "right",
              renderer: (value: string) => { return typeof value == 'number' ? Number(value).toFixed(2) : value }
          }];

      setCellValueFormat(sheet, 'A3', "Einheit", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'B3', "Anzahl", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'C3', "Total", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });

      let tRows = [];
      let sumTotal = 0
      let row = 4
      let record = this.writeKegelLine(sheet, row, 0.05, kegelkasse.rappen5);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.10, kegelkasse.rappen10);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.20, kegelkasse.rappen20);
      sumTotal += Number(record['sum']);
      tRows.push(record);
      row++;
      record = this.writeKegelLine(sheet, row, 0.50, kegelkasse.rappen50);
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
      setCellValueFormat(sheet, 'A' + row, "Total", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'C' + row, sumTotal, true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({ value: 'bold:Total', sum: `bold:${sumTotal.toFixed(2)}`, field: '' });
      row++;
      row++;
      setCellValueFormat(sheet, 'A' + row, "Kasse", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'C' + row, Number(kegelkasse.kasse), true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({ value: '', sum: '', field: '' });
      tRows.push({ options: { separation: true }, value: 'bold:Kasse', sum: `bold:${kegelkasse.kasse}`, field: '' });
      row++;
      setCellValueFormat(sheet, 'A' + row, "Differenz", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'C' + row, Number(kegelkasse.differenz), true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma', color: { argb: 'CD143C' } });
      sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
      tRows.push({ value: 'bold:Differenz', sum: `bold:${kegelkasse.differenz}`, field: '' });
      row++;
      row++;
      setCellValueFormat(sheet, 'A' + row, "Glattbrugg, den " + formatDateLong(kegelDate), false, "A" + row + ":C" + row, { bold: false, italic: true, size: iFontSizeTitel, name: 'Tahoma' });

      const filename = "Kegelkasse-" + kegelkasse.datum + ".xlsx";
      await workbook.xlsx.writeFile(systemVal.exports + filename)
          .catch((e) => {
              console.error(e);
              payload.type = 'error';
              payload.message = e;
              return payload;
          });

      const table = {
          headers: tHeaders,
          datas: tRows
      };

      const filenamePDF = filename.replace('.xlsx', '.pdf')
      let pdf = new PDFDocumentWithTables();
      pdf.arguments = {
          autoFirstPage: true,
          bufferPages: true,
          layout: 'portrait',
          size: 'A4',
          info: {
              Title: 'Kegelkasse ' + kegelDateFormat,
              Author: 'AutoMoto-Club Swissair, Janine Franken'
          }
      };
      // Embed a font, set the font size, and render some text
      pdf
          .font('Helvetica-Bold')
          .fontSize(18)
          .text('Kegelkasse ' + kegelDateFormat)
          .moveDown(2);

      // draw content, by passing data to the addBody method
      pdf.table(table, {
          divider: {
              header: { disabled: false, width: 2, opacity: 1 },
              horizontal: { disabled: false, width: 0.5, opacity: 1 },
              //vertical: { disabled: false, width: 0.5, opacity: 1 },
          },
          padding: [5,5,5,5], // {Number} default: 0
          columnSpacing: 5,
          prepareHeader: () => pdf.font("Helvetica-Bold").fontSize(11),
          prepareRow: () => pdf.font("Helvetica").fontSize(11)
      })

      pdf
          .moveDown(2)
          .fontSize(12)
          .text('Glattbrugg, den ' + formatDateLong(kegelDate), pdf.page.margins.left + 5)
          .moveDown(1)
          .font('Helvetica-Oblique')
          .text('Kegelkasse erfasst durch ' + kegelkasse.user.name, pdf.page.margins.left + 5)
          .font("Helvetica")
          .fontSize(10)

      // see the range of buffered pages            
      let gedrucktAm = 'Erstellt am: ' + new Date().toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const range = pdf.bufferedPageRange(); // => { start: 0, count: 1 ... }
      for (let i = range.start, end = range.start + range.count; i < end; i++) {
          pdf.switchToPage(i);

          let x = pdf.page.margins.left + 5;
          let y = pdf.page.height - pdf.heightOfString(gedrucktAm) - pdf.page.margins.bottom;
          console.log(gedrucktAm + ' ' + x + '/' + y);
          pdf.text(gedrucktAm, x, y);

          let text = `Seite ${i + 1} von ${range.count}`
          x = pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
          console.log(text + ' ' + x + '/' + y);
          pdf.text(text, x, y);
      }

      // Pipe its output somewhere, like to a file or HTTP response
      // See below for browser usage
      pdf.pipe(createWriteStream(global.exports + filenamePDF));

      // Finalize PDF file
      pdf.end();

      // PDF an Journaleintrag hängen
      const receipt = 'receipt/' + filenamePDF
      const path = systemVal.documents + kegelDate.getFullYear() + '/';
      if (!existsSync(path)) {
          mkdirSync(path);
          mkdirSync(path + '/receipt');
      }
      let newReceipt = Receipt.build({ receipt: receipt, jahr: kegelDate.getFullYear().toString(), bezeichnung: 'Kegelkasse ' + kegelDateFormat })
      newReceipt = await newReceipt.save({ fields: ['receipt', 'jahr', 'bezeichnung'] });
      let newFilename = 'receipt/journal-' + newReceipt.id + '.pdf'
      newReceipt.receipt = newFilename
      payload.data!.filename = newFilename
      newReceipt = await newReceipt.save({ fields: ['receipt'] });
      copyFileSync(global.exports + filenamePDF, path + newFilename);
      chmod(path + newFilename, '0640', err => {
          if (err) {
              console.log(err)
              payload.message += "Error while changing the mode of the file - " + err.message + "; "
          }
      });
      let journal = JournalReceipt.build({ journalid: kegelkasse.journalid, receiptid: newReceipt.id });
      await journal.save();

      return payload
    } else {
      payload.type = 'error';
      payload.message = 'Kegelkasse nicht mit Journal verbunden'
      return payload
    }

  }

/**
 * 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {number} row
 * @param {number} value
 * @param {number} field
 * @return {Object}
 */
private writeKegelLine(sheet: Worksheet, row: number, value: number, field: number) {
  setCellValueFormat(sheet, 'A' + row, value, true, undefined, { bold: false, size: 13, name: 'Tahoma' });
  sheet.getCell('A' + row).numFmt = '#,##0.00';
  setCellValueFormat(sheet, 'B' + row, field, true, undefined, { bold: false, size: 13, name: 'Tahoma' });
  sheet.getCell('B' + row).numFmt = '#,##0';
  setCellValueFormat(sheet, 'C' + row, field * value, true, undefined, { bold: false, size: 13, name: 'Tahoma' });
  sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
  return { sum: (field * value).toFixed(2).toString(), value: value.toFixed(2).toString(), field: field.toLocaleString() };
}


}
