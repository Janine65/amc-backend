const { Adressen } = require("../db");
const { Op, Sequelize } = require("sequelize");

module.exports = {
	getData: function (req, res, next) {		
		Adressen.findAll({ where: { 			
			austritt: { [Op.gte]: new Date() }
			 },
			order:[['name', 'asc'],['vorname', 'asc']]})
		.then(data => res.json(data))
		.catch(e => next(e));		
	},

	getOverviewData: async function (req, res, next) {
		// get a json file with the following information to display on first page:
		// count of active adressen
		// count of SAM_Mitglieder
		// count of not SAM_Mitglieder
		
		let arResult = [{label: 'Aktive Mitglieder', value: 0},{label: 'SAM Mitglieder', value: 0},{label: 'Freimitglieder', value: 0}];

		let anzahl = await Adressen.count({
			where: {"austritt": { [Op.gt]: Sequelize.fn('NOW') } }
		});
		arResult[0].value = anzahl;

		anzahl = await Adressen.count({
			where: [{"austritt": { [Op.gt]: Sequelize.fn('NOW') } }, 
				{"sam_mitglied": true}]
		});
		arResult[1].value = anzahl;

		anzahl = await Adressen.count({
			where: [{"austritt": {[Op.gt]: Sequelize.fn('NOW')}}, 
			{"sam_mitglied": false}]
		});
		arResult[2].value = anzahl;

		res.json(arResult);
	},

	getOneData: function (req, res, next) {
		Adressen.findByPk(req.query.id)
			.then(data => res.json(data))
			.catch(e => next(e));
	},

	getFKData: function(req, res, next) {
		Adressen.findAll({ 
			attributes: ["id", ["fullname", "value"]],
			where: [
				{"austritt": { [Op.gte]: new Date() } },
				Sequelize.where(Sequelize.fn('LOWER', Sequelize.col("fullname")), {[Op.substring]: (req.query.filter != null ? req.query.filter.value : '')})],
			order: ["fullname"]
			 })
		.then(data => res.json(data))
		.catch(e => next(e));		
	},

	removeData: function (req, res, next) {
		const data = JSON.parse(req.body);
		console.info('delete: ',data);
		let endDate = new Date();
		endDate.setMonth(11);
		endDate.setDate(31);
		Adressen.findByPk(data.id)
		.then((adresse) => {
			adresse.austritt = endDate;
			adresse.update({austritt: endDate})
			.then((obj) => res.json(obj))
			.catch(e => next(e))
			})
		.catch(e => next(e));
	},

	addData: function (req, res, next) {
		let data = JSON.parse(req.body);
		data.id = null;
		if (data.austritt == "" || data.austritt == null) {
			data.austritt = "3000-01-01T00:00:00";
		}
		if (data.eintritt == "" || data.eintritt == null) {
			data.eintritt = new Date().toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});
		}
		console.info('insert: ',data);
		Adressen.create(data)
			.then((obj) => res.json(obj))
			.catch(e => next(e));
	},
	
	updateData: function (req, res, next) {
		let data = JSON.parse(req.body);
		if (data.austritt == "" || data.austritt == null) {
			data.austritt = "3000-01-01T00:00:00";
		}
		if (data.eintritt == "" || data.eintritt == null) {
			data.eintritt = new Date().toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'});
		}
		if (data.mnr == undefined || data.mnr == "") {
			// insert
			data.id = null;
			console.info('insert: ',data);
			Adressen.create(data)
			.then((obj) => res.json(obj))
			.catch(e => next(e))
		} else {
			// update
			console.info('update: ',data);
		
			Adressen.findByPk(data.id)
			.then((adresse) => adresse.update(data)
				.then((obj) => res.json(obj))
				.catch(e => next(e)))
			.catch(e => next(e));
		}
	},

};