let { Meisterschaft, Adressen, Anlaesse, Clubmeister, Kegelmeister } = require("../db");
const { Op, Sequelize } = require("sequelize");

module.exports = {
	getData: function (req, res, next) {

		Meisterschaft.findAll({
			where: { eventid: { [Op.eq]: req.query.eventid } },
			include: [
				{ model: Adressen, as: 'teilnehmer', required: true, attributes: ['id', 'fullname'] }
			],
			order: [
				['teilnehmer', 'fullname', 'asc']
			]
		}).then(data => res.json(data));
	},

	getOneData: function (req, res, next) {
		Meisterschaft.findOne({
			where: { id: { [Op.eq]: req.query.id } },
			include: [
				{ model: Adressen, as: 'teilnehmer', required: true, attributes: ['id', 'fullname'] }
			]
		}).then(data => res.json(data));
	},

	getMitgliedData: async function (req, res, next) {
		if (req.query.type == 1) {
		Meisterschaft.findAll({
			attributes: ["id", "punkte", ["total_kegel", "total_kegeln"], "streichresultat"],
			where: { "mitgliedid": req.query.id },
			include: {
				model: Anlaesse, as: "linkedEvent",
				where: Sequelize.where(Sequelize.fn('year', Sequelize.col("datum")), { [Op.lte]: global.Parameter.get("CLUBJAHR") }),
				attributes: [[Sequelize.fn('year', Sequelize.col("datum")), "jahr"], "datum", "name"],
			},
			order: [["linkedEvent","datum","DESC"]],
			raw: true, nest: true
		})
			.then(data => {
				// console.log(data);
				for (let ind = 0; ind < data.length; ind++) {
					data[ind].jahr = data[ind].linkedEvent.jahr;
					data[ind].datum = data[ind].linkedEvent.datum;
					data[ind].name = data[ind].linkedEvent.name;
				}
				// console.log(data);
				res.json(data)
			})
			.catch(error => next(error));
		}
	else {
		const lstClubFirst = await Clubmeister.findAll({
			where: {"rang": 1},
			order: [["jahr", "desc"]]
		})

		const lstKegelFirst = await Kegelmeister.findAll({
			where: {"rang": 1},
			order: [["jahr", "desc"]]
		})

		Clubmeister.findAll({
			where: { "mitgliedid": req.query.id},
			attributes: ["jahr", "rang", "punkte", "anlaesse", "werbungen", "mitglieddauer", "status"],
			order: [["jahr", "desc"]]
		})
		.then(club => {
			Kegelmeister.findAll({
				where: { "mitgliedid": req.query.id},
				attributes: ["jahr", "rang", "punkte", "anlaesse", "babeli", "status"],
				order: [["jahr", "desc"]]
			})
			.then(kegel => {
				const ldata = []
				let data = {}
				for (let index = 0; index < club.length; index++) {
					const crec = club[index];
					const ikrec = kegel.findIndex(k => k.jahr == crec.jahr)
					if (ikrec >= 0) {
						data = copyData(crec, kegel[ikrec])
						kegel.splice(ikrec, 1);
					} else {
						data = copyData(crec, undefined)
					}
					const cfirst = lstClubFirst.find(rec => rec.jahr == crec.jahr);
					if (cfirst) {
						data.diffErsterC = cfirst.punkte - data.punkteC					
					}
					const kfirst = lstKegelFirst.find(rec => rec.jahr == data.jahr)
					if (kfirst && data.punkteK > 0) {
						data.diffErsterK = kfirst.punkte - data.punkteK					
					}
					ldata.push(data);
				}
				for (let index = 0; index < kegel.length; index++) {
					const krec = kegel[index];
					data = copyData(undefined, krec)
					const kfirst = lstKegelFirst.find(rec => rec.jahr == data.jahr)
					if (kfirst && data.punkteK > 0) {
						data.diffErsterK = kfirst.punkte - data.punkteK					
					}
					ldata.push(data);
				}
				res.json(ldata);
			})
	
		})
	}
	},

	getChartData: function (req, res, next) {

		Anlaesse.findAll({
			attributes: ["datum", "name", "gaeste", "anlaesseid"],
			where: [{"nachkegeln": false},
				Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("datum")), req.query.jahr)],
			include: {model: Meisterschaft, 
				attributes: [[Sequelize.fn('COUNT', Sequelize.col("mitgliedid")), "teilnehmer"]]},
		group: ["datum", "name", "gaeste", "anlaesseid"],
		raw: true, nest: true
		})
		.then(data => {
			// console.log(data);   
			let arAnlaesse = [];
			for (let index = 0; index < data.length; index++) {
				arAnlaesse.push(data[index].anlaesseid);
			}
			if (req.query.vorjahr == 'true') {
				Anlaesse.findAll({
					attributes: ["gaeste"],
					where: {"id": {[Op.in]: arAnlaesse}},
					include: 
						{model: Meisterschaft, 
							attributes: ["eventid", [Sequelize.fn('COUNT', Sequelize.col("mitgliedid")), "teilnehmer"]]},
					group: ["eventid","gaeste"],
					raw: true, nest: true
				})
				.then(data2 => {
					for (let index = 0; index < data.length; index++) {
						data[index].aktjahr = Number(data[index].meisterschafts.teilnehmer) + Number(data[index].gaeste);
						let ind = data2.findIndex((element) => element.meisterschafts.eventid == data[index].anlaesseid);
						if (ind >= 0) {
							data[index].vorjahr = Number(data2[ind].meisterschafts.teilnehmer) + Number(data2[ind].gaeste);
						} else {
							data[index].vorjahr = 0;
						}
						
					}
					res.json(data);
				})
				.catch(err2 => next(err2));
			} else {
				res.json(data);
			}
		})
		.catch(err => next(err));


	},

	checkJahr: function (req, res, next) {
		Meisterschaft.count({
			where: {"streichresultat": true},
			include: {model: Anlaesse, as: "linkedEvent", 
				attributes: [],
				where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("datum")), req.query.jahr)}
		})
		.then(data => res.json({AnzStreich: data}))
		.catch(err => next(err));
	},

	removeData: function (req, res, next) {
		const data = JSON.parse(req.body);
		if (data == undefined) {
			throw Error("Record not correct");
		}
		console.info('delete: ', data);
		Meisterschaft.findByPk(data.id)
			.then((eintrag) => eintrag.destroy()
				.then((obj) => res.json({ id: obj.id }))
				.catch(e => next(e)))
			.catch(e => next(e));
	},

	addData: function (req, res, next) {
		let data = JSON.parse(req.body);
		data.id = null;
		console.info('insert: ', data);
		Meisterschaft.create(data)
			.then((obj) => res.json(obj.id))
			.catch(e => next(e));
	},

	updateData: function (req, res, next) {
		let data = JSON.parse(req.body);
		// update

		if (data.id && data.id > 0) {
			data.total_kegel = undefined; 
			console.info('update: ', data);
			Meisterschaft.findByPk(data.id)
			.then((eintrag) => eintrag.update(data)
				.then((obj) => res.json(obj))
				.catch(e => next(e)))
			.catch(e => next(e));

		} else {
			data.id = null;
			data.total_kegel = undefined; 
			console.info('insert: ', data);
			Meisterschaft.create(data)
				.then((obj) => res.json(obj.id))
				.catch(e => next(e));
			}
	},

};

function copyData(club = undefined, kegel = undefined) {
	let data = {
		jahr: 0, 
		rangC: undefined,
		punkteC: undefined,
		anlaesseC: undefined,
		werbungenC: undefined,
		mitglieddauerC: undefined,
		statusC: undefined,
		rangK: undefined,
		punkteK: undefined,
		anlaesseK: undefined,
		babeliK: undefined,
		statusK: undefined,
		diffErsterK: undefined
	}

	if (club) {
		data.jahr = club.jahr
		data.rangC = club.rang
		data.punkteC = club.punkte
		data.anlaesseC = club.anlaesse
		data.mitglieddauerC = club.mitglieddauer
		data.werbungenC = club.werbungen
		data.statusC = club.status
	}

	if (kegel) {
		data.jahr = kegel.jahr
		data.rangK = kegel.rang
		data.punkteK = kegel.punkte
		data.anlaesseK = kegel.anlaesse
		data.babeliK = kegel.babeli
		data.statusK = kegel.status
	}

	return data
}