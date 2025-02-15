import { Injectable, ConflictException } from '@nestjs/common';
import { CreateAdressenDto } from './dto/create-adressen.dto';
import { UpdateAdressenDto } from './dto/update-adressen.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailBody } from './dto/email-body.dto';
import {
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { createTransport } from 'nodemailer';
import { Mailer } from 'nodemailer/lib/mailer';
import { ConfigService } from 'src/config/config.service';
import path from 'node:path';
import { ConfigSmtpDtoClass } from 'src/config/dto/config.dto';
import { FilterAdressenDto } from './dto/filter-adressen.dto';
import { OverviewDto } from './dto/overview.dto';
import { Workbook } from 'exceljs';
import {
  iFontSizeRow,
  iFontSizeTitel,
  setCellValueFormat,
} from 'src/utils/general.service';
import { RetDataDto, RetDataFileDto } from 'src/utils/ret-data.dto';
import PDFDocumentWithTables from 'pdfkit-table';
import { mm2pt } from 'swissqrbill/utils';
import { SwissQRBill } from 'swissqrbill/pdf';
import { CreateJournalDto } from '../journal/dto/create-journal.dto';
import { CreateReceiptDto } from '../receipt/dto/create-receipt.dto';
import { CreateJournalReceiptDto } from '../journal-receipt/dto/create-journal-receipt.dto';

@Injectable()
export class AdressenService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createAdressenDto: CreateAdressenDto) {
    const adr = await this.prisma.adressen.findFirst({
      where: {
        vorname: createAdressenDto.vorname,
        name: createAdressenDto.name,
      },
    });
    if (adr) {
      throw new ConflictException('Adress already exists');
    }
    if (typeof createAdressenDto.eintritt === 'string') {
      createAdressenDto.eintritt = new Date(createAdressenDto.eintritt);
    }
    if (
      createAdressenDto.austritt &&
      typeof createAdressenDto.austritt === 'string'
    ) {
      createAdressenDto.austritt = new Date(createAdressenDto.austritt);
    }
    const data = {
      ...createAdressenDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      fullname: createAdressenDto.vorname + ' ' + createAdressenDto.name,
    };
    return this.prisma.adressen.create({ data: data });
  }

  findAll() {
    return this.prisma.adressen.findMany({
      where: { austritt: { gte: new Date() } },
      orderBy: [{ name: 'asc' }, { vorname: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.adressen.findUnique({ where: { id: id } });
  }

  update(id: number, updateAdressenDto: UpdateAdressenDto) {
    return this.prisma.adressen.update({
      data: updateAdressenDto,
      where: { id: id },
    });
  }

  remove(id: number) {
    return this.prisma.adressen.delete({ where: { id: id } });
  }

  async getOverview(): Promise<OverviewDto[]> {
    // get a json file with the following information to display on first page:
    // count of active adressen
    // count of SAM_Mitglieder
    // count of not SAM_Mitglieder
    const arResult: OverviewDto[] = [
      { label: 'Aktive Mitglieder', value: 0 },
      { label: 'SAM Mitglieder', value: 0 },
      { label: 'Freimitglieder', value: 0 },
    ];

    arResult[0].value = await this.prisma.adressen.count({
      where: { austritt: { gte: new Date() } },
    });

    arResult[1].value = await this.prisma.adressen.count({
      where: { austritt: { gte: new Date() }, sam_mitglied: true },
    });

    arResult[2].value = await this.prisma.adressen.count({
      where: { austritt: { gte: new Date() }, sam_mitglied: false },
    });

    return arResult;
  }

  async getFKData() {
    const data = await this.prisma.adressen.findMany({
      where: { austritt: { gte: new Date() } },
      select: { id: true, fullname: true },
      orderBy: { fullname: 'asc' },
    });
    const result: { id: number; value: string }[] = [];
    for (const adr of data) {
      result.push({ id: adr.id, value: adr.fullname! });
    }
    return result;
  }

  async exportAdressen(filter: FilterAdressenDto): Promise<RetDataFileDto> {
    const constructedWhere = Object.keys(filter).reduce(
      (aggregate: Record<string, any>, property) => {
        aggregate[property] = filter[property];
        return aggregate;
      },
      {} as Record<string, any>,
    );
    const lstAdressen = await this.prisma.adressen.findMany({
      where: constructedWhere,
      orderBy: [{ name: 'asc' }, { vorname: 'asc' }],
    });

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const fmtToday = new Date().toLocaleDateString('de-CH', options);

    const workbook = new Workbook();

    workbook.creator = 'Janine Franken';
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const sheet = workbook.addWorksheet('Adressen', {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      headerFooter: {
        oddHeader: '&18Auto-Moto-Club Swissair',
        oddFooter: '&14Adressen Stand per ' + fmtToday,
      },
    });

    setCellValueFormat(sheet, 'A1', 'MNR', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'B1', 'Anrede', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'C1', 'Name', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'D1', 'Vorname', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'E1', 'Adresse', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'F1', 'PLZ', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'G1', 'Ort', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'H1', 'Land', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'I1', 'Telefon (P)', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'J1', 'Mobile', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'K1', 'Email', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'L1', 'Notizen', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'M1', 'SAM Nr.', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'N1', 'SAM Mitglied', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'O1', 'Ehrenmitglied', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'P1', 'Vorstand', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'Q1', 'Revisor', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'R1', 'Allianz', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'S1', 'Eintritt', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });
    setCellValueFormat(sheet, 'T1', 'Austritt', true, '', {
      bold: true,
      size: iFontSizeTitel,
      name: 'Tahoma',
    });

    let row = 2;

    for (const element of lstAdressen) {
      setCellValueFormat(sheet, 'A' + row, element.mnr, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(
        sheet,
        'B' + row,
        element.geschlecht == 1 ? 'Herr' : 'Frau',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      setCellValueFormat(sheet, 'C' + row, element.name, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'D' + row, element.vorname, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'E' + row, element.adresse, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'F' + row, element.plz, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'G' + row, element.ort, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'H' + row, element.land, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'I' + row, element.telefon_p, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'J' + row, element.mobile, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'K' + row, element.email, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'L' + row, element.notes, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(sheet, 'M' + row, element.mnr_sam, true, '', {
        size: iFontSizeRow,
        name: 'Tahoma',
      });
      setCellValueFormat(
        sheet,
        'N' + row,
        element.sam_mitglied ? 'Ja' : 'Nein',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('N' + row).alignment = { horizontal: 'center' };
      setCellValueFormat(
        sheet,
        'O' + row,
        element.ehrenmitglied ? 'Ja' : 'Nein',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('O' + row).alignment = { horizontal: 'center' };
      setCellValueFormat(
        sheet,
        'P' + row,
        element.vorstand ? 'Ja' : 'Nein',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('P' + row).alignment = { horizontal: 'center' };
      setCellValueFormat(
        sheet,
        'Q' + row,
        element.revisor ? 'Ja' : 'Nein',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('Q' + row).alignment = { horizontal: 'center' };
      setCellValueFormat(
        sheet,
        'R' + row,
        element.allianz ? 'Ja' : 'Nein',
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      sheet.getCell('R' + row).alignment = { horizontal: 'center' };
      setCellValueFormat(
        sheet,
        'S' + row,
        new Date(element.eintritt!).toLocaleDateString('de-CH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );
      const date = new Date(element.austritt!);
      const dateFmt = date.toLocaleDateString('de-DE', options);
      setCellValueFormat(
        sheet,
        'T' + row,
        dateFmt == '01.01.3000' ? '' : dateFmt,
        true,
        '',
        { size: iFontSizeRow, name: 'Tahoma' },
      );

      row++;
    }

    sheet.autoFilter = 'A1:T1';

    sheet.getColumn('A').width = 10;
    sheet.getColumn('B').width = 12;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 25;
    sheet.getColumn('F').width = 8;
    sheet.getColumn('G').width = 25;
    sheet.getColumn('H').width = 10;
    sheet.getColumn('I').width = 20;
    sheet.getColumn('J').width = 20;
    sheet.getColumn('K').width = 35;
    sheet.getColumn('L').width = 35;
    sheet.getColumn('M').width = 13;
    sheet.getColumn('N').width = 20;
    sheet.getColumn('O').width = 20;
    sheet.getColumn('P').width = 20;
    sheet.getColumn('Q').width = 20;
    sheet.getColumn('R').width = 20;
    sheet.getColumn('S').width = 12;
    sheet.getColumn('T').width = 12;

    const filename = 'Adressen-' + fmtToday + '.xlsx';
    await workbook.xlsx
      .writeFile(this.configService.exports + filename)
      .catch((e) => {
        console.error(e);
        return {
          type: 'error',
          message: e,
          data: { filename: '' },
        };
      });

    return {
      type: 'info',
      message: 'Excelfile erstellt',
      data: { filename: filename },
    };
  }

  async createQRBill(id: number): Promise<RetDataFileDto> {
    const retData: RetDataFileDto = {
      type: 'info',
      message: '',
      data: { filename: '' },
    };
    const jahr = this.configService.params.get('CLUBJAHR');

    const adresse = await this.prisma.adressen.findUnique({
      where: { id: id },
    });
    if (!adresse) {
      retData.type = 'error';
      retData.message = 'Adresse nicht gefunden';
      return retData;
    }

    const qrData = {
      currency: 'CHF' as 'CHF' | 'EUR',
      //amount: 30.0,
      additionalInformation: 'Rechnungsnummer ' + jahr + '0000' + adresse.mnr,
      av1: 'twint/light/02:627a1c3325b04c5cbbbe9afcdfb6501b#6298bbc2451e7f036c9e39e989c20452aa6afd8a#',
      av2: 'rn/twint/a~8Hbq5Y6GTd6RWWoWJ3pOsg~s~YbdhuKDqS5edL5KCHuzvtw/rn',
      creditor: {
        name: 'Auto-Moto-Club Swissair',
        address: 'Breitenrain',
        buildingNumber: '4',
        zip: 8917,
        city: 'Oberlunkhofen',
        account: 'CH3009000000870661227',
        country: 'CH',
      },
      debtor: {
        name: adresse.vorname + ' ' + adresse.name,
        address: adresse.adresse,
        zip: adresse.plz,
        city: adresse.ort,
        country: adresse.land,
      },
    };

    const filename =
      'AMC-Mitgliederbeitrag-' + jahr + '-' + adresse.mnr + '.pdf';
    retData.data!.filename = filename;

    const stream = createWriteStream(this.configService.uploads + filename);

    const pdf = new PDFDocumentWithTables({
      autoFirstPage: true,
      size: 'A4',
    });
    pdf.pipe(stream);
    pdf.info = {
      Title: 'Mitgliederrechnung ' + jahr,
      Author: 'Auto-Moto-Club Swissair',
      Subject: 'Mitgliederrechnung ' + jahr,
      CreationDate: new Date(),
    };

    // Fit the image within the dimensions
    let img = readFileSync(this.configService.assets + '/AMCfarbigKlein.jpg');
    pdf.image(img.buffer, mm2pt(140), mm2pt(5), { fit: [100, 100] });

    const date = new Date();

    pdf.fontSize(12);
    pdf.fillColor('black');
    pdf.font('Helvetica');
    pdf.text(
      qrData.creditor.name +
        '\n' +
        qrData.creditor.address +
        '\n' +
        qrData.creditor.zip +
        ' ' +
        qrData.creditor.city,
      mm2pt(20),
      mm2pt(35),
      {
        width: mm2pt(100),
        align: 'left',
      },
    );

    pdf.fontSize(12);
    pdf.font('Helvetica');
    pdf.text(
      qrData.debtor.name +
        '\n' +
        qrData.debtor.address +
        '\n' +
        qrData.debtor.zip +
        ' ' +
        qrData.debtor.city,
      mm2pt(130),
      mm2pt(60),
      {
        width: mm2pt(70),
        height: mm2pt(50),
        align: 'left',
      },
    );

    pdf.moveDown();
    pdf.fontSize(11);
    pdf.font('Helvetica');
    pdf.text(
      'Oberlunkhofen ' +
        date.getDate() +
        '.' +
        (date.getMonth() + 1) +
        '.' +
        date.getFullYear(),
      {
        width: mm2pt(170),
        align: 'right',
      },
    );

    pdf.moveDown();
    pdf.fontSize(14);
    pdf.font('Helvetica-Bold');
    pdf.text(qrData.additionalInformation, mm2pt(20), mm2pt(100), {
      width: mm2pt(140),
      align: 'left',
    });

    pdf.moveDown();
    pdf.fontSize(12);
    pdf.fillColor('black');
    pdf.font('Helvetica');

    let text =
      (adresse.geschlecht == 1 ? 'Lieber ' : 'Liebe ') + adresse.vorname + '\n';
    pdf.text(text, {
      width: mm2pt(170),
      align: 'left',
    });
    text += this.configService.params.get('RECHNUNG') + '\n';
    pdf.text(`${this.configService.params.get('RECHNUNG')}\n`, {
      width: mm2pt(170),
      align: 'justify',
    });
    pdf.moveDown();
    text += `Mit liebem Clubgruss\nJanine Franken`;
    pdf.text(`Mit liebem Clubgruss\nJanine Franken`, {
      width: mm2pt(170),
      align: 'left',
    });

    pdf.moveDown();
    pdf.fontSize(10);
    pdf.text(
      `Bitte beachte, dass für Einzahlungen am Postschalter eine Gebühr von CHF 2.50 erhoben wird. Zahlungen via Twint, Banküberweisung oder E-Finance sind kostenlos.\n`,
      {
        width: mm2pt(170),
        align: 'justify',
        oblique: true,
      },
    );

    // Fit the image within the dimensions
    img = readFileSync(
      this.configService.assets + '/RNW-TWINT-SWISS-QR-DE.png',
    );
    pdf.image(img.buffer, mm2pt(0), mm2pt(182), {
      fit: [mm2pt(210), mm2pt(10)],
    });

    const qrBill = new SwissQRBill(qrData);
    qrBill.attachTo(pdf);
    pdf.save();
    pdf.end();

    const email_body = '<p>' + text.split('\n').join('</p><p>') + '</p>';

    const email: EmailBody = {
      email_an: adresse.email!,
      email_cc: '',
      email_bcc: '',
      email_body: email_body,
      email_subject: 'Auto-Moto-Club Swissair - Mitgliederrechnung',
      email_uploadfiles: filename,
      email_signature: 'JanineFranken',
    };

    const retVal = await this.sendEmail(email);
    if (retVal.type != '250 Message received') {
      retData.type = 'error';
      retData.message = retVal.type;
      return retData;
    }

    // journal Eintrag erstellen
    const journal: CreateJournalDto = new CreateJournalDto();
    journal.memo = 'Mitgliederbeitrag ' + jahr + ' von ' + qrData.debtor.name;
    journal.date = new Date();
    journal.year = date.getFullYear();
    journal.amount = 30;
    journal.from_account = 31;
    journal.to_account = 21;

    const jourAdd = await this.prisma.journal.create({
      data: {
        ...journal,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // dokument verschieben
    const pathname = this.configService.documents + jahr + '/';
    const receiptName = 'receipt/' + 'Journal-' + jourAdd.id + '.pdf';
    if (!existsSync(pathname)) {
      mkdirSync(pathname);
      mkdirSync(pathname + '/receipt');
    }
    if (existsSync(this.configService.uploads + filename)) {
      copyFileSync(
        this.configService.uploads + filename,
        pathname + receiptName,
      );
    } else {
      retData.type = 'error';
      retData.message =
        'QR-Rechnung erstellt und versendet. Konnte File nicht kopieren und an den Journaleintrag hängen';
      return retData;
    }

    // anhang erstellen
    const receipt = new CreateReceiptDto();
    receipt.receipt = receiptName;
    receipt.bezeichnung = filename;
    receipt.jahr = jahr;
    const receiptAdd = await this.prisma.receipt.create({
      data: {
        ...receipt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // anhang mit journaleintrag verbinden
    const journal2receipt = new CreateJournalReceiptDto();
    journal2receipt.journalid = jourAdd.id;
    journal2receipt.receiptid = receiptAdd.id;
    await this.prisma.journal_receipt.create({ data: journal2receipt });

    retData.message = 'QR-Rechnung erstellt und versendet';
    return retData;
  }

  async sendEmail(emailBody: EmailBody): Promise<RetDataDto> {
    if (
      emailBody.email_an == undefined &&
      emailBody.email_bcc == undefined &&
      emailBody.email_cc == undefined
    )
      return {
        type: 'error',
        message: 'No recipients defined',
        data: {},
      };
    if (emailBody.email_body == undefined)
      return {
        type: 'error',
        message: 'No message to send',
        data: {},
      };

    if ((emailBody.email_signature ?? '') == '')
      emailBody.email_signature = this.configService.thisConfig.defaultEmail;

    const smtpConfig: ConfigSmtpDtoClass = this.configService.get(
      emailBody.email_signature ?? '',
      {},
    ) as ConfigSmtpDtoClass;
    try {
      const email_signature = readFileSync(
        this.configService.assets + emailBody.email_signature + '.html',
      );
      emailBody.email_body += '<p>' + email_signature.toString() + '</p>';
    } catch (error: unknown) {
      return {
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
        data: {},
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const transporter: Mailer = createTransport({
      host: smtpConfig.smtp,
      port: smtpConfig.smtp_port,
      secure: true,
      auth: {
        user: smtpConfig.smtp_user,
        pass: this.configService.decrypt(smtpConfig.smtp_pwd),
      },
    });

    // verify connection configuration
    transporter.verify(function (error: Error | null, success: boolean) {
      if (error) {
        console.error('SMTP Connection can not be verified', error.message);
      } else if (success) {
        console.log('Server is ready to take our messages');
      }
    });

    const attachments: { filename: string; path: string }[] = [];

    if (emailBody.email_uploadfiles) {
      const files = emailBody.email_uploadfiles.split(',');
      for (const file of files) {
        attachments.push({
          filename: file,
          path: path.join(this.configService.uploads, file),
        });
      }
    }

    await transporter.sendMail({
      from: smtpConfig.email_from, // sender address
      to: emailBody.email_an, // list of receivers
      cc: emailBody.email_cc,
      bcc: emailBody.email_bcc,
      attachments: attachments,
      subject: emailBody.email_subject, // Subject line
      text: decodeURI(emailBody.email_body), // plain text body
      html: emailBody.email_body, // html body
    });

    transporter.close();
    return {
      type: '250 Message received',
      message: 'Email sent',
      data: {},
    };
  }
}
