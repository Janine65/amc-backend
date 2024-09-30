import { Service } from "typedi";
import { GlobalHttpException } from "@/exceptions/globalHttpException";
import { Journal } from "@/models/journal";
import { systemVal } from "@/utils/system";
import {
  Account,
  JournalReceipt,
  Receipt,
} from "@/models/init-models";
import { Sequelize } from "sequelize";
import { locale } from "numeral";
import { Workbook } from "exceljs";
import {
  iFontSizeHeader,
  iFontSizeRow,
  iFontSizeTitel,
  setCellValueFormat,
} from "./general.service";
import PDFDocumentWithTables from "pdfkit-table";
import { createWriteStream, existsSync } from "node:fs";
import archiver from "archiver";
import { RetDataFile } from "@/models/generel";

@Service()
export class JournalService {
  public async findAllJournal(): Promise<Journal[]> {
    const allJournal: Journal[] = await Journal.findAll({
      where: { year: systemVal.Parameter.get("CLUBJAHR") },
      order: ["journalno", "date", "from_account"],
    });
    return allJournal;
  }

  public async findJournalById(journalId: string): Promise<Journal> {
    const findJournal: Journal | null = await Journal.findByPk(journalId, {
      attributes: ["id", "date", "memo", "journalno", "amount", "status"],
      include: [
        {
          model: Account,
          as: "fromAccountAccount",
          required: true,
          attributes: ["id", "order", "name", "longname"],
        },
        {
          model: Account,
          as: "toAccountAccount",
          required: true,
          attributes: ["id", "order", "name", "longname"],
        },
        { model: JournalReceipt, as: "journalReceipts", required: false },
      ],
      order: [
        ["journalno", "asc"],
        ["date", "asc"],
        ["from_account", "asc"],
      ],
    });

    if (!findJournal)
      throw new GlobalHttpException(409, "Journal doesn't exist");

    return findJournal;
  }

  public async findJournalByYear(year: string): Promise<Journal[]> {
    const findJournal: Journal[] | null = await Journal.findAll({
      attributes: ["id", "date", "memo", "journalno", "amount", "status"],
      where: Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
      include: [
        {
          model: Account,
          as: "fromAccountAccount",
          required: true,
          attributes: ["id", "order", "name", "longname"],
        },
        {
          model: Account,
          as: "toAccountAccount",
          required: true,
          attributes: ["id", "order", "name", "longname"],
        },
        { model: JournalReceipt, as: "journalReceipts", required: false },
      ],
      order: [
        ["journalno", "asc"],
        ["date", "asc"],
        ["from_account", "asc"],
      ],
    });
    if (!findJournal)
      throw new GlobalHttpException(409, "Journal doesn't exist");

    return findJournal;
  }

  public async createJournal(journalData: Journal): Promise<Journal> {
    const year = new Date(journalData.date!).getFullYear();
    const createJournalData = await Journal.build(journalData);
    const lastNo = await Journal.max("journalno", {
      where: Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
    });
    
    if (lastNo) {
      let nextNo = lastNo as number;
      nextNo++;
      createJournalData.journalno = nextNo
    } else createJournalData.journalno = 1;
    createJournalData.id = undefined;

    await createJournalData.save();
    return createJournalData;
  }

  public async updateJournal(
    journalId: string,
    journalData: Journal
  ): Promise<Journal> {
    const findJournal: Journal | null = await Journal.findByPk(journalId);
    if (!findJournal)
      throw new GlobalHttpException(409, "Journal doesn't exist");

    await Journal.update(journalData, { where: { id: journalId } });

    const updateJournal: Journal | null = await Journal.findByPk(journalId);
    return updateJournal!;
  }

  public async deleteJournal(journalId: string): Promise<Journal> {
    const findJournal: Journal | null = await Journal.findByPk(journalId);
    if (!findJournal)
      throw new GlobalHttpException(409, "Journal doesn't exist");

    await Journal.destroy({ where: { id: journalId } });

    return findJournal;
  }

  public async getAccData(year: string, account: number): Promise<unknown[]> {
    const modelReturn = await Promise.all([
      await Journal.findAll({
        attributes: ["id", "journalno", "date", "memo", "amount"],
        where: [
          { from_account: account },
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
        include: [
          { model: Account, as: "fromAccountAccount", required: true },
          { model: Account, as: "toAccountAccount", required: true },
        ],
      }),
      await Journal.findAll({
        attributes: ["id", "journalno", "date", "memo", "amount"],
        where: [
          { to_account: account },
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
        ],
        include: [
          { model: Account, as: "fromAccountAccount", required: true },
          { model: Account, as: "toAccountAccount", required: true },
        ],
      }),
    ]);
    const arPreData = modelReturn.flat();
    const arData = [];
    for (let index = 0; index < arPreData.length; index++) {
      const element = arPreData[index];
      const record = {
        id: element.id,
        journalno: element.journalno,
        date: element.date,
        memo: element.memo,
        fromAcc: element.fromAccountAccount.longname,
        toAcc: element.toAccountAccount.longname,
        haben: 0,
        soll: 0,
      };

      if (element.toAccountAccount.id == account) {
        record.haben = Number(element.amount);
        record.soll = 0;
      } else {
        record.soll = Number(element.amount);
        record.haben = 0;
      }
      arData.push(record);
    }
    console.log(arData);
    return arData;
  }

  public async writeJournal(year: string, fReceipt: boolean): Promise<RetDataFile> {
    locale("ch");

    const arJournal: Journal[] = await Journal.findAll({
      where: Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
      include: [
        {
          model: Account,
          as: "fromAccountAccount",
          required: true,
          attributes: ["id", "order", "name"],
        },
        {
          model: Account,
          as: "toAccountAccount",
          required: true,
          attributes: ["id", "order", "name"],
        },
      ],
      order: [
        ["journalno", "asc"],
        ["date", "asc"],
        ["from_account", "asc"],
      ],
    }).catch((e) => {
      console.error(e);
      return e;
    });

    const workbook = new Workbook();
    workbook.creator = "Janine Franken";

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const sheet = workbook.addWorksheet("Journal", {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
        orientation: "landscape",
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: "&18Auto-Moto-Club Swissair",
        oddFooter: "&14Journal " + year,
      },
    });

    // Schreibe Journal
    setCellValueFormat(sheet, "B1", "Journal " + year, false, "", {
      bold: true,
      size: iFontSizeHeader,
      name: "Tahoma",
    });

    const tHeaders = [
      {
        property: "journalno",
        label: "No.",
        valign: "top",
        width: 50,
        align: "right",
        renderer: (
          value: string|number
        ) => {
          return typeof value == "number" ? Number(value).toFixed(0) : value;
        },
      },
      { property: "date", label: "Date", valign: "top", width: 80 },
      { property: "from", label: "From", valign: "top", width: 50 },
      { property: "to", label: "To", valign: "top", width: 50 },
      { property: "text", label: "Booking Text", valign: "top", width: 150 },
      {
        property: "amount",
        label: "Amount",
        valign: "top",
        align: "right",
        width: 100,
        renderer: (
          value: string|number
        ) => {
          return typeof value == "number" ? Number(value).toFixed(2) : value;
        },
      },
      { property: "receipt", label: "Receipt", valign: "top", width: 250 },
    ];
    setCellValueFormat(sheet, "B3", "No", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("B3").alignment = { vertical: "top" };
    setCellValueFormat(sheet, "C3", "Date", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("C3").alignment = { vertical: "top" };
    setCellValueFormat(sheet, "D3", "From ", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("D3").alignment = { vertical: "top" };
    setCellValueFormat(sheet, "E3", "To ", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("E3").alignment = { vertical: "top" };
    setCellValueFormat(sheet, "F3", "Booking Text ", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("F3").alignment = { vertical: "top" };
    setCellValueFormat(sheet, "G3", "Amount", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("G3").alignment = { horizontal: "right", vertical: "top" };
    setCellValueFormat(sheet, "H3", "Receipt", true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    sheet.getCell("H3").alignment = { vertical: "top" };

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    let row = 4;

    const tRows = [];
    for (const element of arJournal) {
      const date = new Date(element.date!);
      const dateFmt = date.toLocaleDateString("de-CH", options);
      const num = Number(element.amount ?? 0);

      const rowRecord = {
        journalno: (element.journalno ?? 0).toFixed(0),
        date: dateFmt,
        from: element.fromAccountAccount.order!.toFixed(0),
        to: element.toAccountAccount.order!.toFixed(0),
        text: element.memo ?? "",
        amount: num.toFixed(2),
        receipt: "",
      };

      sheet.getRow(row).height = 22;
      setCellValueFormat(sheet, "B" + row, element.journalno ?? 0, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      sheet.getCell("B" + row).alignment = { vertical: "top" };
      setCellValueFormat(sheet, "C" + row, dateFmt, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      sheet.getCell("C" + row).alignment = { vertical: "top" };
      setCellValueFormat(
        sheet,
        "D" + row,
        element.fromAccountAccount.order +
          " " +
          element.fromAccountAccount.name,
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("D" + row).alignment = { vertical: "top" };
      setCellValueFormat(
        sheet,
        "E" + row,
        element.toAccountAccount.order + " " + element.toAccountAccount.name,
        true,
        "",
        { size: iFontSizeRow, name: "Tahoma" }
      );
      sheet.getCell("E" + row).alignment = { vertical: "top" };
      setCellValueFormat(sheet, "F" + row, element.memo, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      sheet.getCell("F" + row).alignment = { vertical: "top" };
      setCellValueFormat(sheet, "G" + row, element.amount ?? 0, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      sheet.getCell("G" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
      sheet.getCell("G" + row).alignment = { vertical: "top" };
      sheet.getCell("H" + row).alignment = { vertical: "top", wrapText: true };
      let linkAdress = "";
      const arReceipt = await Receipt.findAll({
        include: [
          {
            model: JournalReceipt,
            as: "journalReceipts",
            required: true,
            attributes: [],
            where: { journalid: element.id },
          },
        ],
        order: ["bezeichnung"],
      });
      for (let indR = 0; indR < arReceipt.length; indR++) {
        if (indR == 0)
          linkAdress =
            arReceipt[indR].bezeichnung + ": " + arReceipt[indR].receipt;
        else
          linkAdress +=
            "\r\n" +
            arReceipt[indR].bezeichnung +
            ": " +
            arReceipt[indR].receipt;
      }
      setCellValueFormat(sheet, "H" + row, linkAdress, true, "", {
        size: iFontSizeRow,
        name: "Tahoma",
      });
      rowRecord.receipt = linkAdress;
      tRows.push(rowRecord);
      row++;
    }

    sheet.getColumn("B").width = 8;
    sheet.getColumn("C").width = 18;
    sheet.getColumn("D").width = 35;
    sheet.getColumn("E").width = 35;
    sheet.getColumn("F").width = 50;
    sheet.getColumn("G").width = 18;
    sheet.getColumn("H").width = 75;

    const filename = "Journal-" + year;
    await workbook.xlsx
      .writeFile(systemVal.exports + filename + ".xlsx")
      .catch((e) => {
        console.error(e);
        return e;
      });

    let sExt = ".xlsx";
    if (fReceipt) {
      sExt = ".zip";

      const pdf = new PDFDocumentWithTables({
        autoFirstPage: false,
        bufferPages: true,
        layout: "landscape",
        size: "A4",
        info: {
          Title: "Journal " + year,
          Author: "AutoMoto-Club Swissair, Janine Franken",
        },
      });

      const table = {
        headers: tHeaders,
        datas: tRows,
      };

      // if no page already exists in your PDF, do not forget to add one
      pdf.addPage();
      // Embed a font, set the font size, and render some text
      pdf
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("Journal " + year)
        .moveDown(1);

      // draw content, by passing data to the addBody method
      pdf.table(table, {
        divider: {
          header: { disabled: false, width: 2, opacity: 1 },
          horizontal: { disabled: false, width: 0.5, opacity: 1 },
        },
        padding: [5], // {Number} default: 0
        columnSpacing: 5,
        prepareHeader: () => pdf.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => {
          return pdf.font("Helvetica").fontSize(10);
        },
      });

      // see the range of buffered pages
      const gedrucktAm =
        "Erstellt am: " + new Date().toLocaleDateString("de-DE", options);
      const range = pdf.bufferedPageRange(); // => { start: 0, count: 1 ... }
      for (let i = range.start, end = range.start + range.count; i < end; i++) {
        pdf.switchToPage(i);

        let x = pdf.page.margins.left + 5;
        const y =
          pdf.page.height -
          pdf.heightOfString(gedrucktAm) -
          pdf.page.margins.bottom;
        console.log(gedrucktAm + " " + x + "/" + y);
        pdf.text(gedrucktAm, x, y);

        const text = `Page ${i + 1} of ${range.count}`;
        x =
          pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
        console.log(text + " " + x + "/" + y);
        pdf.text(text, x, y);
      }

      // Pipe its output somewhere, like to a file or HTTP response
      // See below for browser usage
      pdf.pipe(createWriteStream(systemVal.exports + filename + ".pdf"));

      // Finalize PDF file
      pdf.end();

      // create a file to stream archive data to.
      const output = createWriteStream(systemVal.exports + filename + ".zip");
      const archive = archiver("zip");

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on("close", function () {
        console.log(archive.pointer() + " total bytes");
        console.log(
          "archiver has been finalized and the output file descriptor has closed."
        );
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on("end", function () {
        console.log("Data has been drained");
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on("warning", function (err3) {
        if (err3.code === "ENOENT") {
          // log warning
          console.log(err3);
        } else {
          // throw error
          throw err3;
        }
      });
      archive.on("error", function (err4) {
        throw err4;
      });

      archive.pipe(output);

      // append a file
      if (existsSync(systemVal.exports + filename + ".pdf")) {
        archive.file(systemVal.exports + filename + ".pdf", {
          name: filename + ".pdf",
        });
      } else {
        console.error("File not found");
      }

      // append files from a sub-directory and naming it `new-subdir` within the archive
      archive.directory(systemVal.documents + year + "/receipt/", "receipt");
      await archive.finalize();

      return {
        type: "info",
        message: "Datei erstellt",
        data: {filename: filename + sExt},
      };  
      
    } else {
      return {
        type: "info",
        message: "Datei erstellt",
        data: {filename: filename + sExt},
      };
    }
  }
}
