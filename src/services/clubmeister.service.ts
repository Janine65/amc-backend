import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Clubmeister } from '@/models/clubmeister';
import { systemVal } from '@/utils/system';
import { Adressen, Anlaesse, Meisterschaft } from '@/models/init-models';
import { Sequelize, Op } from 'sequelize';

@Service()
export class ClubmeisterService {
	public async findAllClubmeister(jahr: string): Promise<Clubmeister[]> {
		const allClubmeister: Clubmeister[] = await Clubmeister.findAll({
			where: { jahr: jahr },
			order: [['rang', 'asc']]
		});
		return allClubmeister;
	}

	public async findClubmeisterById(clubmeisterId: string): Promise<Clubmeister> {
		const findClubmeister: Clubmeister | null = await Clubmeister.findByPk(clubmeisterId);
		if (!findClubmeister) throw new GlobalHttpException(409, "Clubmeister doesn't exist");

		return findClubmeister;
	}

	public async createClubmeister(clubmeisterData: Clubmeister): Promise<Clubmeister> {
		const findClubmeister: Clubmeister | null = await Clubmeister.findOne({ where: { id: clubmeisterData.id } });
		if (findClubmeister) throw new GlobalHttpException(409, `This key ${clubmeisterData.id} already exists`);

		const createClubmeisterData: Clubmeister = await Clubmeister.create(clubmeisterData);
		return createClubmeisterData;
	}

	public async updateClubmeister(clubmeisterId: string, clubmeisterData: Clubmeister): Promise<Clubmeister> {
		const findClubmeister: Clubmeister | null = await Clubmeister.findByPk(clubmeisterId);
		if (!findClubmeister) throw new GlobalHttpException(409, "Clubmeister doesn't exist");

		await Clubmeister.update(clubmeisterData, { where: { id: clubmeisterId } });

		const updateClubmeister: Clubmeister | null = await Clubmeister.findByPk(clubmeisterId);
		return updateClubmeister!;
	}

	public async deleteClubmeister(clubmeisterId: string): Promise<Clubmeister> {
		const findClubmeister: Clubmeister | null = await Clubmeister.findByPk(clubmeisterId);
		if (!findClubmeister) throw new GlobalHttpException(409, "Clubmeister doesn't exist");

		await Clubmeister.destroy({ where: { id: clubmeisterId } });

		return findClubmeister;
	}

	public async getOverviewData(): Promise<unknown[]> {
		const arResult = [{ label: 'Clubmeisterschaft', value: 0 }];

		const anzahl = await Clubmeister.count({
			where: [{
				jahr: systemVal.Parameter.get('CLUBJAHR')
			}, {
				status: true
			}]
		});

		arResult[0].value = anzahl;
		return arResult;
	}

	public async calcMeister(jahr: string): Promise<unknown> {

		const arMeister: Clubmeister[] = [];
		const allMitgliedId = []

		const alAnlaesse = await Anlaesse.findAll({
			where: Sequelize.where(Sequelize.fn('year', Sequelize.col("datum")), jahr)
		});
		const arAnlaesse = []
		for (const element of alAnlaesse) {
			arAnlaesse.push(element.id);
		}

		const alMeisterschaft = await Meisterschaft.findAll({
			attributes: ["mitgliedid", 
				[Sequelize.fn('SUM', Sequelize.col("punkte")), "punkte"], 
				[Sequelize.fn("COUNT", Sequelize.col("eventid")), "countEvent"]],
			where: [{ "eventid": { [Op.in]: arAnlaesse } },
			{ "punkte": { [Op.gt]: 0 } }],
			group: ["mitgliedid"],
			raw: true
		})

		for (const element of alMeisterschaft) {
			allMitgliedId.push(element.mitgliedid)
			let meister = new Clubmeister({ jahr: jahr, mitgliedid: element.mitgliedid, punkte: Number(element.punkte), anlaesse: Number(element.countEvent), werbungen: 0, mitglieddauer: 0 });
			arMeister.push(meister);
		}

		let alAdressen = await Adressen.findAll({
			attributes: ["adressenid", [Sequelize.fn('COUNT', '*'), "countAdressen"]],
			where: [Sequelize.where(Sequelize.fn('year', Sequelize.col("eintritt")), jahr),
			{ "austritt": "3000-01-01T00:00:00" }],
			group: "adressenid",
			mapToModel: false
		})

		for (const adresse of alAdressen) {
			let lPunkte = Number(adresse.countAdressen) * 50
			let ifound: number = arMeister.findIndex((element) => element.mitgliedid == adresse.adressenid)
			if (ifound > -1) {
				let meister = arMeister[ifound]
				meister.werbungen = Number(adresse.countAdressen);
				meister.punkte = meister.punkte ?? 0 + lPunkte
				arMeister[ifound] = meister
			}
		}

		if (allMitgliedId.length > 0) {
			// Informationen aus Adresse lesen
			alAdressen = await Adressen.findAll({
				attributes: ["id", "mnr", "vorname", "name", "eintritt"],
				where: { "id": { [Op.in]: allMitgliedId } },
				raw: true
			})

			for (const adresse of alAdressen) {
				let ifound = arMeister.findIndex((element) => element.mitgliedid == adresse.id)
				if (ifound > -1) {
					let meister = arMeister[ifound]
					meister.vorname = adresse.vorname
					meister.nachname = adresse.name
					const eintritt = new Date(adresse.eintritt!).getFullYear()
					meister.mitglieddauer = Number(jahr) - eintritt;
					arMeister[ifound] = meister
				} else {
					console.error('clubmeister/calcmeister: Beim Abfüllen der Mitglieddaten ist ein Fehler aufgetreten');
				}

			}
		}

		// nun wird der Array sortiert nach den entsprechenden Kriterien
		arMeister.sort((e1, e2) => {
			let order = 0
			if (e1.punkte! > e2.punkte!)
				order = -1
			else if (e1.punkte == e2.punkte && e1.anlaesse! > e2.anlaesse!)
				order = -1
			else if (e1.punkte == e2.punkte && e1.anlaesse == e2.anlaesse && e1.mitglieddauer! > e2.mitglieddauer!)
				order = -1
			else if (e1.punkte == e2.punkte && e1.anlaesse == e2.anlaesse && e1.mitglieddauer! == e2.mitglieddauer!)
				order = 0
			else order = 1

			return order
		});

		// bestehende Daten löschen
		await Clubmeister.destroy({
			where: { "jahr": jahr }
		})

		// insert und Rang setzten
		const arRetMeister: Clubmeister[] = [];
		if (arMeister.length > 0) {
			const cMinPunkte = arMeister[0].punkte! * 0.4;
			for (let ind = 0; ind < arMeister.length; ind++) {
				arMeister[ind].isNewRecord = true;
				arMeister[ind].rang = ind + 1
				arMeister[ind].status = arMeister[ind].punkte! >= cMinPunkte;

				arRetMeister.push(await arMeister[ind].save(
					{
						fields: ["jahr",
							"rang",
							"vorname",
							"nachname",
							"mitgliedid",
							"punkte",
							"anlaesse",
							"werbungen",
							"mitglieddauer",
							"status"]
					}));
			}

		}

		return arRetMeister;
	}

}
