import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Anlass } from '@/models/anlass';
import { Sequelize, Op, QueryTypes } from 'sequelize';
import { systemVal } from '@/utils/system';
import { Workbook, Worksheet } from 'exceljs';
import { Adresse } from '@/models/adresse';
import { iFontSizeHeader, iFontSizeRow, iFontSizeTitel, setCellValueFormat } from './general.service';
import { db } from '@/database/database';
import { Meisterschaft } from '@/models/meisterschaft';
import { file } from 'pdfkit';
import { RetDataFile } from '@/models/generel';
import { AnlassAttributes } from '../../dist/src/models/anlass';

const cName = "C6";
const cVorname = "C7";
const sFirstRow = 13;

@Service()
export class AnlassService {
  public async findAllAnlass(fromYear: string, toYear: string): Promise<Anlass[]> {
    const allAnlass: Anlass[] = await Anlass.findAll({
      where: [Sequelize.where(Sequelize.fn("year", Sequelize.col("Anlass.datum")),Op.gte,fromYear), 
      Sequelize.where(Sequelize.fn("year", Sequelize.col("Anlass.datum")), Op.lte,toYear)],
      include: {
        model: Anlass, as: "anlaesse"
      },
      order: [["datum", "ASC"]]
    });
    return allAnlass;
  }

  public async findAnlassById(anlassId: string): Promise<Anlass> {
    const findAnlass: Anlass | null = await Anlass.findByPk(anlassId);
    if (!findAnlass) throw new GlobalHttpException(409, "Anlassn doesn't exist");

    return findAnlass;
  }

  public async createAnlass(anlassData: Anlass): Promise<Anlass> {
    const findAnlass: Anlass | null = await Anlass.findOne({ where: { name: anlassData.name, datum: anlassData.datum } });
    if (findAnlass) throw new GlobalHttpException(409, `This anlass ${anlassData.name} at ${anlassData.datum} already exists`);

    const datum = new Date(anlassData.datum);
    anlassData.longname = datum.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' - ' + anlassData.name;
    const createAnlassData: Anlass = await Anlass.create(anlassData);

    const createdAnlassData: Anlass | null = await Anlass.findByPk(createAnlassData.id, {
      include: {
        model: Anlass, as: "anlaesse"
      }      
    });
    return createdAnlassData;
  }

  public async updateAnlass(anlassId: string, anlassData: Anlass): Promise<Anlass> {
    const findAnlass: Anlass | null = await Anlass.findByPk(anlassId);
    if (!findAnlass) throw new GlobalHttpException(409, "Anlassn doesn't exist");

    const datum = new Date(anlassData.datum);
    anlassData.longname = datum.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' - ' + anlassData.name;
    await Anlass.update(anlassData, { where: { id: anlassId } });

    const updateAnlass: Anlass | null = await Anlass.findByPk(anlassId, {
      include: {
        model: Anlass, as: "anlaesse"
      }      
    });
    return updateAnlass!;
  }

  public async deleteAnlass(anlassId: string): Promise<Anlass> {
    const findAnlass: Anlass | null = await Anlass.findByPk(anlassId);
    if (!findAnlass) throw new GlobalHttpException(409, "Anlassn doesn't exist");

    await Anlass.destroy({ where: { id: anlassId } });

    return findAnlass;
  }

  public async getOverviewData(): Promise<unknown> {
    // get a json file with the following information to display on first page:
    // count of anlaesse im system_param jahr
    // count of SAM_Mitglieder
    // count of not SAM_Mitglieder

    let arResult = [{ label: 'Total Anlässe', value: 0 }, { label: 'Zukünftige Anlässe', value: 0 }]

    let total = await Anlass.count({
      where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), systemVal.Parameter.get("CLUBJAHR")),
      { "status": 1 },
      { "istsamanlass": false },
      { "nachkegeln": false }]
    })
    arResult[0].value = total;

    total = await Anlass.count({
      where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), systemVal.Parameter.get("CLUBJAHR")),
      { "datum": { [Op.gte]: Sequelize.fn("NOW") } },
      { "status": 1 },
      { "istsamanlass": false },
      { "nachkegeln": false }]
    })
    arResult[0].value = total;

    return arResult
  }

  public async getFKData(jahr: string | undifined): Promise<unknown> {
    const sWhere: WhereOptions<AnlassAttributes> = {};
    if (jahr)
      sWhere.datum = {
      [Op.and]: {
        [Op.gte]: jahr + "-01-01",
        [Op.lte]: jahr + "-12-31"
      }
    };
    const result = await Anlass.findAll({
      attributes: ["id", ["longname", "value"]],
      where: sWhere,
      order: [["datum", "ASC"]]

    });

    return result;
  }

  public async writeStammblatt(type: number, jahr: string, adresseId: number | undefined): Promise<RetDataFile> {
    const workbook = new Workbook();
    workbook.creator = "Janine Franken"
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;
    let sheet: Worksheet;
    let oneAdresse: Adresse | null;
    let allAdresse: Adresse[];

    switch (type) {
      case 0:
        // leeres Datenblatt neutral erstellen
        sheet = workbook.addWorksheet("Template", {
          pageSetup: {
            fitToPage: true,
            fitToHeight: 1,
            fitToWidth: 1,
          },
        });
        await this.createTemplate(jahr, sheet, false);
        break;

      case 1:
        // leeres Datenblatt für 1 oder alle Adressen erstellen
        if (adresseId) {
          oneAdresse = await Adresse.findByPk(adresseId);
          if (oneAdresse == null) throw new GlobalHttpException(409, "Adresse konnte nicht gefunden werden.")

          sheet = workbook.addWorksheet(oneAdresse.fullname, {
            pageSetup: {
              fitToPage: true,
              fitToHeight: 1,
              fitToWidth: 1,
            },
          });
          await this.createTemplate(jahr, sheet, false);
          this.fillName(sheet, oneAdresse);
        } else {
          allAdresse = await Adresse.findAll({
            where: {
              austritt: {
                [Op.gte]: new Date()
              }
            },
            order: [["name", "asc"], ["vorname", "asc"]]
          });

          for (const adresse of allAdresse) {
            sheet = workbook.addWorksheet(adresse.fullname, {
              pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
              },
            });
            await this.createTemplate(jahr, sheet, false);
            this.fillName(sheet, adresse);

          }
        }

        break;

      case 2:
        // gefülltes Datenblatt für 1 oder alle Adressen erstellen
        if (adresseId) {
          oneAdresse = await Adresse.findByPk(adresseId);
          if (oneAdresse == null) throw new GlobalHttpException(409, "Adresse konnte nicht gefunden werden.")

          sheet = workbook.addWorksheet(oneAdresse.fullname, {
            pageSetup: {
              fitToPage: true,
              fitToHeight: 1,
              fitToWidth: 1,
            },
          });
          await this.createTemplate(jahr, sheet, true);
          this.fillName(sheet, oneAdresse);
          await this.fillTemplate(sheet, adresseId, jahr);
        } else {
          allAdresse = await Adresse.findAll({
            where: {
              austritt: {
                [Op.gte]: new Date()
              }
            },
            include: [{
              model: Meisterschaft, as: 'meisterschafts', required: true,
              attributes: [],
              include: [{
                  model: Anlass, as: 'event', required: true,
                  attributes: [],
                  where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("datum")), jahr)
              }]
          }],
            order: [["name", "asc"], ["vorname", "asc"]]
          });

          for (const adresse of allAdresse) {
            sheet = workbook.addWorksheet(adresse.fullname, {
              pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
              },
            });
            await this.createTemplate(jahr, sheet, true);
            this.fillName(sheet, adresse);
            await this.fillTemplate(sheet, adresse.id, jahr);
          }

        }

        break;

      default:
        // error: Dieser Fall darf gar nicht zu treffen
        throw new GlobalHttpException(409, "Type wurde nicht korrekt angegeben");
    }

    let filename = "Stammblätter-" + jahr;
    if (adresseId)
      filename += "-" + adresseId;
    filename += ".xlsx";
    await workbook.xlsx.writeFile(systemVal.exports + filename)
      .catch((e) => {
        console.error(e);
        return {
          type: "error",
          message: e,
          data: {filename: ''}
        };
      });

    return {
      type: "info",
      message: "Excelfile erstellt",
      data: {filename: filename}
    };



  }
  private async createTemplate(syear: string, sheet: Worksheet, inclPoints: boolean) {
    // read all events
    let dbEvents = await Anlass.findAll({
      where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), syear),
      {
        [Op.or]: [
          { "istkegeln": true },
          { "punkte": { [Op.gt]: 0 } }
        ]
      }
      ],
      order: [
        ["istkegeln", "desc"],
        ["datum", "asc"],
        ["name", "asc"],
      ],
    });

    setCellValueFormat(sheet, "A2", "CLUB/KEGELMEISTERSCHAFT", false, "A2:I2", { bold: true, size: iFontSizeHeader });
    let cell = sheet.getCell("A2");
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    setCellValueFormat(sheet, "A4", syear, false, "A4:I4", undefined);

    cell = sheet.getCell("A4");
    cell.font = {
      bold: true,
      size: iFontSizeHeader,
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    sheet.getCell("B6").value = "Name:";
    sheet.getCell("B6").font = {
      bold: true,
      size: iFontSizeTitel
    };
    sheet.getCell(cName).font = {
      bold: true,
      size: iFontSizeTitel
    };
    sheet.getCell("B7").value = "Vorname:";
    sheet.getCell("B7").font = {
      bold: true,
      size: iFontSizeTitel
    };
    sheet.getCell(cVorname).font = {
      size: iFontSizeTitel
    };

    setCellValueFormat(sheet, "C11", "Kegelmeisterschaft", true, "C11:E11", { bold: true, size: iFontSizeTitel });

    let row = sFirstRow - 1;
    setCellValueFormat(sheet, "A" + row, "Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "B" + row, "Datum", true, "", { bold: true, size: iFontSizeRow });
    sheet.getColumn("B").width = 14;
    setCellValueFormat(sheet, "C" + row, "Resultate", true, "C" + row + ":G" + row, { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "H" + row, "z Pkt.", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "I" + row, "Total", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "J" + row, "Visum", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "K" + row, "eventid", false, "", { bold: true, size: iFontSizeRow });

    let clubTotal = 0;

    for (const event of dbEvents) {

      if (event.istkegeln) {
        // clubevent einfache Liste
        row++;
        if (event.status == 1) {
          clubTotal += event.punkte ?? 0;
          setCellValueFormat(sheet, "A" + row, (inclPoints ? event.punkte : ""), true, "", { size: iFontSizeRow });
        } else {
          setCellValueFormat(sheet, "A" + row, "", true, "", { size: iFontSizeRow, strike: true });
        }

        setCellValueFormat(sheet, "B" + row, new Date(event.datum).toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" }), true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "C" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "D" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "E" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "F" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "G" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "H" + row, (event.nachkegeln ? 0 : 5), true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "I" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "J" + row, "", true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "K" + row, event.id, false, "", { size: iFontSizeRow });
      }
    }

    row++;
    setCellValueFormat(sheet, "F" + row, "Total Kegeln", true, "F" + row + ":H" + row, { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "I" + row, 0, true, "", { bold: true, size: iFontSizeRow });
    row++;
    row++;

    setCellValueFormat(sheet, "C" + row, "Clubmeisterschaft", true, "C" + row + ":E" + row, { bold: true, size: iFontSizeTitel });

    row++;
    setCellValueFormat(sheet, "A" + row, "Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "B" + row, "Datum", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "C" + row, "Bezeichnung", true, "C" + row + ":I" + row, { bold: true, size: iFontSizeRow });

    for (const event of dbEvents) {

      if (!event.istkegeln) {
        row++;
        // clubevent einfache Liste
        if (event.status > 0) {
          clubTotal += event.punkte ?? 0;
          setCellValueFormat(sheet, "A" + row, (inclPoints ? event.punkte : ""), true, "", { size: iFontSizeRow });
        } else {
          setCellValueFormat(sheet, "A" + row, "", true, "", { size: iFontSizeRow, strike: true });
        }
        setCellValueFormat(sheet, "B" + row, new Date(event.datum).toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" }), true, "", { size: iFontSizeRow });
        setCellValueFormat(sheet, "C" + row, event.name, true, "C" + row + ":I" + row, { size: iFontSizeRow });
        setCellValueFormat(sheet, "K" + row, event.id, false, "", { size: iFontSizeRow });
      }
    }

    row++;
    setCellValueFormat(sheet, "B" + row, "Total Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "A" + row, (inclPoints ? clubTotal : 0), true, "", { bold: true, size: iFontSizeRow });


    sheet.getColumn("K").hidden = true;
    sheet.getColumn("J").width = 17;
    // Iterate over all rows (including empty rows) in a worksheet
    sheet.eachRow({
      includeEmpty: true
    }, function (rowData, rowNumber) {
      rowData.height = 15;
    });

  }

  /**
   * 
   * @param {Worksheet} sheet 
   * @param {Adressen} adress 
   */
  private fillName(sheet: Worksheet, adress: Adresse) {

    let cell = sheet.getCell(cName)
    cell.value = adress.name;
    cell = sheet.getCell(cVorname)
    cell.value = adress.vorname;
  }

  /**
   * 
   * @param {Worksheet} sheet 
   * @param {number} id 
   * @param {string} syear 
   */
  private async fillTemplate(sheet: Worksheet, id: number, syear: string) {
    const sqlstring = "select m.* from meisterschaft as m join anlaesse as a on m.eventid = a.id and year(a.datum) = " + syear + " where m.mitgliedid = " + id + " order by m.id"
    const data = await db.sequelize.query(sqlstring, { type: QueryTypes.SELECT, raw: false, model: Meisterschaft })

    if (data != undefined && data.length > 0) {
      let cols = sheet.getColumn('K');

      let clubTotal = 0
      let kegelTotal = 0

      cols.eachCell(function (cell, row) {
        if (cell.value != null && cell.value != "eventid") {
          for (let meisterschaft of data) {

            if (cell.value == meisterschaft.eventid) {
              sheet.getCell('A' + cell.row).value = meisterschaft.punkte;
              clubTotal += meisterschaft.punkte ?? 0;

              if ((meisterschaft.wurf1 ?? 0) > 0 || (meisterschaft.wurf2 ?? 0) > 0 || (meisterschaft.wurf3 ?? 0) > 0 || (meisterschaft.wurf4 ?? 0) > 0 || (meisterschaft.wurf5 ?? 0) > 0) {
                // Kegelresultat
                let kegelSumme = (meisterschaft.wurf1 ?? 0) + (meisterschaft.wurf2 ?? 0) + (meisterschaft.wurf3 ?? 0) + (meisterschaft.wurf4 ?? 0) + (meisterschaft.wurf5 ?? 0) + (meisterschaft.zusatz ?? 0);
                sheet.getCell('C' + cell.row).value = meisterschaft.wurf1;
                sheet.getCell('D' + cell.row).value = meisterschaft.wurf2;
                sheet.getCell('E' + cell.row).value = meisterschaft.wurf3;
                sheet.getCell('F' + cell.row).value = meisterschaft.wurf4;
                sheet.getCell('G' + cell.row).value = meisterschaft.wurf5;
                sheet.getCell('I' + cell.row).value = kegelSumme;
                if (!(meisterschaft.streichresultat ?? false)) {
                  kegelTotal += kegelSumme;
                } else {
                  // setzte diagonale Linie - > Streichresultat                                
                  sheet.getRow(row).eachCell({ includeEmpty: false }, function (formatCell, colNumber) {

                    formatCell.style.border = {
                      bottom: { style: 'thin' },
                      left: { style: 'thin' },
                      right: { style: 'thin' },
                      top: { style: 'thin' },
                      diagonal: {
                        up: true,
                        down: true,
                        style: 'thin',
                      }
                    };
                  });
                }
              }
              break;
            }
          }
        }
      });

      // Jetzt noch die Totals schreiben
      for (let i = sFirstRow; i <= sheet.lastRow!.number; i++) {
        const row = sheet.getRow(i);
        if (row.getCell('F').value == "Total Kegeln") {
          row.getCell('I').value = kegelTotal;
        } else if (row.getCell('B').value == "Total Club") {
          row.getCell('A').value = clubTotal;
        }
      }


    }

  }
}
