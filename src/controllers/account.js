let {Journal, Account, Budget} = require("../db");
const { Op, Sequelize } = require("sequelize");

module.exports = {
	getAllData: async function (req, res, next) {
		const arAccount = await Account.findAll(
			{
				where: { "order": { [Op.gt]: 10 } },
				order: [["level", "ASC"], ["order", "ASC"]]
			}).catch(e => next(e));
		res.json(arAccount);
	},

	getData: async function (req, res, next) {
		let arJournalIds = [];

		let arfromAcc = await global.sequelize.query("SELECT DISTINCT from_account FROM journal WHERE year(date) = ?",
			{
				replacements: [req.query.jahr],
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		)
			.catch(e => next(e));

		for (let index = 0; index < arfromAcc.length; index++) {
			const element = arfromAcc[index];
			arJournalIds.push(element.from_account);
		}

		arfromAcc = await global.sequelize.query("SELECT DISTINCT to_account FROM journal WHERE year(date) = ?",
			{
				replacements: [req.query.jahr],
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				
				raw: false
			}
		).catch(e => next(e));
		for (let index = 0; index < arfromAcc.length; index++) {
			const element = arfromAcc[index];
			arJournalIds.push(element.to_account);
		}

		let arAccount = [];

		if (req.query.all == 0) {
			arAccount = await Account.findAll(
				{
					where: {
						[Op.and]: [
							{ "order": { [Op.gt]: 10 } },
							{ "status": 1 },
							{ "id": { [Op.in]: arJournalIds } }
						]
					},
					order: [["level", "ASC"], ["order", "ASC"]]
				}).catch(e => next(e));
		} else {
			arAccount = await Account.findAll(
				{
					where: { "order": { [Op.gt]: 10 } },
					order: [["level", "ASC"], ["order", "ASC"]]
				}).catch(e => next(e));
		}
		res.json(arAccount);
	},

	getOneData: function (req, res, next) {
		Account.findByPk(req.param.id)
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	getOneDataByOrder: function (req, res, next) {
		Account.findOne({ where: { "order": req.query.order } })
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	getAmountOneAcc: function (req, res, next) {
		let amount = 0
		let date = new Date(req.query.datum)
		Account.findOne({ where: { "order": req.query.order } })
			.then(data => {
				Journal.findAll({
					attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],					
					where: [{ "date": { [Op.lt]: date } },
							Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), date.getFullYear())],
					include: [
						{
							model: Account, as: 'fromAccount', required: true,
							attributes: ["id"],
							where: { "id": data.id }
						}],
					group: ["fromAccount.id"],
				})
				.then(from => {
					if (from.length == 1)
						amount = from[0].amount
					Journal.findAll({
						attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],
						where: [{ "date": { [Op.lt]: date } },
						Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), date.getFullYear())],
						include: [
							{
								model: Account, as: 'toAccount', required: true,
								attributes: ["id"],
								where: { "id": data.id }
							}],
						group: ["toAccount.id"],
					})
					.then(to => {
						if (to.length == 1)
							amount -= to[0].amount
						res.json({amount: amount, id: data.id})
					})	
					.catch(e => next(e))
				})
				.catch(e => next(e))
				
			})
			.catch(e => next(e))
	},

	getFKData: function (req, res, next) {
		Account.findAll({
			attributes: ["id", [Sequelize.fn('CONCAT', Sequelize.col("name"), ' ', Sequelize.col("order")), "name"]],
			where: [
				Sequelize.where(Sequelize.fn('LOWER', Sequelize.col("name")), { [Op.substring]: (req.query.filter != null ? req.query.filter.value : '') }),
				{ "order": { [Op.ne]: Sequelize.col("level") } },
				{ "status": 1 }
			],
			order: [["level", "ASC"], ["order", "ASC"]]
		})
			.then(function (data) {
				let arReturn = [];
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					arReturn.push({ id: element.id, value: '<span class=\"small\">' + element.name + '</span>' });
				}
				res.json(arReturn);
			})
			.catch(e => next(e));
	},

	addData: function (req, res, next) {
		let data = JSON.parse(req.body);
		data.id = null;
		console.info('insert: ', data);
		Account.create(data)
			.then(obj => res.json(obj))
			.catch((e => next(e)))
	},

	updateData: function (req, res, next) {
		let data = JSON.parse(req.body);
		console.info('update: ', data);

		Account.findByPk(data.id)
			.then((account) => account.update(data)
				.then((obj) => res.json(obj))
				.catch(e => next(e)))
			.catch(e => next(e));
	},

	removeData: function (req, res, next) {
		let data = JSON.parse(req.body);
		console.info('delete: ', data);

		Account.findByPk(data.id)
			.then((account) => account.destroy()
				.then((obj) => res.json())
				.catch(e => next(e)))
			.catch(e => next(e));
	},

	getAccountSummary: async function (req, res, next) {
		let arData = [];
		let arBudget = await Budget.findAll({
			attributes: ["amount"],
			where: { 'year': req.query.jahr },
			include: [
				{ model: Account, as: 'acc', required: true, attributes: ["id", "level", "order", "name", "status"] }
			]
		})
			.catch(e => next(e));

		Journal.findAll({
			attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],
			where: Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), req.query.jahr),
			include: [
				{
					model: Account, as: 'fromAccount', required: true,
					attributes: ["id", "level", "order", "name", "status"]
				}],
			group: ["fromAccount.id", "fromAccount.level", "fromAccount.order", "fromAccount.name", "fromAccount.status"],
			order: [["fromAccount", "level", "ASC"], ["fromAccount", "order", "ASC"]]
		})
			.then(function (data) {

				Journal.findAll({
					attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],
					where: Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), req.query.jahr),
					include: [
						{ model: Account, as: 'toAccount', required: true, attributes: ["id", "level", "order", "name", "status"] }],
					group: ["toAccount.id", "toAccount.level", "toAccount.order", "toAccount.name", "toAccount.status"],
					order: [["toAccount", "level", "ASC"], ["toAccount", "order", "ASC"]]
				})
					.then(function (data2) {
						for (let ind2 = 0; ind2 < data.length; ind2++) {
							let record = {}
							record.id = data[ind2].fromAccount.id
							record.name = data[ind2].fromAccount.name
							record.level = data[ind2].fromAccount.level
							record.order = data[ind2].fromAccount.order
							record.status = data[ind2].fromAccount.status
							record.budget = 0
							record.diff = 0
							record.$css = (data[ind2].fromAccount.status ? "active" : "inactive")
							let found = data2.findIndex(acc => acc.toAccount.id == data[ind2].fromAccount.id);
							if (found >= 0) {
								const acc2 = data2[found];
								switch (data[ind2].fromAccount.level) {
									case 1:
									case 4:
										record.amount = eval(data[ind2].amount - acc2.amount);
										break;
									case 2:
									case 6:
										record.amount = eval(acc2.amount - data[ind2].amount);
										break;
								}
								data2.splice(found, 1);
							} else {
								switch (data[ind2].fromAccount.level) {
									case 1:
									case 4:
										record.amount = eval(data[ind2].amount * 1);
										break;
									case 2:
									case 6:
										record.amount = eval(data[ind2].amount * -1);
										break;
								}
							}
							arData.push(record);
						}
						for (let ind2 = 0; ind2 < data2.length; ind2++) {
							let record = {}
							record.id = data2[ind2].toAccount.id
							record.name = data2[ind2].toAccount.name
							record.level = data2[ind2].toAccount.level
							record.order = data2[ind2].toAccount.order
							record.status = data2[ind2].toAccount.status
							record.budget = 0
							record.diff = 0
							record.$css = (data2[ind2].toAccount.status ? "active" : "inactive")
							switch (data2[ind2].toAccount.level) {
								case 1:
								case 4:
									record.amount = eval(data2[ind2].amount * -1);
									break;
								case 2:
								case 6:
									record.amount = eval(data2[ind2].amount * 1);
									break;
							}
							arData.push(record);
						}

						for (let ind2 = 0; ind2 < arData.length; ind2++) {
							let found = arBudget.findIndex(element => element.acc.id == arData[ind2].id);
							let record = arData[ind2];
							if (found >= 0) {
								const acc = arBudget[found];
								record.budget = eval(acc.amount * 1);
								arBudget.splice(found, 1);
							}
							switch (record.level) {
								case 4:
									record.diff = record.budget - record.amount;
									break;
								case 6:
									record.diff = record.amount - record.budget;
									break;
							}									
						}

						for (let ind2 = 0; ind2 < arBudget.length; ind2++) {
							let record = {};
							record.id = arBudget[ind2].acc.id
							record.name = arBudget[ind2].acc.name
							record.level = arBudget[ind2].acc.level
							record.order = arBudget[ind2].acc.order
							record.status = arBudget[ind2].acc.status
							record.$css = (record.status ? "active" : "inactive")

							record.amount = 0;
							record.budget = eval(arBudget[ind2].amount * 1)
							switch (record.level) {
								case 4:
									record.diff = record.budget - record.amount;
									break;
								case 6:
									record.diff = record.amount - record.budget;
									break;
							}									
							arData.push(record);
						}

						// Jetzt alle Datanesätze von inaktiven Konton ohne Betrag entfernen
						const arFiltered = arData.filter(rec => rec.status === 1 || rec.amount !== 0 || rec.budget !== 0)

						arFiltered.sort((a, b) => {
							if (a.level < b.level)
								return -1
							if (a.level == b.level && a.order <= b.order)
								return -1
							return 1
						});
						console.log(arFiltered);
						res.json(arFiltered);
					})
					.catch(e => next(e));
			})
			.catch(e => next(e));
	},

};