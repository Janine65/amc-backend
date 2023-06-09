const { Sequelize } = require("sequelize");
let db = require("../db");
const { Budget, Account } = require("../db")

module.exports = {
	getData: function (req, res, next) {
		Budget.findAll({
			where: { 'year': req.query.jahr },
			include: [
				{ model: Account, as: 'acc', required: true, attributes: ["id", "level", "order", "name", "status"] }
			],
			order: [["acc","order","asc"]]
		})
		.then(data => {
			res.json(data);
		})
		.catch((e) => next(e.parent));
	},

	getOneData: function (req, res, next) {
		Budget.findByPk(req.param.id)
			.then(data => res.json(data))
			.catch((e) => next(e.parent));
	},

	removeData: function (req, res, next) {
		const data = JSON.parse(req.body);
		console.info('delete: ', data);
		Budget.findByPk(data.id)
			.then((budget) =>
				budget.destroy()
					.then((obj) => res.json({ id: obj.id }))
					.catch((e) => next(e.parent)))
			.catch((e) => next(e.parent));
	},

	addData: async function (req, res, next) {
		let data = JSON.parse(req.body);
		data.id = null;
		console.info('insert: ', data);

		Budget.create(data)
			.then((obj) => res.json(obj))
			.catch((e) => next(e.parent));
			
	},

	updateData: function (req, res, next) {
		let data = JSON.parse(req.body);
		console.info('update: ', data);

		Budget.findByPk(data.id)
			.then((budget) => budget.update(data)
				.then((obj) => res.json(obj))
				.catch((e) => next(e.parent)))
			.catch((e) => next(e.parent));
	},

	copyYear: async function (req, res, next) {
		const yearFrom = req.query.from
		const yearTo = req.query.to

		await Budget.destroy({where: {year: yearTo}})
		const sqlquery = 'INSERT INTO "budget" ("year", "account", "amount", "memo") SELECT ?, account, amount, memo from "budget" where "year" = ?'
		const result = await global.sequelize.query(sqlquery,
			{
				replacements: [yearTo,yearFrom],
				type: Sequelize.QueryTypes.INSERT,
				plain: false,
				logging: console.debug,
				raw: false
			}
		)
		res.json(result)
	}

};