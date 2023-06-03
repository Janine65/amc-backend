const { Sequelize } = require("sequelize");
let db = require("../db");
const { Budget, Account } = require("../db")

module.exports = {
	getData: function (req, res) {
		Budget.findAll({
			where: { 'year': req.query.jahr },
			include: [
				{ model: Account, as: 'acc', required: true, attributes: ["id", "level", "order", "name", "status"] }
			]
		})
		.then(data => {
			res.json(data);
		})
		.catch((e) => console.error(e));
	},

	getOneData: function (req, res) {
		Budget.findByPk(req.param.id)
			.then(data => res.json(data))
			.catch((e) => console.error(e));
	},

	removeData: function (req, res) {
		const data = JSON.parse(req.body);
		console.info('delete: ', data);
		Budget.findByPk(data.id)
			.then((budget) =>
				budget.destroy()
					.then((obj) => res.json({ id: obj.id }))
					.catch((e) => console.error(e)))
			.catch((e) => console.error(e));
	},

	addData: async function (req, res) {
		let data = JSON.parse(req.body);
		data.id = null;
		console.info('insert: ', data);

		Budget.create(data)
			.then((obj) => res.json(obj))
			.catch((e) => console.error(e));
			
	},

	updateData: function (req, res) {
		let data = JSON.parse(req.body);
		console.info('update: ', data);

		Budget.findByPk(data.id)
			.then((budget) => budget.update(data)
				.then((obj) => res.json(obj))
				.catch((e) => console.error(e)))
			.catch((e) => console.error(e));
	},

	copyYear: async function (req, res) {
		const yearFrom = req.query.from
		const yearTo = req.query.to

		await Budget.destroy({where: {year: yearTo}})
		const sqlquery = 'INSERT INTO "budget" ("year", "account", "amount", "memo") SELECT ' + yearTo + ', account, amount, memo from "budget" where "year" = ?'
		const result = await global.sequelize.query(sqlquery,
			{
				replacements: [yearFrom],
				type: Sequelize.QueryTypes.INSERT,
				plain: false,
				logging: console.debug,
				raw: false
			}
		)
		res.json(result)
	}

};