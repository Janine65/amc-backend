import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Kegelmeister } from '@/models/kegelmeister';
import { systemVal } from '@/utils/system';
import { Adressen, Anlaesse, Meisterschaft } from '@/models/init-models';
import { Sequelize, Op } from 'sequelize';

@Service()
export class KegelmeisterService {
	public async findAllKegelmeister(jahr: string): Promise<Kegelmeister[]> {
		const allKegelmeister: Kegelmeister[] = await Kegelmeister.findAll({
			where: { jahr: jahr },
			order: [['rang', 'asc']]
		});
		return allKegelmeister;
	}

	public async findKegelmeisterById(kegelmeisterId: string): Promise<Kegelmeister> {
		const findKegelmeister: Kegelmeister | null = await Kegelmeister.findByPk(kegelmeisterId);
		if (!findKegelmeister) throw new GlobalHttpException(409, "Kegelmeister doesn't exist");

		return findKegelmeister;
	}

	public async createKegelmeister(kegelmeisterData: Kegelmeister): Promise<Kegelmeister> {
		const findKegelmeister: Kegelmeister | null = await Kegelmeister.findOne({ where: { id: kegelmeisterData.id } });
		if (findKegelmeister) throw new GlobalHttpException(409, `This key ${kegelmeisterData.id} already exists`);

		const createKegelmeisterData: Kegelmeister = await Kegelmeister.create(kegelmeisterData);
		return createKegelmeisterData;
	}

	public async updateKegelmeister(kegelmeisterId: string, kegelmeisterData: Kegelmeister): Promise<Kegelmeister> {
		const findKegelmeister: Kegelmeister | null = await Kegelmeister.findByPk(kegelmeisterId);
		if (!findKegelmeister) throw new GlobalHttpException(409, "Kegelmeister doesn't exist");

		await Kegelmeister.update(kegelmeisterData, { where: { id: kegelmeisterId } });

		const updateKegelmeister: Kegelmeister | null = await Kegelmeister.findByPk(kegelmeisterId);
		return updateKegelmeister!;
	}

	public async deleteKegelmeister(kegelmeisterId: string): Promise<Kegelmeister> {
		const findKegelmeister: Kegelmeister | null = await Kegelmeister.findByPk(kegelmeisterId);
		if (!findKegelmeister) throw new GlobalHttpException(409, "Kegelmeister doesn't exist");

		await Kegelmeister.destroy({ where: { id: kegelmeisterId } });

		return findKegelmeister;
	}

	public async getOverviewData(): Promise<unknown[]> {
		const arResult = [{ label: 'Kegelmeisterschaft', value: 0 }];

		const anzahl = await Kegelmeister.count({
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

		const arMeister: Kegelmeister[] = [];
		let allMitgliedId: number[] = []
		let alMeisterschaft: Meisterschaft[] = [];

		const alAnlaesse = await Anlaesse.findAll({
			where: [Sequelize.where(Sequelize.fn('year', Sequelize.col("datum")), jahr),
			{ "istkegeln": true }]
		});
		const arAnlaesse: number[] = []
		for (const anlass of alAnlaesse) {
			arAnlaesse.push(anlass.id!);
		}
		if (jahr == systemVal.Parameter.get('CLUBJAHR')) {
			let anzahl = await Anlaesse.count({
				where: [Sequelize.where(Sequelize.fn('year', Sequelize.col("datum")), jahr),
				{ "nachkegeln": false },
				{ "istkegeln": true },
				{ "datum": { [Op.gt]: new Date() } }
				]
			});
			if (anzahl == 0) {
				// Streichresultate setzen
				// Anzahl Ergebnisse = global.Parameter.get('ANZAHL_KEGEL')

				// alle Ergebnisse auf Streichresultat = 0
				await Meisterschaft.update({ "zusatz": 0 },
					{
						where: [{ "eventid": { [Op.in]: arAnlaesse } },
						{ "zusatz": { [Op.is]: null } }]
					});

				// alle Ergebnisse auf Streichresultat = 0
				await Meisterschaft.update({ "streichresultat": false },
					{ where: { "eventid": { [Op.in]: arAnlaesse } } });

				// alle Ergebnisse auf Streichresultat = 1, wenn Wurf-Total = 0
				await Meisterschaft.update({ "streichresultat": true },
					{
						where: [{ "eventid": { [Op.in]: arAnlaesse } },
						{ "total_kegel": { [Op.lte]: 6 } }]
					});

				await Meisterschaft.update({ "streichresultat": true },
					{
						where: [{ "eventid": { [Op.in]: arAnlaesse } },
						{ "total_kegel": { [Op.is]: null } }]
					});

				// alle Ergebnisse, die weniger als 'Anzahl Ergebnisse' haben, Streichresultat = 1
				alMeisterschaft = await Meisterschaft.findAll({
					attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("eventid")), "anzahl"]],
					where: [{ "eventid": { [Op.in]: arAnlaesse } },
					{ "streichresultat": false }],
					group: ["mitgliedid"],
					having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col("eventid")), { [Op.lt]: systemVal.Parameter.get('ANZAHL_KEGEL') }),
					raw: true
				})
				for (const element of alMeisterschaft) {
					allMitgliedId.push(element.mitgliedid!);
				}
				if (allMitgliedId.length > 0) {
					await Meisterschaft.update({ "streichresultat": true },
						{
							where: [{ "eventid": { [Op.in]: arAnlaesse } },
							{ "mitgliedid": { [Op.in]: allMitgliedId } }]
						});
					allMitgliedId = []
				}

				// Update Ergebnisse, Rowid > ANZAHL_KEGELN => Streichresultat = 1
				alMeisterschaft = await Meisterschaft.findAll({
					attributes: ["id", "mitgliedid", "total_kegel"],
					where: [{ "eventid": { [Op.in]: arAnlaesse } },
					{ "streichresultat": false }],
					order: ["mitgliedid", ["total_kegel", "DESC"]],
					raw: true
				})
				let zwmitgliedid = 0
				let anzahl = 0
				for (const meister of alMeisterschaft) {
					if (zwmitgliedid != meister.mitgliedid) {
						zwmitgliedid = meister.mitgliedid!;
						anzahl = 0;
					}
					anzahl++
					if (anzahl > Number(systemVal.Parameter.get('ANZAHL_KEGEL')))
						allMitgliedId.push(meister.id!)
				}
				if (allMitgliedId.length > 0) {
					await Meisterschaft.update({ "streichresultat": true },
						{
							where: [{ "eventid": { [Op.in]: arAnlaesse } },
							{ "id": { [Op.in]: allMitgliedId } }]
						});
					allMitgliedId = []
				}
			} // keine offenen Kegelevents mehr
		} // nur im aktuellen Jahr

		alMeisterschaft = await Meisterschaft.findAll({
			attributes: ["mitgliedid",
				[Sequelize.fn('SUM', Sequelize.col("total_kegel")), "total_kegel"],
				[Sequelize.fn("COUNT", Sequelize.col("eventid")), "countEvent"]],
			where: [{ "eventid": { [Op.in]: arAnlaesse } },
			{ "streichresultat": false }],
			group: ["mitgliedid"],
			raw: true
		})

		for (const element of alMeisterschaft) {
			allMitgliedId.push(element.mitgliedid!)
			let meister = new Kegelmeister({ jahr: jahr, mitgliedid: element.mitgliedid, punkte: Number(element.total_kegel), anlaesse: Number(element.countEvent), babeli: 0 });
			arMeister.push(meister);
		}

		// Babeli ermitteln
		alMeisterschaft = await
			Meisterschaft.findAll({
				attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("id")), "punkte"]],
				where: [{ "eventid": { [Op.in]: arAnlaesse } },
				{ "wurf1": 9 }],
				group: ["mitgliedid"]
			});
		alMeisterschaft.concat(await
			Meisterschaft.findAll({
				attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("id")), "punkte"]],
				where: [{ "eventid": { [Op.in]: arAnlaesse } },
				{ "wurf2": 9 }],
				group: ["mitgliedid"]
			}));
		alMeisterschaft.concat(await
			Meisterschaft.findAll({
				attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("id")), "punkte"]],
				where: [{ "eventid": { [Op.in]: arAnlaesse } },
				{ "wurf3": 9 }],
				group: ["mitgliedid"]
			}));
		alMeisterschaft.concat(await
			Meisterschaft.findAll({
				attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("id")), "punkte"]],
				where: [{ "eventid": { [Op.in]: arAnlaesse } },
				{ "wurf4": 9 }],
				group: ["mitgliedid"]
			}));
		alMeisterschaft.concat(await
			Meisterschaft.findAll({
				attributes: ["mitgliedid", [Sequelize.fn('COUNT', Sequelize.col("id")), "punkte"]],
				where: [{ "eventid": { [Op.in]: arAnlaesse } },
				{ "wurf5": 9 }],
				group: ["mitgliedid"]
			}));

		for (const element of alMeisterschaft) {
			let ifound = arMeister.findIndex((meister) => meister.mitgliedid == element.mitgliedid);
			if (ifound > -1)
				arMeister[ifound].babeli! += Number(element.punkte);
		}

		if (allMitgliedId.length > 0) {
			// Informationen aus Adresse lesen
			const alAdressen = await Adressen.findAll({
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
					arMeister[ifound] = meister
				} else {
					console.error('kegelmeister/calcmeister: Beim Abfüllen der Mitglieddaten ist ein Fehler aufgetreten');
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
			else if (e1.punkte == e2.punkte && e1.anlaesse == e2.anlaesse && e1.babeli! > e2.babeli!)
				order = -1
			else if (e1.punkte == e2.punkte && e1.anlaesse == e2.anlaesse && e1.babeli! == e2.babeli!)
				order = 0
			else order = 1

			return order
		});

		// bestehende Daten löschen
		await Kegelmeister.destroy({
			where: { "jahr": jahr }
		})

		// insert und Rang setzten
		const arRetMeister: Kegelmeister[] = [];
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
							"babeli",
							"status"]
					}));
			}

		}

		return arRetMeister;
	}

}
