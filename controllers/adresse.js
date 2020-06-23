var db = require("../db");
const { Op, Sequelize } = require("sequelize");

module.exports = {
	getData: function (req, res) {		
		db.Adressen.findAll({ where: { 			
			austritt: { [Op.gte]: new Date() }
			 }}).then(data => res.json(data));		
	},

	getOneData: function (req, res) {
		db.Adressen.findByPk(req.param.id).then(data => res.json(data));
	},

	getFKData: function(req, res) {
		var qrySelect = "SELECT `id`, `fullname` as value FROM `adressen` WHERE `austritt` > NOW()" ;
		if (req.query.filter != null) {
			var qfield = '%' + req.query.filter.value + '%';
			qrySelect = qrySelect + " AND lower(`fullname`) like '" + qfield + "'";
		}
		qrySelect = qrySelect + " ORDER BY 2";
		
		sequelize.query(qrySelect, 
			{ 
				type: Sequelize.QueryTypes.SELECT,
				plain: false,
				logging: console.log,
				raw: false
			}
		).then(data => res.json(data));					
		},

	removeData: function (req, res) {
		const data = req.body;
		console.info('delete: ',data);
		let endDate = new Date();
		endDate.setMonth(11);
		endDate.setDate(31);
		db.Adressen.findByPk(req.params.id)
		.then((adresse) =>
			//adresse.destroy()
			adresse.update({austritt: endDate}))
		.then(() =>
			res.json({}));
},

	addData: function (req, res) {
		var data = req.body;
		if (data.austritt == "" || data.austritt == null) {
			data.austritt = "3000-01-01T00:00:00";
		}
		if (data.eintritt == "" || data.eintritt == null) {
			data.eintritt = new Date().toISOString();
		}
		console.info('insert: ',data);
		//data.id = db.Adressen.increment('id');
		//console.info('insert2: ',data);
		db.Adressen.create(data).then((obj) =>
			res.json({ id: obj.id }));
	},
	
	updateData: function (req, res) {
		var data = req.body;
		if (data.austritt == "" || data.austritt == null) {
			data.austritt = "3000-01-01T00:00:00";
		}
		console.info('update: ',res, req);
		
		db.Adressen.findByPk(req.params.id)
			.then((adresse) => {
				console.info('update - adresse: ',adresse);				
				if (adresse.update(data))
					res.json({});
		});
	},

};