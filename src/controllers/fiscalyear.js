const { Op, Sequelize } = require("sequelize");
const { FiscalYear, Journal } = require("../db");
const fs = require('fs');

module.exports = {
	getData: function (req, res, next) {
		FiscalYear.findAll({ order: [['year', 'desc']] })
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	getOneData: function (req, res, next) {
		FiscalYear.findOne({
			where: {
				year: req.query.jahr
			}
		})
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	getFKData: function (req, res, next) {
		FiscalYear.findAll({
			attributes: [["year", "id"],
			[Sequelize.fn("CONCAT", Sequelize.col("name"), " - ", Sequelize.literal("(CASE \"state\" WHEN 1 THEN 'offen' WHEN 2 THEN 'prov. abgeschlossen' ELSE 'abgeschlossen' END)")), 'value'],
			[Sequelize.literal("(CASE \"state\" WHEN 1 THEN 'offen' WHEN 2 THEN 'prov-closed' ELSE 'closed' END)"), '$css']],
			where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col("name")), { [Op.substring]: (req.query.filter != null ? req.query.filter.value : '') }),
			order: ["year"]
		})
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	removeData: function (req, res, next) {
		const data = JSON.parse(req.body);
		console.info('delete: ', data);
		FiscalYear.findOne({ where: { year: data.year } })
			.then((fiscalyear) =>
				fiscalyear.destroy()
					.then((obj) => res.json())
					.catch((e) => next(e)))
			.catch((e) => next(e));
	},

	addData: function (req, res, next) {
		let data = JSON.parse(req.body);
		data.id = null;
		console.info('insert: ', data);
		FiscalYear.create(data)
			.then((obj) => {
				res.json({ id: obj.id })
			})
			.catch(e => next(e));
	},

	updateData: function (req, res, next) {
		let data = JSON.parse(req.body);
		console.info('update: ', data);

		FiscalYear.findOne(
			{ where: { year: data.year } }
		)
			.then((fiscalyear) => fiscalyear.update(data)
				.then((obj) => res.json(obj))
				.catch(e => next(e)))
			.catch(e => next(e));
	},

	closeYear: async function (req, res, next) {
		let sJahr = req.query.jahr;
		let sNextJahr = parseInt(sJahr) + 1;
		let iStatus = req.query.status;
		/**
		 * Ein Geschäftsjahr wird geschlossen (provisorisch oder definitiv)
		 * 1. Neues Fiscalyear eröffnen - sofern nicht schon eröffnet
		 * 2. Gewinn / Verlust berechnen
		 * 3. Eröffnungsbuchungen erfassen
		 * 4. im Journal die Nummerierung vornehmen
		 * 5. Status vom alten Fiscalyear setzen
		 */

		// Journal - Bilanz Summen lesen
		// Aktive
		let qrySelect = "SELECT j.from_account as account, SUM(j.amount) AS amount";
		qrySelect += " FROM journal j WHERE YEAR(j.date) = " + sJahr;
		qrySelect += " and j.from_account in (select id from account where level = 1)";
		qrySelect += " GROUP BY j.from_account";
		let arAktiv = await global.sequelize.query(qrySelect,
			{
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		)
			.catch(err => {
				console.error(err);
				res.json({
					type: "error",
					message: err
				});
			});

		qrySelect = "SELECT j.to_account as account, SUM(j.amount) AS amount";
		qrySelect += " FROM journal j WHERE YEAR(j.date) = " + sJahr;
		qrySelect += " and j.to_account in (select id from account where level = 1)";
		qrySelect += " GROUP BY j.to_account";
		let arAktiv2 = await global.sequelize.query(qrySelect,
			{
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		)
			.catch(err => {
				console.error(err);
				res.json({
					type: "error",
					message: err
				});
			});
		for (let ind2 = 0; ind2 < arAktiv2.length; ind2++) {
			const record = arAktiv2[ind2];
			let found = arAktiv.findIndex(acc => acc.account == record.account);
			if (found > -1) {
				arAktiv[found].amount = arAktiv[found].amount - record.amount;
			} else {
				arAktiv.push(record);
			}
		}

		// Passive
		qrySelect = "SELECT j.from_account as account, SUM(j.amount) AS amount";
		qrySelect += " FROM journal j WHERE YEAR(j.date) = " + sJahr;
		qrySelect += " and j.from_account in (select id from account where level = 2)";
		qrySelect += " GROUP BY j.from_account";
		let arPassiv = await global.sequelize.query(qrySelect,
			{
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		)
			.catch(err => {
				console.error(err);
				res.json({
					type: "error",
					message: err
				});
			});

		qrySelect = "SELECT j.to_account as account, SUM(j.amount) AS amount";
		qrySelect += " FROM journal j WHERE YEAR(j.date) = " + sJahr;
		qrySelect += " and j.to_account in (select id from account where level = 2)";
		qrySelect += " GROUP BY j.to_account";
		let arPassiv2 = await global.sequelize.query(qrySelect,
			{
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		)
			.catch(err => {
				console.error(err);
				res.json({
					type: "error",
					message: err
				});
			});
		for (let ind2 = 0; ind2 < arPassiv2.length; ind2++) {
			const record = arPassiv2[ind2];
			let found = arPassiv.findIndex(acc => acc.account == record.account);
			if (found > -1) {
				arPassiv[found].amount = record.amount - arPassiv[found].amount;
			} else {
				arPassiv.push(record);
			}
		}

		let arEroeffnung = [];
		let iGewinn = 0.0;
		let journalno = 1;

		for (let ind2 = 0; ind2 < arAktiv.length; ind2++) {
			const entry = arAktiv[ind2];
			if (entry.account != 39)
				arEroeffnung.push({ journalno: journalno++, date: new Date('01.01.' + sNextJahr), from_account: entry.account, to_account: 39, amount: entry.amount, memo: "Kontoeröffnung (Saldovortrag)" })
			iGewinn += parseFloat(entry.amount);
		}
		for (let ind2 = 0; ind2 < arPassiv.length; ind2++) {
			const entry = arPassiv[ind2];
			if (entry.account != 39)
				arEroeffnung.push({ journalno: journalno++, date: new Date('01.01.' + sNextJahr), from_account: 39, to_account: entry.account, amount: entry.amount, memo: "Kontoeröffnung (Saldovortrag)" })
			iGewinn -= parseFloat(entry.amount);
		}

		// Fiscalyear erfassen
		let newFiscalyear = await FiscalYear.findOne(
			{ where: { year: sNextJahr } })
			.catch(err => {
				console.error(err);
				res.json({
					type: "error",
					message: err
				});
			});
		if (!newFiscalyear) {
			// neues Buchhaltungsjahr erstellen
			newFiscalyear = { year: sNextJahr, name: "AMC-Buchhaltung " + sNextJahr, state: 1 };

			await FiscalYear.create(newFiscalyear)
				.then((obj) => newFiscalyear.id = obj.id)
				.catch(err => {
					console.error(err);
					res.json({
						type: "error",
						message: err
					});
				});
			// ordner für Belege erstellen
			const pathname = global.documents;
			try {
				fs.mkdirSync(pathname + sNextJahr);
				fs.mkdirSync(pathname + sNextJahr + "/receipt");
			} catch (error) {
				console.log(error)
			}

			// Budgetzahlen übertragen vom Vorjahr
			qrySelect = "INSERT INTO budget (account, year, amount) " +
				"SELECT account.id, " + sNextJahr + ", 0 FROM account WHERE account.status = 1 AND account.level in (4,6) and account.order > 3999";
			await global.sequelize.query(qrySelect,
				{
					type: Sequelize.QueryTypes.INSERT,
					plain: false,
					
					raw: false
				}
			)
				.catch(err => {
					console.error(err);
					res.json({
						type: "error",
						message: err
					});
				});

			qrySelect = "UPDATE budget ba " +
				"SET amount = bb.amount " +
				"FROM budget bb " +
				"WHERE bb.year = " + sJahr +
				" AND bb.account = ba.account " +
				"AND ba.year = " + sNextJahr;
			await global.sequelize.query(qrySelect,
				{
					type: Sequelize.QueryTypes.INSERT,
					plain: false,
					
					raw: false
				}
			)
				.catch(err => {
					console.error(err);
					res.json({
						type: "error",
						message: err
					});
				});

		} else {
			// lösche alle Eröffnungsbuchungen
			qrySelect = "DELETE FROM journal where year(date) = " + sNextJahr;
			qrySelect += " and (from_account = 39 or to_account = 39)";
			await global.sequelize.query(qrySelect,
				{
					type: Sequelize.QueryTypes.DELETE,
					plain: false,
					
					raw: false
				}
			)
				.catch(err => {
					console.error(err);
					res.json({
						type: "error",
						message: err
					});
				});
		}

		// Eröffnungsbuchungen erstellen
		await Journal.bulkCreate(arEroeffnung
			, { fields: ["journalno", "date", "from_account", "to_account", "amount", "memo"] })
			.catch(err => {
				console.error(err)
				res.json({
					type: "error",
					message: err
				});
			});

		// Status vom Buchungsjahr ändern
		qrySelect = "UPDATE fiscalyear set state = " + iStatus;
		qrySelect += " WHERE year = " + sJahr;
		await global.sequelize.query(qrySelect,
			{
				type: Sequelize.QueryTypes.UPDATE,
				plain: false,
				
				raw: false
			}
		).catch((err) => {
			next(err);
		});

		res.json({
			type: "info",
			message: "AMC-Buchhaltung " + sJahr + " wurde erfolgreich beendet mit Gewinn/Verlust " + iGewinn,
			gewinn: iGewinn
		});

	},
};