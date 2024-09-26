import { Service } from "typedi";
import { GlobalHttpException } from "@/exceptions/globalHttpException";
import { Fiscalyear } from "@/models/fiscalyear";
import { Sequelize, Op, QueryTypes } from "sequelize";
import { db } from "@/database/database";
import { Journal } from "@/models/journal";
import { systemVal } from "@/utils/system";
import { mkdirSync } from "node:fs";
import { Workbook, Worksheet } from "exceljs";
import { Account } from "@/models/account";
import { Budget } from "@/models/budget";
import {
  iFontSizeHeader,
  iFontSizeRow,
  iFontSizeTitel,
  setCellValueFormat,
} from "./general.service";

export class Bilanz extends Account {
  amount: number = 0;
  amountVJ: number = 0;
  amountNJ: number = 0;
  budget: number = 0;
  budgetVJ: number = 0;
  budgetNJ: number = 0;
}

@Service()
export class FiscalyearService {
  public async findAllFiscalyear(): Promise<Fiscalyear[]> {
    const allFiscalyear: Fiscalyear[] = await Fiscalyear.findAll({
      order: [["year", "desc"]],
    });
    return allFiscalyear;
  }

  public async findFiscalyearById(fiscalyearId: string): Promise<Fiscalyear> {
    const findFiscalyear: Fiscalyear | null = await Fiscalyear.findByPk(
      fiscalyearId
    );
    if (!findFiscalyear)
      throw new GlobalHttpException(409, "Fiscalyear doesn't exist");

    return findFiscalyear;
  }

  public async findFiscalyearByYear(year: string): Promise<Fiscalyear> {
    const findFiscalyear: Fiscalyear | null = await Fiscalyear.findOne({
      where: { year: year },
    });
    if (!findFiscalyear)
      throw new GlobalHttpException(409, "Fiscalyear doesn't exist");

    return findFiscalyear;
  }

  public async createFiscalyear(
    fiscalyearData: Fiscalyear
  ): Promise<Fiscalyear> {
    const findFiscalyear: Fiscalyear | null = await Fiscalyear.findOne({
      where: { id: fiscalyearData.id },
    });
    if (findFiscalyear)
      throw new GlobalHttpException(
        409,
        `This key ${fiscalyearData.id} already exists`
      );

    const createFiscalyearData: Fiscalyear = await Fiscalyear.create(
      fiscalyearData
    );
    return createFiscalyearData;
  }

  public async updateFiscalyear(
    fiscalyearId: string,
    fiscalyearData: Fiscalyear
  ): Promise<Fiscalyear> {
    const findFiscalyear: Fiscalyear | null = await Fiscalyear.findByPk(
      fiscalyearId
    );
    if (!findFiscalyear)
      throw new GlobalHttpException(409, "Fiscalyear doesn't exist");

    await Fiscalyear.update(fiscalyearData, { where: { id: fiscalyearId } });

    const updateFiscalyear: Fiscalyear | null = await Fiscalyear.findByPk(
      fiscalyearId
    );
    return updateFiscalyear!;
  }

  public async deleteFiscalyear(fiscalyearId: string): Promise<Fiscalyear> {
    const findFiscalyear: Fiscalyear | null = await Fiscalyear.findByPk(
      fiscalyearId
    );
    if (!findFiscalyear)
      throw new GlobalHttpException(409, "Fiscalyear doesn't exist");

    await Fiscalyear.destroy({ where: { id: fiscalyearId } });

    return findFiscalyear;
  }

  public async getFKData(filter?: string): Promise<Fiscalyear[]> {
    const findFiscalyear: Fiscalyear[] | null = await Fiscalyear.findAll({
      attributes: [
        ["year", "id"],
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col("name"),
            " - ",
            Sequelize.literal(
              "(CASE \"state\" WHEN 1 THEN 'offen' WHEN 2 THEN 'prov. abgeschlossen' ELSE 'abgeschlossen' END)"
            )
          ),
          "value",
        ],
        [
          Sequelize.literal(
            "(CASE \"state\" WHEN 1 THEN 'offen' WHEN 2 THEN 'prov-closed' ELSE 'closed' END)"
          ),
          "$css",
        ],
      ],
      where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), {
        [Op.substring]: filter ?? "",
      }),
      order: [["year", "desc"]],
    });
    return findFiscalyear;
  }

  public async closeYear(year: string, state: number): Promise<unknown> {
    const sNextYear = parseInt(year) + 1;

    /**
     * Ein Geschäftsjahr wird geschlossen (provisorisch oder definitiv)
     * 1. Neues Fiscalyear eröffnen - sofern nicht schon eröffnet
     * 2. Gewinn / Verlust berechnen
     * 3. Eröffnungsbuchungen erfassen
     * 4. im Journal die Nummerierung vornehmen
     * 5. Status vom alten Fiscalyear setzen
     */

    const oldFiscalyear = await Fiscalyear.findOne({
      where: { year: year },
    });
    if (!oldFiscalyear) {
      return {
        type: "error",
        message: "Konnte Geschäftsjahr " + year + " nicht finden.",
        gewinn: 0,
      };
    }

    // Journal - Bilanz Summen lesen
    // Aktive
    let qrySelect = "SELECT j.from_account as account, SUM(j.amount) AS amount";
    qrySelect += " FROM journal j WHERE YEAR(j.date) = " + year;
    qrySelect +=
      " and j.from_account in (select id from account where level = 1)";
    qrySelect += " GROUP BY j.from_account";

    let arAktiv: { account: number; amount: number }[] =
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.SELECT,
        plain: false,
        raw: false,
      });

    qrySelect = "SELECT j.to_account as account, SUM(j.amount) AS amount";
    qrySelect += " FROM journal j WHERE YEAR(j.date) = " + year;
    qrySelect +=
      " and j.to_account in (select id from account where level = 1)";
    qrySelect += " GROUP BY j.to_account";

    let arAktiv2: { account: number; amount: number }[] =
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.SELECT,
        plain: false,
        raw: false,
      });

    for (const element of arAktiv2) {
      let found = arAktiv.findIndex((acc) => acc.account == element.account);
      if (found > -1) arAktiv[found].amount -= element.amount;
      else arAktiv.push(element);
    }

    // Passive
    qrySelect = "SELECT j.from_account as account, SUM(j.amount) AS amount";
    qrySelect += " FROM journal j WHERE YEAR(j.date) = " + year;
    qrySelect +=
      " and j.from_account in (select id from account where level = 2)";
    qrySelect += " GROUP BY j.from_account";
    let arPassiv: { account: number; amount: number }[] =
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.SELECT,
        plain: false,
        raw: false,
      });
    qrySelect = "SELECT j.to_account as account, SUM(j.amount) AS amount";
    qrySelect += " FROM journal j WHERE YEAR(j.date) = " + year;
    qrySelect +=
      " and j.to_account in (select id from account where level = 2)";
    qrySelect += " GROUP BY j.to_account";
    let arPassiv2: { account: number; amount: number }[] =
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.SELECT,
        plain: false,
        raw: false,
      });
    for (const element of arPassiv2) {
      let found = arPassiv.findIndex((acc) => acc.account == element.account);
      if (found > -1)
        arPassiv[found].amount = element.amount - arPassiv[found].amount;
      else arPassiv.push(element);
    }

    // Gewinn berechnen und Eröffnungsjournal erstellen
    let arEroeffnung: Journal[] = [];
    let iGewinn = 0.0;
    let journalno = 1;

    for (const element of arAktiv) {
      if (element.account != 39) {
        const journal: Journal = new Journal();
        journal.journalno = journalno++;
        journal.date = new Date(sNextYear + "-01-01");
        journal.from_account = element.account;
        journal.to_account = 39;
        journal.amount = element.amount;
        journal.memo = "Kontoeröffnung (Saldovortrag)";

        arEroeffnung.push(journal);
      }
      iGewinn += Number(element.amount);
    }

    for (const element of arPassiv) {
      if (element.account != 39) {
        const journal: Journal = new Journal();
        journal.journalno = journalno++;
        journal.date = new Date(sNextYear + "-01-01");
        journal.to_account = element.account;
        journal.from_account = 39;
        journal.amount = element.amount;
        journal.memo = "Kontoeröffnung (Saldovortrag)";

        arEroeffnung.push(journal);
      }
      iGewinn -= Number(element.amount);
    }

    // Fiscalyear erfassen
    let newFiscalyear = await Fiscalyear.findOne({
      where: { year: sNextYear },
    });
    if (!newFiscalyear) {
      newFiscalyear = new Fiscalyear();
      newFiscalyear.year = sNextYear;
      newFiscalyear.name = "AMC-Buchhaltung " + sNextYear;
      newFiscalyear.state = 1;
      await newFiscalyear.save();

      // Dateipfad für Belege erstellen
      const pathname = systemVal.documents;
      try {
        mkdirSync(pathname + sNextYear);
        mkdirSync(pathname + sNextYear + "/receipt");
      } catch (error) {
        console.log(error);
      }

      // Budgetzahlen übertragen vom Vorjahr
      qrySelect =
        "INSERT INTO budget (account, year, amount) " +
        "SELECT account.id, " +
        sNextYear +
        ", 0 FROM account WHERE account.status = 1 AND account.level in (4,6) and account.order > 3999";
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.INSERT,
        plain: false,
        raw: false,
      });

      qrySelect =
        "UPDATE budget ba " +
        "SET amount = bb.amount " +
        "FROM budget bb " +
        "WHERE bb.year = " +
        year +
        " AND bb.account = ba.account " +
        "AND ba.year = " +
        sNextYear;
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.INSERT,
        plain: false,
        raw: false,
      });
    } else {
      // lösche alle Eröffnungsbuchungen
      qrySelect = "DELETE FROM journal where year(date) = " + sNextYear;
      qrySelect += " and (from_account = 39 or to_account = 39)";
      await db.sequelize.query(qrySelect, {
        type: QueryTypes.DELETE,
        plain: false,
        raw: false,
      });
    }
    // Eröffnungsbuchungen erstellen
    for (const journal of arEroeffnung) {
      await journal.save();
    }

    oldFiscalyear.state = state;
    await oldFiscalyear.save();

    return {
      type: "info",
      message:
        "AMC-Buchhaltung " +
        year +
        " wurde erfolgreich beendet mit Gewinn/Verlust " +
        iGewinn,
      gewinn: iGewinn,
    };
  }

  public async writeBilanz(year: string) {
    const iVJahr = Number(year) - 1;
    const iNJahr = Number(year) + 1;

    const workbook = new Workbook();
    workbook.creator = "Janine Franken";
    workbook.calcProperties.fullCalcOnLoad = true;

    const bsheet = workbook.addWorksheet("Bilanz", {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: "&18Auto-Moto-Club Swissair",
        oddFooter: "&14Bilanz " + year,
      },
    });

    const esheet = workbook.addWorksheet("Erfolgsrechnung", {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: "&18Auto-Moto-Club Swissair",
        oddFooter: "&14Erfolgsrechnung " + year,
      },
    });

    const busheet = workbook.addWorksheet("Budget", {
      pageSetup: {
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1,
      },
      properties: {
        defaultRowHeight: 22,
      },
      headerFooter: {
        oddHeader: "&18Auto-Moto-Club Swissair",
        oddFooter: "&14Budget " + iNJahr,
      },
    });

    const accData = await Account.findAll({
      attributes: ["id", "name", "level", "order", "status"],
      order: ["level", "order"],
      raw: true,
      nest: true,
    });

    const arBudget = await Budget.findAll({
      where: { year: { [Op.in]: [year, iVJahr, iNJahr] } },
      order: ["year", "account"],
      raw: true,
    });

    const arBilanz: Bilanz[] = [];
    for (const element of accData) {
      const bilanz: Bilanz = new Bilanz();
      Object.assign(bilanz, element);
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
    let arrJournalFA = await Journal.findAll({
      attributes: [
        "from_account",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "amount"],
      ],
      where: Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
      group: ["from_account"],
    });
    let arrJournalTA = await Journal.findAll({
      attributes: [
        "to_account",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "amount"],
      ],
      where: Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("date")), year),
      group: ["to_account"],
    });
    let arrJournalFV = await Journal.findAll({
      attributes: [
        "from_account",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "amount"],
      ],
      where: Sequelize.where(
        Sequelize.fn("YEAR", Sequelize.col("date")),
        iVJahr
      ),
      group: ["from_account"],
    });
    let arrJournalTV = await Journal.findAll({
      attributes: [
        "to_account",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "amount"],
      ],
      where: Sequelize.where(
        Sequelize.fn("YEAR", Sequelize.col("date")),
        iVJahr
      ),
      group: ["to_account"],
    });

    for (const bilanz of arBilanz) {
      let found = arrJournalFA.find((rec) => rec.from_account == bilanz.id);
      if (found) bilanz.amount += Number(found.amount);
      found = arrJournalFV.find((rec) => rec.from_account == bilanz.id);
      if (found) bilanz.amountVJ += Number(found.amount);

      if ([1, 4].includes(bilanz.level!)) {
        found = arrJournalTA.find((rec) => rec.to_account == bilanz.id);
        if (found) bilanz.amount -= Number(found.amount);

        found = arrJournalTV.find((rec) => rec.to_account == bilanz.id);
        if (found) bilanz.amountVJ -= Number(found.amount);
      } else if ([2, 3].includes(bilanz.level!)) {
        found = arrJournalTA.find((rec) => rec.to_account == bilanz.id);
        if (found) bilanz.amount = Number(found.amount) - bilanz.amount;

        found = arrJournalTV.find((rec) => rec.to_account == bilanz.id);
        if (found) bilanz.amountVJ = Number(found.amount) - bilanz.amountVJ;
      }
    }

    // Schreibe Bilanzdaten
    setCellValueFormat(bsheet, "B1", "Bilanz " + year, false, undefined, {
      bold: true,
      size: iFontSizeHeader,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "B3", "Konto", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "C3", "Bezeichnung", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "D3", "Saldo " + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    bsheet.getCell("D3").alignment = { horizontal: "right" };
    setCellValueFormat(bsheet, "E3", "Saldo " + iVJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    bsheet.getCell("E3").alignment = { horizontal: "right" };
    setCellValueFormat(bsheet, "F3", "Differenz", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    bsheet.getCell("F3").alignment = { horizontal: "right" };

    let accBData = arBilanz.filter(function (value, index, array) {
      return (
        (value.status == 1 || value.amount != 0 || value.amountVJ != 0) &&
        value.level! < 3
      );
    });

    let Total = this.writeArray(bsheet, accBData, 4, false);
    let row = Total.lastRow + 2;
    let formula1 = { formula: "D" + Total.total1 + "-D" + Total.total2 };
    let formula2 = { formula: "E" + Total.total1 + "-E" + Total.total2 };
    let formula3 = { formula: "D" + row + "-E" + row };
    setCellValueFormat(
      bsheet,
      "B" + row,
      "Gewinn / Verlust",
      true,
      "B" + row + ":C" + row,
      { bold: true, size: iFontSizeHeader, name: "Tahoma" }
    );
    setCellValueFormat(bsheet, "D" + row, formula1, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "E" + row, formula2, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "F" + row, formula3, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    bsheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    bsheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    bsheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";

    row += 2;
    formula1 = { formula: "D" + Total.lastRow + "+D" + (Total.lastRow + 2) };
    formula2 = { formula: "E" + Total.lastRow + "+E" + (Total.lastRow + 2) };
    formula3 = { formula: "D" + row + "-E" + row };
    setCellValueFormat(
      bsheet,
      "B" + row,
      "Vermögen Ende Jahr",
      true,
      "B" + row + ":C" + row,
      { bold: true, size: iFontSizeHeader, name: "Tahoma" }
    );
    setCellValueFormat(bsheet, "D" + row, formula1, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "E" + row, formula2, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(bsheet, "F" + row, formula3, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    bsheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    bsheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    bsheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";

    bsheet.getColumn("C").width = 32;
    bsheet.getColumn("D").width = 18;
    bsheet.getColumn("E").width = 18;
    bsheet.getColumn("F").width = 18;

    // Schreibe Erfolgsrechnung
    setCellValueFormat(
      esheet,
      "B1",
      "Erfolgsrechnung " + year,
      false,
      undefined,
      { bold: true, size: iFontSizeHeader, name: "Tahoma" }
    );
    setCellValueFormat(esheet, "B3", "Konto", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "C3", "Bezeichnung", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "D3", "Saldo " + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("D3").alignment = { horizontal: "right" };
    setCellValueFormat(esheet, "E3", "Saldo " + iVJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("E3").alignment = { horizontal: "right" };
    setCellValueFormat(esheet, "F3", "Differenz", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("F3").alignment = { horizontal: "right" };
    setCellValueFormat(esheet, "G3", "Budget " + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("G3").alignment = { horizontal: "right" };
    setCellValueFormat(esheet, "H3", "Differenz", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("H3").alignment = { horizontal: "right" };

    let accEData = arBilanz.filter(function (value, index, array) {
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
    formula1 = { formula: "D" + Total.total2 + "-D" + Total.total1 };
    formula2 = { formula: "E" + Total.total2 + "-E" + Total.total1 };
    formula3 = { formula: "D" + row + "-E" + row };
    let formula4 = { formula: "G" + Total.total2 + "-G" + Total.total1 };
    let formula5 = { formula: "G" + row + "-D" + row };
    setCellValueFormat(
      esheet,
      "B" + row,
      "Gewinn / Verlust",
      true,
      "B" + row + ":C" + row,
      { bold: true, size: iFontSizeHeader, name: "Tahoma" }
    );
    setCellValueFormat(esheet, "D" + row, formula1, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "E" + row, formula2, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "F" + row, formula3, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "G" + row, formula4, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(esheet, "H" + row, formula5, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    esheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    esheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    esheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    esheet.getCell("G" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    esheet.getCell("H" + row).numFmt = "#,##0.00;[Red]-#,##0.00";

    esheet.getColumn("C").width = 32;
    esheet.getColumn("D").width = 18;
    esheet.getColumn("E").width = 18;
    esheet.getColumn("F").width = 18;
    esheet.getColumn("G").width = 18;
    esheet.getColumn("H").width = 18;

    // Schreibe Budgetvergleich
    setCellValueFormat(busheet, "B1", "Budget " + iNJahr, false, undefined, {
      bold: true,
      size: iFontSizeHeader,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "B3", "Konto", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "C3", "Bezeichnung", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "D3", "Saldo " + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("D3").alignment = { horizontal: "right" };
    setCellValueFormat(busheet, "E3", "Budget " + year, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("E3").alignment = { horizontal: "right" };
    setCellValueFormat(busheet, "F3", "Differenz", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("F3").alignment = { horizontal: "right" };
    setCellValueFormat(busheet, "G3", "Budget " + iNJahr, true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("G3").alignment = { horizontal: "right" };
    setCellValueFormat(busheet, "H3", "Differenz", true, undefined, {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("H3").alignment = { horizontal: "right" };

    Total = this.writeArray(busheet, accEData, 4, true, true);

    row = Total.lastRow + 2;
    formula1 = { formula: "D" + Total.total2 + "-D" + Total.total1 };
    formula2 = { formula: "E" + Total.total2 + "-E" + Total.total1 };
    formula3 = { formula: "E" + row + "-D" + row };
    formula4 = { formula: "G" + Total.total2 + "-G" + Total.total1 };
    formula5 = { formula: "G" + row + "-E" + row };
    setCellValueFormat(
      busheet,
      "B" + row,
      "Gewinn / Verlust",
      true,
      "B" + row + ":C" + row,
      { bold: true, size: iFontSizeHeader, name: "Tahoma" }
    );
    setCellValueFormat(busheet, "D" + row, formula1, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "E" + row, formula2, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "F" + row, formula3, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "G" + row, formula4, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    setCellValueFormat(busheet, "H" + row, formula5, true, "", {
      bold: true,
      size: iFontSizeTitel,
      name: "Tahoma",
    });
    busheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    busheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    busheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    busheet.getCell("G" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
    busheet.getCell("H" + row).numFmt = "#,##0.00;[Red]-#,##0.00";

    busheet.getColumn("C").width = 32;
    busheet.getColumn("D").width = 18;
    busheet.getColumn("E").width = 18;
    busheet.getColumn("F").width = 18;
    busheet.getColumn("G").width = 18;
    busheet.getColumn("H").width = 18;

    const filename = "Bilanz-" + year + ".xlsx";
    await workbook.xlsx.writeFile(systemVal.exports + filename).catch((e) => {
      console.error(e);
      return e;
    });

    return {
      type: "info",
      message: "Excelfile erstellt",
      filename: filename,
    };
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
    fBudgetVergleich = false
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
          "B" + row,
          element.name,
          true,
          "B" + row + ":C" + row,
          { name: "Tahoma", bold: true, size: iFontSizeTitel }
        );

        setCellValueFormat(sheet, "D" + row, "", true, "", {
          name: "Tahoma",
          bold: true,
          size: iFontSizeTitel,
        });
        setCellValueFormat(sheet, "E" + row, "", true, "", {
          name: "Tahoma",
          bold: true,
          size: iFontSizeTitel,
        });
        setCellValueFormat(sheet, "F" + row, "", true, "", {
          name: "Tahoma",
          bold: true,
          size: iFontSizeTitel,
        });

        sheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        sheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        sheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        if (fBudget) {
          setCellValueFormat(sheet, "G" + row, "", true, "", {
            name: "Tahoma",
            bold: true,
            size: iFontSizeTitel,
          });
          setCellValueFormat(sheet, "H" + row, "", true, "", {
            name: "Tahoma",
            bold: true,
            size: iFontSizeTitel,
          });

          sheet.getCell("G" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
          sheet.getCell("H" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        }
      } else {
        let font = { name: "Tahoma", size: iFontSizeRow };
        setCellValueFormat(sheet, "B" + row, element.order, true, "", font);
        setCellValueFormat(sheet, "C" + row, element.name, true, "", font);
        setCellValueFormat(sheet, "D" + row, element.amount, true, "", font);
        setCellValueFormat(sheet, "E" + row, element.amountVJ, true, "", font);

        switch (element.level) {
          case 2:
          case 4:
            setCellValueFormat(
              sheet,
              "F" + row,
              { formula: "E" + row + "-D" + row },
              true,
              "",
              font
            );
            break;

          case 1:
          case 6:
            setCellValueFormat(
              sheet,
              "F" + row,
              { formula: "D" + row + "-E" + row },
              true,
              "",
              font
            );
            break;

          default:
            break;
        }

        sheet.getCell("D" + cellLevel).value = {
          formula: "=SUM(D" + (cellLevel + 1) + ":" + "D" + row + ")",
        };
        sheet.getCell("E" + cellLevel).value = {
          formula: "=SUM(E" + (cellLevel + 1) + ":" + "E" + row + ")",
        };
        sheet.getCell("F" + cellLevel).value = {
          formula: "=SUM(F" + (cellLevel + 1) + ":" + "F" + row + ")",
        };

        sheet.getCell("D" + row).alignment = {
          horizontal: "right",
        };
        sheet.getCell("E" + row).alignment = {
          horizontal: "right",
        };
        sheet.getCell("F" + row).alignment = {
          horizontal: "right",
        };

        sheet.getCell("D" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        sheet.getCell("E" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        sheet.getCell("F" + row).numFmt = "#,##0.00;[Red]-#,##0.00";

        if (fBudget) {
          setCellValueFormat(sheet, "G" + row, element.budget, true, "", font);

          switch (element.level) {
            case 2:
            case 4:
              setCellValueFormat(
                sheet,
                "H" + row,
                { formula: "G" + row + "-D" + row },
                true,
                "",
                font
              );
              break;

            case 1:
            case 6:
              setCellValueFormat(
                sheet,
                "H" + row,
                { formula: "D" + row + "-G" + row },
                true,
                "",
                font
              );
              break;

            default:
              break;
          }

          sheet.getCell("G" + cellLevel).value = {
            formula: "=SUM(G" + (cellLevel + 1) + ":" + "G" + row + ")",
          };
          sheet.getCell("H" + cellLevel).value = {
            formula: "=SUM(H" + (cellLevel + 1) + ":" + "H" + row + ")",
          };

          sheet.getCell("G" + row).alignment = {
            horizontal: "right",
          };
          sheet.getCell("H" + row).alignment = {
            horizontal: "right",
          };

          sheet.getCell("G" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
          sheet.getCell("H" + row).numFmt = "#,##0.00;[Red]-#,##0.00";
        }

        if (fBudgetVergleich) {
          setCellValueFormat(sheet, "E" + row, element.budget, true, "", font);
          setCellValueFormat(
            sheet,
            "F" + row,
            { formula: "E" + row + "-D" + row },
            true,
            "",
            font
          );
          setCellValueFormat(
            sheet,
            "G" + row,
            element.budgetNJ,
            true,
            "",
            font
          );
          setCellValueFormat(
            sheet,
            "H" + row,
            { formula: "G" + row + "-E" + row },
            true,
            "",
            font
          );
        }
      }

      row++;
    }

    return { lastRow: row - 1, total1: firstRow + 1, total2: cellLevel };
  }
}
