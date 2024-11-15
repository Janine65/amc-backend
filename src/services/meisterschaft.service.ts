import { Service } from "typedi";
import { GlobalHttpException } from "@/exceptions/globalHttpException";
import { systemVal } from "@/utils/system";
import {
  Adressen,
  Anlaesse,
  Clubmeister,
  Kegelmeister,
  Meisterschaft,
} from "@/models/init-models";
import { Sequelize, Op } from "sequelize";
import { Workbook, Worksheet } from "exceljs";

class MeisterMitglied {
  jahr!: string;
  rangC: number | undefined;
  punkteC: number | undefined;
  anlaesseC: number | undefined;
  werbungenC: number | undefined;
  mitglieddauerC: number | undefined;
  statusC: boolean | undefined;
  diffErsterC: number | undefined;
  rangK: number | undefined;
  punkteK: number | undefined;
  anlaesseK: number | undefined;
  statusK: boolean | undefined;
  babeliK: number | undefined;
  diffErsterK: number | undefined;
}

@Service()
export class MeisterschaftService {
  public async findAllMeisterschaft(): Promise<Meisterschaft[]> {
    const allMeisterschaft: Meisterschaft[] = await Meisterschaft.findAll();
    return allMeisterschaft;
  }

  public async findMeisterschaftById(
    meisterschaftId: string
  ): Promise<Meisterschaft> {
    const findMeisterschaft: Meisterschaft | null =
      await Meisterschaft.findByPk(meisterschaftId, {
        include: [
          {
            model: Adressen,
            as: "mitglied",
            required: true,
            attributes: ["id", "fullname"],
          },
        ],
      });
    if (!findMeisterschaft)
      throw new GlobalHttpException(409, "Meisterschaft doesn't exist");

    return findMeisterschaft;
  }

  public async createMeisterschaft(
    meisterschaftData: Meisterschaft
  ): Promise<Meisterschaft> {
    const findMeisterschaft: Meisterschaft | null = await Meisterschaft.findOne(
      {
        where: [{ mitgliedid: meisterschaftData.mitgliedid },
        { eventid: meisterschaftData.eventid }]
      });
    if (findMeisterschaft)
      throw new GlobalHttpException(
        409,
        `This key ${meisterschaftData.mitgliedid}/${meisterschaftData.eventid} already exists`
      );

    const createMeisterschaftData = Meisterschaft.build(meisterschaftData);
    await createMeisterschaftData.save();
    return createMeisterschaftData;
  }

  public async updateMeisterschaft(
    meisterschaftId: string,
    meisterschaftData: Meisterschaft
  ): Promise<Meisterschaft> {
    const findMeisterschaft: Meisterschaft | null =
      await Meisterschaft.findByPk(meisterschaftId);
    if (!findMeisterschaft)
      throw new GlobalHttpException(409, "Meisterschaft doesn't exist");

    await Meisterschaft.update(meisterschaftData, {
      where: { id: meisterschaftId },
    });

    const updateMeisterschaft: Meisterschaft | null =
      await Meisterschaft.findByPk(meisterschaftId);
    return updateMeisterschaft!;
  }

  public async deleteMeisterschaft(
    meisterschaftId: string
  ): Promise<Meisterschaft> {
    const findMeisterschaft: Meisterschaft | null =
      await Meisterschaft.findByPk(meisterschaftId);
    if (!findMeisterschaft)
      throw new GlobalHttpException(409, "Meisterschaft doesn't exist");

    await Meisterschaft.destroy({ where: { id: meisterschaftId } });

    return findMeisterschaft;
  }

  public async getMeisterschaftForEvent(
    eventid: number
  ): Promise<Meisterschaft[]> {
    const arMeisterschaft = await Meisterschaft.findAll({
      where: { eventid: eventid },
      include: {
        model: Adressen,
        as: "mitglied",
      },
      order: [["mitglied", "fullname", "asc"]],
    });
    return arMeisterschaft;
  }

  public async getMeisterschaftForMitglied(
    mitgliedid: number
  ): Promise<Meisterschaft[]> {
    const arMeisterschaft = await Meisterschaft.findAll({
      attributes: ["id", "punkte", "total_kegel", "streichresultat"],
      where: { mitgliedid: mitgliedid },
      include: {
        model: Anlaesse,
        as: "event",
        where: Sequelize.where(Sequelize.fn("year", Sequelize.col("datum")), {
          [Op.lte]: systemVal.params.get("CLUBJAHR"),
        }),
        attributes: [
          [Sequelize.fn("year", Sequelize.col("datum")), "jahr"],
          "datum",
          "name",
        ],
      },
      order: [["event", "datum", "DESC"]],
      raw: true,
      nest: true,
    });
    return arMeisterschaft;
  }

  public async getMeisterForMitglied(
    mitgliedid: number
  ): Promise<MeisterMitglied[]> {
    const lstClubFirst = await Clubmeister.findAll({
      where: { rang: 1 },
      order: [["jahr", "desc"]],
    });

    const lstKegelFirst = await Kegelmeister.findAll({
      where: { rang: 1 },
      order: [["jahr", "desc"]],
    });

    const arClub = await Clubmeister.findAll({
      where: { mitgliedid: mitgliedid },
      attributes: [
        "jahr",
        "rang",
        "punkte",
        "anlaesse",
        "werbungen",
        "mitglieddauer",
        "status",
      ],
      order: [["jahr", "desc"]],
    });

    const arKegel = await Kegelmeister.findAll({
      where: { mitgliedid: mitgliedid },
      attributes: ["jahr", "rang", "punkte", "anlaesse", "babeli", "status"],
      order: [["jahr", "desc"]],
    });

    const arResult: MeisterMitglied[] = [];

    for (const club of arClub) {
      let rec = this.copyData(club);
      let ikegel = arKegel.findIndex((keg) => keg.jahr == club.jahr);
      if (ikegel > -1) {
        rec = this.copyData(club, arKegel[ikegel]);

        let ifound = lstKegelFirst.findIndex(
          (kgl) => kgl.jahr == arKegel[ikegel].jahr
        );
        if (ifound > -1) {
          rec.diffErsterK =
            lstKegelFirst[ifound].punkte! - arKegel[ikegel].punkte!;
        }
        arKegel.splice(ikegel, 1);
      }

      let ifound = lstClubFirst.findIndex((clb) => clb.jahr == club.jahr);
      if (ifound > -1) {
        rec.diffErsterC = lstClubFirst[ifound].punkte! - club.punkte!;
      }

      arResult.push(rec);
    }

    for (const kegel of arKegel) {
      let rec = this.copyData(kegel);

      let ifound = lstKegelFirst.findIndex((kgl) => kgl.jahr == kegel.jahr);
      if (ifound > -1) {
        rec.diffErsterK = lstKegelFirst[ifound].punkte! - kegel.punkte!;
      }

      arResult.push(rec);
    }

    return arResult;
  }

  public async checkJahr(jahr: string): Promise<unknown> {
    const count = await Meisterschaft.count({
      where: { streichresultat: true },
      include: {
        model: Anlaesse,
        as: "event",
        attributes: [],
        where: Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("datum")),
          jahr
        ),
      },
    });
    return count;
  }

  public async getChartData(
    jahr: string,
    vorjahr: boolean
  ): Promise<Anlaesse[]> {
    const arAnlaesse = await Anlaesse.findAll({
      attributes: ["datum", "name", "gaeste", "anlaesseid"],
      where: [
        { nachkegeln: false },
        { status: 1},
        Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("datum")), jahr),
      ],
      include: {
        model: Meisterschaft,
        as: "meisterschafts",
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("mitgliedid")), "teilnehmer"],
        ],
      },
      group: ["datum", "name", "gaeste", "anlaesseid"],
      raw: true,
      nest: true,
    });
    if (vorjahr) {
      const alAnlaesseVJ = [];
      for (const anl of arAnlaesse) {
        alAnlaesseVJ.push(anl.anlaesseid!);
      }

      const arAnlaesseVJ = await Anlaesse.findAll({
        attributes: ["gaeste"],
        where: { id: { [Op.in]: alAnlaesseVJ } },
        include: {
          model: Meisterschaft,
          as: "meisterschafts",
          attributes: [
            "eventid",
            [Sequelize.fn("COUNT", Sequelize.col("mitgliedid")), "teilnehmer"],
          ],
        },
        group: ["eventid", "gaeste"],
        raw: true,
        nest: true,
      });

      for (const anl of arAnlaesse) {
        const ifound = arAnlaesseVJ.findIndex(
          (anlvj) => anlvj.meisterschafts[0].eventid == anl.anlaesseid
        );
        if (ifound > -1) {
          anl.vorjahr =
            Number(arAnlaesseVJ[ifound].gaeste ?? 0) +
            Number(arAnlaesseVJ[ifound].meisterschafts[0].teilnehmer ?? 0);
        }
      }

      return arAnlaesse;
    } else {
      return arAnlaesse;
    }
  }

  private copyData(
    club: Clubmeister | undefined = undefined,
    kegel: Kegelmeister | undefined = undefined
  ): MeisterMitglied {
    let data = new MeisterMitglied();

    if (club) {
      data.jahr = club.jahr;
      data.rangC = club.rang;
      data.punkteC = club.punkte;
      data.anlaesseC = club.anlaesse;
      data.mitglieddauerC = club.mitglieddauer;
      data.werbungenC = club.werbungen;
      data.statusC = club.status;
    }

    if (kegel) {
      data.jahr = kegel.jahr;
      data.rangK = kegel.rang;
      data.punkteK = kegel.punkte;
      data.anlaesseK = kegel.anlaesse;
      data.babeliK = kegel.babeli;
      data.statusK = kegel.status;
    }

    return data;
  }

  public async writeAuswertung(jahr: string): Promise<unknown> {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(
      systemVal.exports + "Meisterschaft-Vorlage.xlsx"
    );

    // Clubmeisterschaft lesen und exportieren
    const dbMeister = await Clubmeister.findAll({
      where: { jahr: { [Op.eq]: jahr } },
      order: [["rang", "asc"]],
    });
    let worksheet = workbook.getWorksheet("Clubmeisterschaft");
    if (worksheet) {
      worksheet.getCell("A1").value = "Clubmeisterschaft " + jahr;
      let row = 5;
      for (const meister of dbMeister) {
        // Add a row by contiguous Array (assign to columns A, B & C)
        worksheet.insertRow(
          row,
          [
            meister.rang,
            meister.punkte,
            meister.vorname,
            meister.nachname,
            meister.mitgliedid,
            meister.anlaesse,
            meister.werbungen,
            meister.mitglieddauer,
            meister.status,
          ],
          "i+"
        );
        row++;
      }
      worksheet.getColumn(5).hidden = true;
      worksheet.getColumn(9).hidden = true;
      worksheet.spliceRows(4, 1);
    }

    // Kegelmeisterschaft lesen und exportieren
    const dbKMeister = await Kegelmeister.findAll({
      where: { jahr: { [Op.eq]: jahr } },
      order: [["rang", "asc"]],
    });
    worksheet = workbook.getWorksheet("Kegelmeisterschaft");
    if (worksheet) {
      worksheet.getCell("A1").value = "Kegelmeisterschaft " + jahr;
      let row = 5;
      for (const meister of dbKMeister) {
        // Add a row by contiguous Array (assign to columns A, B & C)
        worksheet.insertRow(
          row,
          [
            meister.rang,
            meister.punkte,
            meister.vorname,
            meister.nachname,
            meister.mitgliedid,
            meister.anlaesse,
            meister.babeli,
            meister.status,
          ],
          "i+"
        );
        row++;
      }
      worksheet.getColumn(5).hidden = true;
      worksheet.getColumn(8).hidden = true;
      worksheet.spliceRows(4, 1);
    }
    // Datei sichern
    let filename = "Meisterschaft-" + jahr + ".xlsx";
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
}
