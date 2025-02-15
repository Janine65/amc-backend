import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnlaesseDto } from './dto/create-anlaesse.dto';
import { UpdateAnlaesseDto } from './dto/update-anlaesse.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OverviewDto } from '../adressen/dto/overview.dto';
import { ConfigService } from 'src/config/config.service';
import { adressen, anlaesse } from '@prisma/client';
import { Workbook, Worksheet } from 'exceljs';
import {
  setCellValueFormat,
  iFontSizeHeader,
  iFontSizeTitel,
  iFontSizeRow,
} from 'src/utils/general.service';

@Injectable()
export class AnlaesseService {
  cName = 'C6';
  cVorname = 'C7';
  sFirstRow = 13;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  create(createAnlaesseDto: CreateAnlaesseDto) {
    if (typeof createAnlaesseDto.datum === 'string') {
      createAnlaesseDto.datum = new Date(createAnlaesseDto.datum);
    }
    return this.prisma.anlaesse.create({
      data: {
        ...createAnlaesseDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        longname:
          createAnlaesseDto.datum.toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }) +
          ' - ' +
          createAnlaesseDto.name,
      },
      include: { anlaesse: true },
    });
  }

  findAll(fromJahr: number, toJahr: number, istKegeln?: string) {
    if (istKegeln === undefined) {
      return this.prisma.anlaesse.findMany({
        where: {
          datum: {
            gt: new Date(fromJahr + '-01-01T00:00:00Z'),
            lt: new Date(toJahr + 1 + '-01-01T00:00:00Z'),
          },
        },
        include: { anlaesse: true },
        orderBy: { datum: 'asc' },
      });
    } else {
      return this.prisma.anlaesse.findMany({
        where: {
          datum: {
            gt: new Date(fromJahr + '-01-01T00:00:00Z'),
            lt: new Date(toJahr + 1 + '-01-01T00:00:00Z'),
          },
          istkegeln: Boolean(istKegeln),
        },
        include: { anlaesse: true },
        orderBy: { datum: 'asc' },
      });
    }
  }

  findOne(id: number) {
    return this.prisma.anlaesse.findUnique({
      where: { id },
      include: { anlaesse: true },
    });
  }

  async update(id: number, updateAnlaesseDto: UpdateAnlaesseDto) {
    const anlass = await this.findOne(id);
    if (!anlass) {
      return null;
    }
    if (!updateAnlaesseDto.datum) {
      updateAnlaesseDto.datum = anlass.datum;
    } else {
      if (typeof updateAnlaesseDto.datum === 'string') {
        updateAnlaesseDto.datum = new Date(updateAnlaesseDto.datum);
      }
    }
    if (!updateAnlaesseDto.name) {
      updateAnlaesseDto.name = anlass.name;
    }
    return this.prisma.anlaesse.update({
      where: { id },
      data: {
        ...updateAnlaesseDto,
        updatedAt: new Date(),
        longname:
          updateAnlaesseDto.datum.toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }) +
          ' - ' +
          updateAnlaesseDto.name,
      },
      include: { anlaesse: true },
    });
  }

  remove(id: number) {
    return this.prisma.anlaesse.delete({ where: { id } });
  }

  async getOverview() {
    // get a json file with the following information to display on first page:
    // count of Total Anlässe im system_param jahr
    // count of Total Zukünftige Anlässe im param jahr
    const arResult: OverviewDto[] = [
      { label: 'Total Anlässe', value: 0 },
      { label: 'Zukünftige Anlässe', value: 0 },
    ];
    const year = this.configService.params.get('CLUBJAHR');
    const fromDate = new Date(year + '-01-01T00:00:00Z');
    const toDate = new Date(Number(year) + 1 + '-01-01T00:00:00Z');
    arResult[0].value = await this.prisma.anlaesse.count({
      where: {
        datum: {
          gt: fromDate,
          lt: toDate,
        },
      },
    });
    arResult[1].value = await this.prisma.anlaesse.count({
      where: {
        datum: {
          gt: new Date(),
          lt: toDate,
        },
      },
    });

    return arResult;
  }

  async getFKData(jahr: string) {
    let lstAnlaesse: anlaesse[] = [];
    lstAnlaesse = await this.prisma.anlaesse.findMany({
      where: {
        datum: {
          gt: new Date(jahr + '-01-01T00:00:00Z'),
          lt: new Date(Number(jahr) + 1 + '-01-01T00:00:00Z'),
        },
      },
      orderBy: { datum: 'asc' },
    });

    const result: { id: number; value: string }[] = [];

    for (const anlass of lstAnlaesse) {
      result.push({ id: anlass.id, value: anlass.longname });
    }
    return result;
  }

  async writeStammblatt(type: number, jahr: string, adresseId?: number) {
    const workbook = new Workbook();
    workbook.creator = 'Janine Franken';
    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;
    let sheet: Worksheet;
    let oneAdresse: adressen | null;
    let allAdresse: adressen[];

    switch (type) {
      case 0: {
        // leeres Datenblatt neutral erstellen
        sheet = workbook.addWorksheet('Template', {
          pageSetup: {
            fitToPage: true,
            fitToHeight: 1,
            fitToWidth: 1,
          },
        });
        await this.createTemplate(jahr, sheet, false);
        break;
      }
      case 1: {
        // leeres Datenblatt für 1 oder alle Adressen erstellen
        if (adresseId) {
          oneAdresse = await this.prisma.adressen.findUnique({
            where: { id: Number(adresseId) },
          });
          if (oneAdresse == null)
            throw new NotFoundException(
              'Adresse konnte nicht gefunden werden.',
            );

          sheet = workbook.addWorksheet(oneAdresse.fullname!, {
            pageSetup: {
              fitToPage: true,
              fitToHeight: 1,
              fitToWidth: 1,
            },
          });
          await this.createTemplate(jahr, sheet, false);
          this.fillName(sheet, oneAdresse);
        } else {
          allAdresse = await this.prisma.adressen.findMany({
            where: {
              austritt: {
                gte: new Date(),
              },
            },
            orderBy: [{ name: 'asc' }, { vorname: 'asc' }],
          });

          for (const adresse of allAdresse) {
            sheet = workbook.addWorksheet(adresse.fullname!, {
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
      }
      case 2: {
        // gefülltes Datenblatt für 1 oder alle Adressen erstellen
        if (adresseId) {
          oneAdresse = await this.prisma.adressen.findUnique({
            where: { id: Number(adresseId) },
          });
          if (oneAdresse == null)
            throw new NotFoundException(
              'Adresse konnte nicht gefunden werden.',
            );

          sheet = workbook.addWorksheet(oneAdresse.fullname!, {
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
          allAdresse = await this.prisma.adressen.findMany({
            where: {
              austritt: {
                gte: new Date(),
              },
            },
            orderBy: [{ name: 'asc' }, { vorname: 'asc' }],
          });

          for (const adresse of allAdresse) {
            sheet = workbook.addWorksheet(adresse.fullname!, {
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
      }
      default: {
        throw new NotFoundException('Typ nicht gefunden.');
      }
    }

    let filename = 'Stammblätter-' + jahr;
    if (adresseId) filename += '-' + adresseId;
    filename += '.xlsx';
    await workbook.xlsx
      .writeFile(this.configService.exports + filename)
      .catch((e) => {
        console.error(e);
        return {
          type: 'error',
          message: String(e),
          data: { filename: '' },
        };
      });

    return {
      type: 'info',
      message: 'Excelfile erstellt',
      data: { filename: filename },
    };
  }

  private async createTemplate(
    syear: string,
    sheet: Worksheet,
    inclPoints: boolean,
  ) {
    // read all events
    const dbEvents = await this.prisma.anlaesse.findMany({
      where: {
        datum: {
          gt: new Date(syear + '-01-01T00:00:00Z'),
          lt: new Date(Number(syear) + 1 + '-01-01T00:00:00Z'),
        },
      },
      orderBy: [{ istkegeln: 'desc' }, { datum: 'asc' }, { name: 'asc' }],
    });

    setCellValueFormat(sheet, 'A2', 'CLUB/KEGELMEISTERSCHAFT', false, 'A2:I2', {
      bold: true,
      size: iFontSizeHeader,
    });
    let cell = sheet.getCell('A2');
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    setCellValueFormat(sheet, 'A4', syear, false, 'A4:I4', undefined);

    cell = sheet.getCell('A4');
    cell.font = {
      bold: true,
      size: iFontSizeHeader,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    sheet.getCell('B6').value = 'Name:';
    sheet.getCell('B6').font = {
      bold: true,
      size: iFontSizeTitel,
    };
    sheet.getCell(this.cName).font = {
      bold: true,
      size: iFontSizeTitel,
    };
    sheet.getCell('B7').value = 'Vorname:';
    sheet.getCell('B7').font = {
      bold: true,
      size: iFontSizeTitel,
    };
    sheet.getCell(this.cVorname).font = {
      size: iFontSizeTitel,
    };

    setCellValueFormat(sheet, 'C11', 'Kegelmeisterschaft', true, 'C11:E11', {
      bold: true,
      size: iFontSizeTitel,
    });

    let row = this.sFirstRow - 1;
    setCellValueFormat(sheet, 'A' + row, 'Club', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'B' + row, 'Datum', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    sheet.getColumn('B').width = 14;
    setCellValueFormat(
      sheet,
      'C' + row,
      'Resultate',
      true,
      'C' + row + ':G' + row,
      { bold: true, size: iFontSizeRow },
    );
    setCellValueFormat(sheet, 'H' + row, 'z Pkt.', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'I' + row, 'Total', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'J' + row, 'Visum', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'K' + row, 'eventid', false, '', {
      bold: true,
      size: iFontSizeRow,
    });

    let clubTotal = 0;

    for (const event of dbEvents) {
      if (event.istkegeln) {
        // clubevent einfache Liste
        row++;
        if (event.status == 1) {
          clubTotal += event.punkte ?? 0;
          setCellValueFormat(
            sheet,
            'A' + row,
            inclPoints ? event.punkte : '',
            true,
            '',
            { size: iFontSizeRow },
          );
        } else {
          setCellValueFormat(sheet, 'A' + row, '', true, '', {
            size: iFontSizeRow,
            strike: true,
          });
        }

        setCellValueFormat(
          sheet,
          'B' + row,
          new Date(event.datum).toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          true,
          '',
          { size: iFontSizeRow },
        );
        setCellValueFormat(sheet, 'C' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'D' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'E' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'F' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'G' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(
          sheet,
          'H' + row,
          event.nachkegeln ? 0 : 5,
          true,
          '',
          { size: iFontSizeRow },
        );
        setCellValueFormat(sheet, 'I' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'J' + row, '', true, '', {
          size: iFontSizeRow,
        });
        setCellValueFormat(sheet, 'K' + row, event.id, false, '', {
          size: iFontSizeRow,
        });
      }
    }

    row++;
    setCellValueFormat(
      sheet,
      'F' + row,
      'Total Kegeln',
      true,
      'F' + row + ':H' + row,
      { bold: true, size: iFontSizeRow },
    );
    setCellValueFormat(sheet, 'I' + row, 0, true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    row++;
    row++;

    setCellValueFormat(
      sheet,
      'C' + row,
      'Clubmeisterschaft',
      true,
      'C' + row + ':E' + row,
      { bold: true, size: iFontSizeTitel },
    );

    row++;
    setCellValueFormat(sheet, 'A' + row, 'Club', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'B' + row, 'Datum', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(
      sheet,
      'C' + row,
      'Bezeichnung',
      true,
      'C' + row + ':I' + row,
      { bold: true, size: iFontSizeRow },
    );

    for (const event of dbEvents) {
      if (!event.istkegeln) {
        row++;
        // clubevent einfache Liste
        if (event.status > 0) {
          clubTotal += event.punkte ?? 0;
          setCellValueFormat(
            sheet,
            'A' + row,
            inclPoints ? event.punkte : '',
            true,
            '',
            { size: iFontSizeRow },
          );
        } else {
          setCellValueFormat(sheet, 'A' + row, '', true, '', {
            size: iFontSizeRow,
            strike: true,
          });
        }
        setCellValueFormat(
          sheet,
          'B' + row,
          new Date(event.datum).toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          true,
          '',
          { size: iFontSizeRow },
        );
        setCellValueFormat(
          sheet,
          'C' + row,
          event.name,
          true,
          'C' + row + ':I' + row,
          { size: iFontSizeRow },
        );
        setCellValueFormat(sheet, 'K' + row, event.id, false, '', {
          size: iFontSizeRow,
        });
      }
    }

    row++;
    setCellValueFormat(sheet, 'B' + row, 'Total Club', true, '', {
      bold: true,
      size: iFontSizeRow,
    });
    setCellValueFormat(sheet, 'A' + row, inclPoints ? clubTotal : 0, true, '', {
      bold: true,
      size: iFontSizeRow,
    });

    sheet.getColumn('K').hidden = true;
    sheet.getColumn('J').width = 17;
    // Iterate over all rows (including empty rows) in a worksheet
    sheet.eachRow(
      {
        includeEmpty: true,
      },
      function (rowData) {
        rowData.height = 15;
      },
    );
  }

  /**
   *
   * @param {Worksheet} sheet
   * @param {Adressen} adress
   */
  private fillName(sheet: Worksheet, adress: adressen) {
    let cell = sheet.getCell(this.cName);
    cell.value = adress.name;
    cell = sheet.getCell(this.cVorname);
    cell.value = adress.vorname;
  }

  /**
   *
   * @param {Worksheet} sheet
   * @param {number} id
   * @param {string} syear
   */
  private async fillTemplate(sheet: Worksheet, id: number, syear: string) {
    const data = await this.prisma.meisterschaft.findMany({
      where: {
        mitgliedid: Number(id),
        anlaesse: {
          datum: {
            gt: new Date(syear + '-01-01T00:00:00Z'),
            lt: new Date(Number(syear) + 1 + '-01-01T00:00:00Z'),
          },
        },
      },
      orderBy: { id: 'asc' },
    });
    const sFirstRow = 13;

    if (data != undefined && data.length > 0) {
      const cols = sheet.getColumn('K');

      let clubTotal = 0;
      let kegelTotal = 0;

      cols.eachCell(function (cell, row) {
        if (cell.value != null && cell.value != 'eventid') {
          for (const meister_rec of data) {
            if (cell.value == meister_rec.eventid) {
              sheet.getCell('A' + cell.row).value = meister_rec.punkte;
              clubTotal += meister_rec.punkte ?? 0;

              if (
                (meister_rec.wurf1 ?? 0) > 0 ||
                (meister_rec.wurf2 ?? 0) > 0 ||
                (meister_rec.wurf3 ?? 0) > 0 ||
                (meister_rec.wurf4 ?? 0) > 0 ||
                (meister_rec.wurf5 ?? 0) > 0
              ) {
                // Kegelresultat
                const kegelSumme =
                  (meister_rec.wurf1 ?? 0) +
                  (meister_rec.wurf2 ?? 0) +
                  (meister_rec.wurf3 ?? 0) +
                  (meister_rec.wurf4 ?? 0) +
                  (meister_rec.wurf5 ?? 0) +
                  (meister_rec.zusatz ?? 0);
                sheet.getCell('C' + cell.row).value = meister_rec.wurf1;
                sheet.getCell('D' + cell.row).value = meister_rec.wurf2;
                sheet.getCell('E' + cell.row).value = meister_rec.wurf3;
                sheet.getCell('F' + cell.row).value = meister_rec.wurf4;
                sheet.getCell('G' + cell.row).value = meister_rec.wurf5;
                sheet.getCell('I' + cell.row).value = kegelSumme;
                if (!(meister_rec.streichresultat ?? false)) {
                  kegelTotal += kegelSumme;
                } else {
                  // setzte diagonale Linie - > Streichresultat
                  sheet
                    .getRow(row)
                    .eachCell({ includeEmpty: false }, function (formatCell) {
                      formatCell.style.border = {
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                        top: { style: 'thin' },
                        diagonal: {
                          up: true,
                          down: true,
                          style: 'thin',
                        },
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
        if (row.getCell('F').value == 'Total Kegeln') {
          row.getCell('I').value = kegelTotal;
        } else if (row.getCell('B').value == 'Total Club') {
          row.getCell('A').value = clubTotal;
        }
      }
    }
  }
}
