import { Service } from "typedi";
import { GlobalHttpException } from "@/exceptions/globalHttpException";
import { Adresse, AdresseAttributes } from "@/models/adresse";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { Workbook } from "exceljs";
import {
  iFontSizeRow,
  iFontSizeTitel,
  setCellValueFormat,
} from "./general.service";
import { systemVal } from "@/utils/system";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createTransport, SentMessageInfo } from "nodemailer";
import path from "node:path";
import { RetData, RetDataFile } from "@/models/generel";
import PDFDocumentWithTables from "pdfkit-table";
import { mm2pt } from "swissqrbill/utils";
import { SwissQRBill } from "swissqrbill/pdf";
import { Journal } from "@/models/journal";
import { Receipt } from "@/models/receipt";
import { JournalReceipt } from "@/models/journalReceipt";

@Service()
export class FilterAdressen {
  adresse: string | undefined;
  name: string | undefined;
  vorname: string | undefined;
  ort: string | undefined;
  plz: string | undefined;
  sam_mitglied: string | undefined;
  vorstand: string | undefined;
  revisor: string | undefined;
  ehrenmitglied: string | undefined;
}

export class EmailBody {
  email_signature: string | undefined;
  email_an: string | undefined;
  email_cc: string | undefined;
  email_bcc: string | undefined;
  email_subject: string | undefined;
  email_body: string | undefined;
  email_uploadfiles: string | undefined;
}

export class AdresseService {
  public async findAllAdresse(): Promise<Adresse[]> {
    const allAdresse: Adresse[] = await Adresse.findAll({
      where: { austritt: { [Op.gte]: Sequelize.fn("NOW") } },
      order: ["name", "vorname"]
    });
    return allAdresse;
  }

  public async findAdresseById(adresseId: string): Promise<Adresse> {
    const findAdresse: Adresse | null = await Adresse.findByPk(adresseId);
    if (!findAdresse)
      throw new GlobalHttpException(409, "Adressen doesn't exist");

    return findAdresse;
  }

  public async createAdresse(adresseData: Adresse): Promise<Adresse> {
    const findAdresse: Adresse | null = await Adresse.findOne({
      where: { name: adresseData.name, vorname: adresseData.vorname },
    });
    if (findAdresse)
      throw new GlobalHttpException(
        409,
        `This person ${adresseData.name} ${adresseData.vorname} already exists`
      );

    const createAdresseData: Adresse = await Adresse.create(adresseData);
    return createAdresseData;
  }

  public async updateAdresse(
    adresseId: string,
    adresseData: Adresse
  ): Promise<Adresse> {
    const findAdresse: Adresse | null = await Adresse.findByPk(adresseId);
    if (!findAdresse)
      throw new GlobalHttpException(409, "Adressen doesn't exist");

    await findAdresse.update(adresseData, { where: { id: adresseId } });

    const updateAdresse: Adresse | null = await Adresse.findByPk(adresseId);
    return updateAdresse!;
  }

  public async deleteAdresse(adresseId: string): Promise<Adresse> {
    const findAdresse: Adresse | null = await Adresse.findByPk(adresseId);
    if (!findAdresse)
      throw new GlobalHttpException(409, "Adressen doesn't exist");

    await Adresse.destroy({ where: { id: adresseId } });

    return findAdresse;
  }

  public async getOverview(): Promise<unknown> {
    // get a json file with the following information to display on first page:
    // count of active adressen
    // count of SAM_Mitglieder
    // count of not SAM_Mitglieder

    const arResult = [
      { label: "Aktive Mitglieder", value: 0 },
      { label: "SAM Mitglieder", value: 0 },
      { label: "Freimitglieder", value: 0 },
    ];

    let anzahl = await Adresse.count({
      where: { austritt: { [Op.gt]: Sequelize.fn("NOW") } },
    });
    arResult[0].value = anzahl;

    anzahl = await Adresse.count({
      where: [
        { austritt: { [Op.gt]: Sequelize.fn("NOW") } },
        { sam_mitglied: true },
      ],
    });
    arResult[1].value = anzahl;

    anzahl = await Adresse.count({
      where: [
        { austritt: { [Op.gt]: Sequelize.fn("NOW") } },
        { sam_mitglied: false },
      ],
    });
    arResult[2].value = anzahl;

    return arResult;
  }

  public async getFKData(): Promise<unknown> {
    const data = await Adresse.findAll({
      attributes: ["id", ["fullname", "value"]],
      where: [{ austritt: { [Op.gte]: new Date() } }],
      order: ["fullname"],
    });

    return data;
  }

  public async exportAdressen(filter: FilterAdressen): Promise<RetDataFile> {
    const sWhere: WhereOptions<AdresseAttributes> = {};
    sWhere.austritt = { [Op.gte]: new Date() };
    if (filter.adresse != '') sWhere.adresse = { [Op.like]: "%" + filter.adresse + "%" };
    if (filter.name != '') sWhere.name = { [Op.like]: "%" + filter.name + "%" };
    if (filter.vorname != '') sWhere.vorname = { [Op.like]: "%" + filter.vorname + "%" };
    if (filter.ort != '') sWhere.ort = { [Op.like]: "%" + filter.ort + "%" };
    //if (filter.plz) sWhere.plz = { [Op.like]: "%" + filter.plz + "%" };
    if (typeof filter.sam_mitglied == 'boolean') sWhere.sam_mitglied = filter.sam_mitglied;
    if (typeof filter.vorstand == 'boolean') sWhere.vorstand = filter.vorstand;
    if (typeof filter.revisor == 'boolean') sWhere.revisor = filter.revisor;
    if (typeof filter.ehrenmitglied == 'boolean') sWhere.ehrenmitglied = filter.ehrenmitglied;

    const lstAdressen = await Adresse.findAll({
      where: sWhere,
      order: ["name", "vorname"],
    });

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const fmtToday = new Date().toLocaleDateString("de-CH", options);

    const workbook = new Workbook();

    workbook.creator = "Janine Franken";
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const sheet = workbook.addWorksheet("Adressen", {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      headerFooter: {
        oddHeader: "&18Auto-Moto-Club Swissair",
        oddFooter: "&14Adressen Stand per " + fmtToday,
      },
    });

    setCellValueFormat(sheet, "A1", "MNR", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "B1", "Anrede", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "C1", "Name", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "D1", "Vorname", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "E1", "Adresse", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "F1", "PLZ", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "G1", "Ort", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "H1", "Land", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "I1", "Telefon (P)", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "J1", "Mobile", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "K1", "Email", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "L1", "Notizen", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "M1", "SAM Nr.", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "N1", "SAM Mitglied", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "O1", "Ehrenmitglied", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "P1", "Vorstand", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "Q1", "Revisor", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "R1", "Allianz", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "S1", "Eintritt", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(sheet, "T1", "Austritt", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });

    let row = 2;

    for (const element of lstAdressen) {
      setCellValueFormat(sheet, "A" + row, element.mnr, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(
        sheet,
        "B" + row,
        element.geschlecht == 1 ? "Herr" : "Frau",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      setCellValueFormat(sheet, "C" + row, element.name, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "D" + row, element.vorname, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "E" + row, element.adresse, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "F" + row, element.plz, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "G" + row, element.ort, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "H" + row, element.land, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "I" + row, element.telefon_p, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "J" + row, element.mobile, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "K" + row, element.email, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "L" + row, element.notes, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(sheet, "M" + row, element.mnr_sam, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      setCellValueFormat(
        sheet,
        "N" + row,
        element.sam_mitglied ? "Ja" : "Nein",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("N" + row).alignment = { horizontal: "center" };
      setCellValueFormat(
        sheet,
        "O" + row,
        element.ehrenmitglied ? "Ja" : "Nein",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("O" + row).alignment = { horizontal: "center" };
      setCellValueFormat(
        sheet,
        "P" + row,
        element.vorstand ? "Ja" : "Nein",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("P" + row).alignment = { horizontal: "center" };
      setCellValueFormat(
        sheet,
        "Q" + row,
        element.revisor ? "Ja" : "Nein",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("Q" + row).alignment = { horizontal: "center" };
      setCellValueFormat(
        sheet,
        "R" + row,
        element.allianz ? "Ja" : "Nein",
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("R" + row).alignment = { horizontal: "center" };
      setCellValueFormat(
        sheet,
        "S" + row,
        new Date(element.eintritt!).toLocaleDateString("de-CH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      const date = new Date(element.austritt!);
      const dateFmt = date.toLocaleDateString("de-DE", options);
      setCellValueFormat(
        sheet,
        "T" + row,
        dateFmt == "01.01.3000" ? "" : dateFmt,
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );

      row++;
    }

    sheet.autoFilter = "A1:T1";

    sheet.getColumn("A").width = 10;
    sheet.getColumn("B").width = 12;
    sheet.getColumn("C").width = 15;
    sheet.getColumn("D").width = 15;
    sheet.getColumn("E").width = 25;
    sheet.getColumn("F").width = 8;
    sheet.getColumn("G").width = 25;
    sheet.getColumn("H").width = 10;
    sheet.getColumn("I").width = 20;
    sheet.getColumn("J").width = 20;
    sheet.getColumn("K").width = 35;
    sheet.getColumn("L").width = 35;
    sheet.getColumn("M").width = 13;
    sheet.getColumn("N").width = 20;
    sheet.getColumn("O").width = 20;
    sheet.getColumn("P").width = 20;
    sheet.getColumn("Q").width = 20;
    sheet.getColumn("R").width = 20;
    sheet.getColumn("S").width = 12;
    sheet.getColumn("T").width = 12;

    const filename = "Adressen-" + fmtToday + ".xlsx";
    await workbook.xlsx.writeFile(systemVal.exports + filename).catch((e) => {
      console.error(e);
      return {
        type: "error",
        message: e,
        data: { filename: '' },
      };
    });

    return {
      type: "info",
      message: "Excelfile erstellt",
      data: { filename: filename },
    };
  }

  public async sendEmail(emailBody: EmailBody): Promise<RetData> {
    if (
      emailBody.email_an == undefined &&
      emailBody.email_bcc == undefined &&
      emailBody.email_cc == undefined
    )
      return {
        type: "error",
        message: "No recipients defined",
        data: {}
      };
    if (emailBody.email_body == undefined)
      return {
        type: "error",
        message: "No message to send",
        data: {}
      };

    if ((emailBody.email_signature ?? "") == "")
      emailBody.email_signature = systemVal.gConfig.defaultEmail;

    try {
      const email_signature = readFileSync(
        systemVal.assets + emailBody.email_signature + ".html"
      );
      emailBody.email_body += "<p>" + email_signature + "</p>";
    } catch (error) {
      return {
        type: "error",
        message: error as string,
        data: {}
      };
    }

    const emailConfig = systemVal.getConfig(emailBody.email_signature!);

    const transporter = createTransport({
      host: emailConfig.smtp,
      port: emailConfig.smtp_port,
      secure: true,
      auth: {
        user: emailConfig.smtp_user,
        pass: systemVal.cipher.decrypt(emailConfig.smtp_pwd),
      },
    });

    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        return {
          type: "error",
          message: "SMTP Connection can not be verified",
          data: {}
        };
      }
      if (success) {
        console.log("Server is ready to take our messages");
      }
    });

    const attachments = [];

    if (emailBody.email_uploadfiles) {
      const files = emailBody.email_uploadfiles.split(",");
      for (const file of files) {
        attachments.push({
          filename: file,
          path: path.join(systemVal.uploads, file),
        });
      }
    }

    const retData: SentMessageInfo = await transporter.sendMail({
      from: emailConfig.email_from, // sender address
      to: emailBody.email_an, // list of receivers
      cc: emailBody.email_cc,
      bcc: emailBody.email_bcc,
      attachments: attachments,
      subject: emailBody.email_subject, // Subject line
      text: decodeURI(emailBody.email_body!), // plain text body
      html: emailBody.email_body, // html body
    });

    transporter.close();
    return { type: retData.response, message: 'Email sent', data: retData };
  }

  public async createQRBill(adresse: Adresse,): Promise<RetDataFile> {
    const retData: RetDataFile = { type: 'info', message: '', data: { filename: '' } };
    const jahr = systemVal.Parameter.get('CLUBJAHR');

    const qrData = {
      currency: "CHF" as "CHF" | "EUR",
      //amount: 30.0,
      additionalInformation: "Rechnungsnummer " + jahr + "0000" + adresse.mnr,
      av1: "twint/light/02:627a1c3325b04c5cbbbe9afcdfb6501b#6298bbc2451e7f036c9e39e989c20452aa6afd8a#",
      av2: "rn/twint/a~8Hbq5Y6GTd6RWWoWJ3pOsg~s~YbdhuKDqS5edL5KCHuzvtw/rn",
      creditor: {
        name: "Auto-Moto-Club Swissair",
        address: "Breitenrain",
        buildingNumber: "4",
        zip: 8917,
        city: "Oberlunkhofen",
        account: "CH3009000000870661227",
        country: "CH"
      },
      debtor: {
        name: adresse.vorname + " " + adresse.name,
        address: adresse.adresse,
        zip: adresse.plz,
        city: adresse.ort,
        country: adresse.land
      }
    };

    const filename = "AMC-Mitgliederbeitrag-" + jahr + "-" + adresse.mnr + ".pdf";
    retData.data!.filename = filename;

    const stream = createWriteStream(systemVal.uploads + filename);

    const pdf = new PDFDocumentWithTables({
      autoFirstPage: true,
      size: "A4"
    });
    pdf.pipe(stream);
    pdf.info = {
      Title: "Mitgliederrechnung " + jahr,
      Author: "Auto-Moto-Club Swissair",
      Subject: "Mitgliederrechnung " + jahr,
      CreationDate: new Date()
    }

    // Fit the image within the dimensions
    let img = readFileSync(systemVal.assets + '/AMCfarbigKlein.jpg');
    pdf.image(img.buffer, mm2pt(140), mm2pt(5),
      { fit: [100, 100] });

    const date = new Date();

    pdf.fontSize(12);
    pdf.fillColor("black");
    pdf.font("Helvetica");
    pdf.text(qrData.creditor.name + "\n" + qrData.creditor.address + "\n" + qrData.creditor.zip + " " + qrData.creditor.city, mm2pt(20), mm2pt(35), {
      width: mm2pt(100),
      align: "left"
    });

    pdf.fontSize(12);
    pdf.font("Helvetica");
    pdf.text(qrData.debtor.name + "\n" + qrData.debtor.address + "\n" + qrData.debtor.zip + " " + qrData.debtor.city, mm2pt(130), mm2pt(60), {
      width: mm2pt(70),
      height: mm2pt(50),
      align: "left"
    });

    pdf.moveDown();
    pdf.fontSize(11);
    pdf.font("Helvetica");
    pdf.text("Oberlunkhofen " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(), {
      width: mm2pt(170),
      align: "right"
    });

    pdf.moveDown();
    pdf.fontSize(14);
    pdf.font("Helvetica-Bold");
    pdf.text(qrData.additionalInformation, mm2pt(20), mm2pt(100), {
      width: mm2pt(140),
      align: "left"
    });

    pdf.moveDown();
    pdf.fontSize(12);
    pdf.fillColor("black");
    pdf.font("Helvetica");

    let text = (adresse.geschlecht == 1 ? "Lieber " : "Liebe ") + adresse.vorname + "\n";
    pdf.text(text, {
      width: mm2pt(170),
      align: "left"
    });
    text += systemVal.Parameter.get("RECHNUNG") + '\n';
    pdf.text(`${systemVal.Parameter.get("RECHNUNG")}\n`, {
      width: mm2pt(170),
      align: "justify"
    });
    pdf.moveDown();
    text += `Mit liebem Clubgruss\nJanine Franken`;
    pdf.text(`Mit liebem Clubgruss\nJanine Franken`, {
      width: mm2pt(170),
      align: "left"
    });

    pdf.moveDown();
    pdf.fontSize(10);
    pdf.text(`Bitte beachte, dass für Einzahlungen am Postschalter eine Gebühr von CHF 2.50 erhoben wird. Zahlungen via Twint, Banküberweisung oder E-Finance sind kostenlos.\n`, {
      width: mm2pt(170),
      align: "justify",
      oblique: true
    });

    // Fit the image within the dimensions
    img = readFileSync(systemVal.assets + '/RNW-TWINT-SWISS-QR-DE.png');
    pdf.image(img.buffer, mm2pt(0), mm2pt(182), { fit: [mm2pt(210), mm2pt(10)] });

    const qrBill = new SwissQRBill(qrData);
    qrBill.attachTo(pdf);
    pdf.save();
    pdf.end();

    let email_body = "<p>" + text.split("\n").join("</p><p>") + "</p>";

    let email: EmailBody = {
      email_an: adresse.email, email_cc: '', email_bcc: '',
      email_body: email_body,
      email_subject: "Auto-Moto-Club Swissair - Mitgliederrechnung",
      email_uploadfiles: filename,
      email_signature: "JanineFranken"
    }

    const retVal = await this.sendEmail(email);
    if (retVal.type != '250 Message received') {
      retData.type = 'error';
      retData.message = retVal.type;
      return retData
    }

    // journal Eintrag erstellen
    const journal: Journal = Journal.build();
    journal.memo = "Mitgliederbeitrag " + jahr + " von " + qrData.debtor.name;
    journal.date = new Date();
    journal.amount = 30;
    journal.from_account = 31;
    journal.to_account = 21;

    await journal.save();

    // dokument verschieben
    const pathname = systemVal.documents + jahr + '/';
    const receiptName = 'receipt/' + 'Journal-' + journal.id + '.pdf';
    if (!existsSync(pathname)) {
      mkdirSync(pathname);
      mkdirSync(pathname + '/receipt');
    }
    if (existsSync(systemVal.uploads + filename)) {
      copyFileSync(systemVal.uploads + filename, pathname + receiptName);
    } else {
      retData.type = 'error';
      retData.message = "QR-Rechnung erstellt und versendet. Konnte File nicht kopieren und an den Journaleintrag hängen";
      return retData;
    }

    // anhang erstellen
    const receipt = Receipt.build();
    receipt.receipt = receiptName;
    receipt.bezeichnung = filename;
    await receipt.save();

    // anhang mit journaleintrag verbinden
    const journal2receipt = JournalReceipt.build();
    journal2receipt.journalid = journal.id;
    journal2receipt.receiptid = receipt.id;
    await journal2receipt.save();

    retData.message = 'QR-Rechnung erstellt und versendet';
    return retData;
  }
}
