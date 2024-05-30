const { Journal, Account, Receipt, JournalReceipt, Kegelkasse, Meisterschaft, Anlaesse, User } = require("../db");
const { Op, Sequelize, QueryInterface } = require("sequelize");
const ExcelJS = require("exceljs");
const fs = require("fs");
const { error } = require("console");


async function getData(req, res, next) {
	Journal.findAll(
		{
			attributes: [
				'id', 'date', 'memo', 'journalno', 'amount', 'status',
				[Sequelize.fn("COUNT", Sequelize.col("journal2receipt.receiptid")), "receipts"]
			],
			where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), req.query.jahr),
			include: [
				{ model: Account, as: 'fromAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
				{ model: Account, as: 'toAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
				{ model: JournalReceipt, as: 'journal2receipt', required: false, attributes: [] }
			],
			group: ['journal.id', 'journal.date', 'journal.memo', 'journal.journalno',
				'journal.amount', 'journal.status',
				'fromAccount.id', 'fromAccount.order', 'fromAccount.name', 'fromAccount.longname',
				'toAccount.id', 'toAccount.order', 'toAccount.name', 'toAccount.longname'
			],
			order: [
				['journalno', 'asc'],
				['date', 'asc'],
				['from_account', 'asc'],
			]
		}
	)
		.then(data => {
			res.json(data);
		})
		.catch(e => next(e));
}

async function getAllAttachment(req, res, next) {
	if (req.query.journalid != null) {
		Receipt.findAll(
			{
				logging: console.debug,
				where: {
					[Op.and]: [
						{ jahr: req.query.jahr },
						Sequelize.literal("receipt.id not in (select receiptid from journal_receipt where journalid = " + req.query.journalid + ")")
					]
				},
				attributes: {
					include: [
						[
							Sequelize.literal("(SELECT COUNT(*) FROM journal_receipt as receipt2journal WHERE receiptid = receipt.id )"), 'cntjournal'
						]
					]
				}
			}
		)
			.then(data => {
				const pathname = global.documents + req.query.jahr + '/';
				try {
					fs.readdirSync(global.uploads + 'receipt/');
				} catch (error) {
					fs.mkdirSync(global.uploads + 'receipt/')
				}
				data.forEach(rec => {
					try {
						fs.copyFileSync(pathname + rec.receipt, global.uploads + rec.receipt);
					} catch (ex) {
						console.log(pathname + rec.receipt + ': File not found');
						rec.receipt = 'File not found: ' + rec.receipt
					}
				});
				res.json(data);
			})
			.catch(e => next(e));

	} else {
		Receipt.findAll(
			{
				logging: console.debug,
				where: { jahr: req.query.jahr },
				attributes: {
					include: [[Sequelize.fn('COUNT', Sequelize.col('receipt2journal.journalid')), 'cntjournal']]
				},
				include: [
					{ model: JournalReceipt, as: 'receipt2journal', required: false, attributes: [] }
				],
				group: ['id', 'receipt', 'bezeichnung', 'updatedAt', 'jahr', 'createdAt']
			}
		)
			.then(data => {
				const pathname = global.documents + req.query.jahr + '/';
				try {
					fs.readdirSync(global.uploads + 'receipt/');
				} catch (error) {
					fs.mkdirSync(global.uploads + 'receipt/')
				}
				for (let index = 0; index < data.length; index++) {
					const rec = data[index];
					try {
						fs.copyFileSync(pathname + rec.receipt, global.uploads + rec.receipt);
					} catch (ex) {
						console.log(pathname + rec.receipt + ': File not found');
						rec.receipt = 'File not found: ' + rec.receipt
					}

				}
				res.json(data);
			})
			.catch(e => next(e));

	}


}

async function getAttachment(req, res, next) {
	// Hier müssen nun die Belege gelesen werden und nicht nur das Attribut auf dem Journal
	Receipt.findAll(
		{
			attributes: [
				'id', 'receipt', 'bezeichnung'
			],
			include: [
				{ model: JournalReceipt, as: 'receipt2journal', required: true, attributes: [], where: { 'journalid': req.query.id } }

			]
		}
	)
		.then(data => {
			const pathname = global.documents + req.query.jahr + '/';
			try {
				fs.readdirSync(global.uploads + 'receipt/');
			} catch (error) {
				fs.mkdirSync(global.uploads + 'receipt/')
			}
			data.forEach(rec => {
				console.log(pathname + rec.receipt);
				try {
					fs.copyFileSync(pathname + rec.receipt, global.uploads + rec.receipt);
				} catch (ex) {
					rec.receipt = 'File not found: ' + rec.receipt
				}
			});
			res.json(data);
		})
		.catch(e => next(e));

}
async function uploadAtt(req, res, next) {
	const filename = req.query.receipt;
	const options = {
		root: global.uploads
	};
	res.sendFile(filename, options, function (err) {
		if (err) {
			next(err);
		} else {
			console.log('Sent:', filename);
		}
	})


}


async function getOneData(req, res, next) {
	Journal.findByPk(req.query.id,
		{
			attributes: [
				'id', 'date', 'memo', 'journalno', 'amount', 'status',
				[Sequelize.fn("COUNT", Sequelize.col("journal2receipt.receiptid")), "receipts"]
			],
			include: [
				{ model: Account, as: 'fromAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
				{ model: Account, as: 'toAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
				{ model: JournalReceipt, as: 'journal2receipt', required: false, attributes: [] }
			],
			group: ['journal.id', 'journal.date', 'journal.memo', 'journal.journalno',
				'journal.amount', 'journal.status',
				'fromAccount.id', 'fromAccount.order', 'fromAccount.name', 'fromAccount.longname',
				'toAccount.id', 'toAccount.order', 'toAccount.name', "toAccount.longname"
			]
		}
	)
		.then(data => {
			res.json(data);
		})
		.catch(e => next(e));
}

async function removeData(req, res, next) {
	const data = JSON.parse(req.body);
	console.info('delete: ', data);
	Journal.findByPk(data.id)
		.then((journal) =>
			journal.destroy()
				.then((obj) => res.json({ id: obj.id }))
				.catch(e => next(e)))
		.catch(e => next(e));
}

async function addData(req, res, next) {
	let data = JSON.parse(req.body);
	data.id = null;
	console.info('insert: ', data);
	Journal.create(data)
		.then((obj) => res.json(obj))
		.catch(e => next(e));
}

async function updateData(req, res, next) {
	let data = JSON.parse(req.body);
	console.info('update: ', data);

	Journal.findByPk(data.id)
		.then((journal) => journal.update(data, { fields: ["from_account", "to_account", "journalno", "date", "memo", "amount", "status"] })
			.then((obj) => res.json(obj))
			.catch(e => next(e)))
		.catch(e => next(e));
}

async function getKegelkasse(req, res, next) {
	Kegelkasse.findAll({
		logging: console.log,
		where: [Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('datum')), req.query.monat),
			Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), req.query.jahr)],
		include: [
			{
				model: Journal, as: 'journal', required: false,
				include: [
					{ model: Account, as: 'fromAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
					{ model: Account, as: 'toAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] }
				]
			}
		]
	})
		.then(obj => res.json(obj))
		.catch(e => next(e));
}

async function getAllKegelkasse(req, res, next) {
	Kegelkasse.findAll({
		logging: console.log,
		where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), req.query.jahr),
		include: [
			{
				model: User, as: 'user', required: true
			},
			{
				model: Journal, as: 'journal', required: false,
				include: [
					{ model: Account, as: 'fromAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] },
					{ model: Account, as: 'toAccount', required: true, attributes: ['id', 'order', 'name', 'longname'] }
				]
			}
		],
		order: ["datum"]
	})
		.then(async obj => {
			for (let index = 0; index < obj.length; index++) {
				const element = obj[index];
				const { count } = await Meisterschaft.findAndCountAll({
					where: {total_kegel: {[Op.gt] : 5} },
					include: [{model: Anlaesse, as: 'linkedEvent', where: {datum: element.datum}}]
				});
				element.cntUsers = count;
			}
			res.json(obj);
		})
		.catch(e => next(e));
}
async function addKegelkasse(req, res, next) {
	let data = JSON.parse(req.body);
	data.id = null;
	console.info('insert: ', data);
	Kegelkasse.create(data)
		.then(async (obj) => {
			if (data.journal && data.journal.id > 0)
				await obj.setJournal(data.journal)
			res.json(obj)
		})
		.catch(e => next(e));
}

async function updateKegelkasse(req, res, next) {
	let data = JSON.parse(req.body);
	if (data.id) {
		console.info('update: ', data);

		Kegelkasse.findByPk(data.id)
			.then((kegelkasse) => kegelkasse.update(data)
				.then(async (obj) => {
					if (data.journal && data.journal.id > 0)
						await obj.setJournal(data.journal.id)
					res.json(obj)
				})
				.catch(e => next(e)))
			.catch(e => next(e));
	} else {
		data.id = null;
		console.info('insert: ', data);
		Kegelkasse.create(data)
			.then(async (obj) => {
				if (data.journal && data.journal.id > 0)
					await obj.setJournal(data.journal)
				res.json(obj)
			})
			.catch(e => next(e));
	}
}

async function addReceipt(req, res, next) {
	const data = JSON.parse(req.body);

	if (data.uploadFiles == undefined) {
		// nothing to do -> return
		res.json({ status: "error", message: "No file to store in database" });
		return;
	}

	const listUploadFiles = data.uploadFiles.split(',')
	let sJahr = data.jahr;
	const path = global.documents + sJahr + '/';
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
		fs.mkdirSync(path + '/receipt');
	}
	let payload = {
		type: 'info',
		message: '',
		files: []
	}

	for (const element of listUploadFiles) {
		const receipt = 'receipt/' + element

		let filename = global.uploads + element;

		if (fs.existsSync(filename)) {
			let newReceipt = Receipt.build({ receipt: receipt, jahr: sJahr, bezeichnung: element })
			await newReceipt.save({ fields: ['receipt', 'jahr', 'bezeichnung'] })
				.then(async (result) => {
					let newFilename = 'receipt/journal-' + result.id + '.pdf'
					result.receipt = newFilename
					await result.save({ fields: ['receipt'] })
						.then(result2 => {
							fs.copyFileSync(filename, path + newFilename);
							payload.files.push(newFilename)
							fs.chmod(path + newFilename, '0640', err => {
								if (err) {
									console.log(err)
									payload.message += "Error while changing the mode of the file - " + err.message + "; "
								}
							});
						})
				})
				.catch(e => {
					console.log(e)
					payload.message += "Error while saving new receipt " + element + "; "
					payload.type = 'error'
				})
		} else {
			payload.message += "Error while reading the file " + element + "; ";
			payload.type = 'error'
		}
	};

	if (payload.error)
		next(payload);
	else
		res.json(payload);
}

async function updReceipt(req, res, next) {

	Receipt.findByPk(JSON.parse(req.body).id)
		.then(rec => {
			rec.bezeichnung = JSON.parse(req.body).bezeichnung
			rec.save({ fields: ['bezeichnung'] })
				.then(resp => res.json(resp))
				.catch(err => next(err))
		})
		.catch(err => { console.log(err); next(err); })

}

async function delReceipt(req, res, next) {
	Receipt.findByPk(JSON.parse(req.body).id)
		.then(rec => {
			if (rec)
				rec.destroy()
					.then(resp => res.json(resp))
					.catch(err => { console.log(err); next(err); })
			else
				next({type: 'error', message: 'Attachment konnte nicht gefunden werden.'})
				// res.json({type: 'error', message: 'Attachment konnte nicht gefunden werden.'})
		})
		.catch(err => { console.log(err); next(err) })
}

async function addFiles2Journal(req, res, next) {
	const data = JSON.parse(req.body);
	const journalid = req.query.journalid
	const jahr = req.query.jahr
	const listUploadFiles = data.uploadFiles.split(',')
	const path = global.documents + jahr + '/';

	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
		fs.mkdirSync(path + '/receipt');
	}

	let payload = {
		type: 'ok',
		message: '',
		data: []
	}
	if (listUploadFiles.length > 0) {
		for await (const file of listUploadFiles) {
			let filename = global.uploads + file;
			if (fs.existsSync(filename)) {
				let newReceipt = Receipt.build({ receipt: file, jahr: jahr, bezeichnung: file })
				await newReceipt.save({ fields: ['receipt', 'jahr', 'bezeichnung'] })
					.then(async (result) => {
						let newFilename = 'receipt/journal-' + result.id + '.pdf'
						result.receipt = newFilename
						await result.save({ fields: ['receipt'] })
							.then(result2 => {
								fs.copyFileSync(filename, path + newFilename);
								fs.chmod(path + newFilename, '0640', err => {
									if (err) {
										console.log(err)
										payload.message += "Error while changing the mode of the file - " + err.message + "; "
									}
								});

								let journal = JournalReceipt.build({ journalid: journalid, receiptid: result2.id });
								journal.save()
									.then(jResp => {
										console.log(jResp)
										payload.data.push(file);
									})
									.catch(err => { console.log(err); payload.message += "Error while saving journal_receipt;" })
							})
					})
					.catch(e => {
						console.log(e)
						payload.message += "Error while saving new receipt " + file + "; "
						payload.type = 'error'
					})
			} else {
				payload.message += "Error while reading the file " + filename + "; ";
				payload.type = 'error'
			}
		}

	}
	res.json(payload)
}

async function addReceipt2Journal(req, res, next) {
	const data = JSON.parse(req.body);
	const journalid = req.query.journalid

	let payload = {
		type: 'ok',
		message: '',
		data: null
	}

	let journAdd = []
	data.forEach(async (rec) => {
		journAdd.push({ 'journalid': journalid, 'receiptid': rec.id })
	})

	await JournalReceipt.bulkCreate(journAdd)
		.then(rec => payload.data = rec)
		.catch(err => { console.log(err); payload.type = 'error'; payload.message = 'Konnte nicht gelöscht werden'; next(err); });

	res.json(payload);
}

async function addAttachment(req, res, next) {
	const data = JSON.parse(req.body);

	let sJahr = new Date(data.date).getFullYear();
	const path = global.documents + sJahr + '/';
	let payload = {
		type: 'error',
		message: '',
		files: []
	}

	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
		fs.mkdirSync(path + '/receipt');
	}

	for (const element of listUploadFiles) {
		const receipt = 'receipt/' + element

		let filename = global.uploads + element;

		if (fs.existsSync(filename)) {
			let newReceipt = Receipt.build({ receipt: receipt, jahr: sJahr, bezeichnung: element })
			await newReceipt.save({ fields: ['receipt', 'jahr', 'bezeichnung'] })
				.then(async (result) => {
					let newFilename = 'receipt/journal-' + result.id + '.pdf'
					result.receipt = newFilename
					await result.save({ fields: ['receipt'] })
						.then(result2 => {
							fs.copyFileSync(filename, path + newFilename);
							payload.files.push(newFilename)
							fs.chmod(path + newFilename, '0640', err => {
								if (err) {
									console.log(err)
									payload.message += "Error while changing the mode of the file - " + err.message + "; "
								}
							});
							let journal = JournalReceipt.build({ journalid: data.id, receiptid: result2.id });
							journal.save()
								.then(jResp => {
									console.log(jResp)
								})
								.catch(err => { console.log(err); payload.message += "Error while saving journal_receipt;" })
						})
				})
				.catch(e => {
					console.log(e)
					payload.message += "Error while saving new receipt " + element + "; "
					payload.type = 'error'
				})
		} else {
			payload.message += "Error while reading the file " + element + "; ";
			payload.type = 'error'
		}
	};

	if (payload.message == '' && payload.files.length == listUploadFiles.length)
		payload.status = 'ok'

	res.json(payload);
}

async function delAttachment(req, res, next) {
	const data = JSON.parse(req.body);

	JournalReceipt.findOne({
		where: [
			{ journalid: data.journalid },
			{ receiptid: data.receiptid }
		]
	}).then(resp => resp.destroy()
		.then(ret => res.json({ type: "info", message: "Attachment deleted" }))
		.catch(e => next(e)))
		.catch(e => next(e))
}

async function getAccData(req, res, next) {
	Promise.all([
		Journal.findAll({
			attributes: [
				"id", "journalno", "date", "memo", "amount"],
			where: [{ "from_account": req.query.acc },
			Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), req.query.jahr)],
			include: [{ model: Account, as: 'fromAccount', required: true }, { model: Account, as: 'toAccount', required: true }]
		}),
		Journal.findAll({
			attributes: [
				"id", "journalno", "date", "memo", "amount"],
			where: [{ "to_account": req.query.acc },
			Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), req.query.jahr)],
			include: [{ model: Account, as: 'fromAccount', required: true }, { model: Account, as: 'toAccount', required: true }]
		})
	])
		.then((modelReturn) => {
			let arPreData = modelReturn.flat();
			let arData = [];
			for (let index = 0; index < arPreData.length; index++) {
				const element = arPreData[index];
				let record = { id: element.id, journalno: element.journalno, date: element.date, memo: element.memo, fromAcc: element.fromAccount.longname, toAcc: element.toAccount.longname }

				if (element.toAccount.id == req.query.acc) {
					record.haben = Number(element.amount)
					record.soll = 0
				} else {
					record.soll = Number(element.amount)
					record.haben = 0
				}
				arData.push(record);
			}
			console.log(arData);
			res.json(arData);
		})
		.catch((err) => next(err));
}

async function importJournal(req, res, next) {
	let data = JSON.parse(req.body);
	let filename = data.sname.replace(process.cwd(), ".");
	console.log(filename);

	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filename);

	const worksheet = workbook.getWorksheet(1);
	const lastrow = worksheet.lastRow.getCell(1).row;
	console.log(`Worksheet ${worksheet.name} hat ${lastrow} Zeilen.`);

	const logWorksheet = workbook.addWorksheet("Import Log");
	logWorksheet.columns = [
		{ header: 'Timestamp', key: 'timestam', width: 10 },
		{ header: 'Type', key: 'type', width: 10 },
		{ header: 'Message', key: 'message', width: 50 }
	];


	let arInsData = [];

	// einlesen vom Kontoplan
	let arAccount = await Account.findAll({
		order: ["level", "order"]
	})
		.catch((e) => {
			logWorksheet.addRow({ 'timestamp': new Date().toUTCString(), 'type': 'Warnung', 'message': e });
		});

	const cNr = 1
	const cDatum = 2
	const cSoll = 3
	const cHaben = 4
	const cBuchungstext = 5
	const cBetrag = 6

	let Nr, Datum, Soll, Haben, Buchungstext, Betrag, idSoll, idHaben, Meldung, fSoll, fHaben;

	worksheet.eachRow(function (row, rowNumber) {
		if (rowNumber > 1) {
			Nr = row.getCell(cNr).value;
			Datum = row.getCell(cDatum).value;
			Soll = string(row.getCell(cSoll).value);
			Haben = string(row.getCell(cHaben).value);
			Buchungstext = row.getCell(cBuchungstext).value;
			Betrag = row.getCell(cBetrag).value;

			for (let ind2 = 0; ind2 < arAccount.length; ind2++) {
				const element = arAccount[ind2];
				if (element.order == Soll) {
					idSoll = element.id;
					fSoll = true;
				}
				if (element.order == Haben) {
					idHaben = element.id;
					fHaben = true;
				}

				if (fHaben && fSoll)
					return;
			}

			if (!fSoll) {
				Meldung = `Konto ${Soll} konnte nicht gefunden werden`
				logWorksheet.addRow({ 'timestamp': new Date().toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}), 'type': 'Warnung', 'message': Meldung });
				idSoll = 43;
			}
			if (!fHaben) {
				Meldung = `Konto ${Haben} konnte nicht gefunden werden`
				logWorksheet.addRow({ 'timestamp': new TDate().toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}), 'type': 'Warnung', 'message': Meldung });
				idHaben = 43;
			}

			let formDate;
			if (Datum instanceof Date) {
				const offset = Datum.getTimezoneOffset()
				Datum = new Date(Datum.getTime() - (offset * 60 * 1000))
				formDate = Datum.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}).split('T')[0]
			} else {
				formDate = Datum.split('.')[2] + '-' + Datum.split('.')[1] + '-' + Datum.split('.')[0]
			}

			let record = { "journalno": Nr, "date": formDate, "from_account": idSoll, "to_account": idHaben, "memo": Buchungstext, "amount": Betrag };
			arInsData.push(record);
			logWorksheet.addRow({ 'timestamp': new Date().toString(), 'type': 'Warnung', 'message': JSON.stringify() });
		}
	})

	await Journal.bulkCreate(arInsData,
		{ fields: ["journalno", "date", "from_account", "to_account", "memo", "amount"] })
		.catch((e) => {
			logWorksheet.addRow({ 'timestamp': new Date().toUTCString(), 'type': 'Warnung', 'message': e });
		});

	let filenamenew = filename.replace('.xlsx', 'imported.xlsx');
	await workbook.xlsx.writeFile(filenamenew)
		.catch((e) => {
			console.error(e);
			res.json({
				type: "error",
				message: e,
			});
		});

}

module.exports = {
	getData: getData,
	getAttachment: getAttachment,
	getOneData: getOneData,
	removeData: removeData,
	addData: addData,
	updateData: updateData,
	getKegelkasse: getKegelkasse,
	getAllKegelkasse: getAllKegelkasse,
	addKegelkasse: addKegelkasse,
	updateKegelkasse: updateKegelkasse,
	getAllAttachment: getAllAttachment,
	addFiles2Journal: addFiles2Journal,
	addReceipt2Journal: addReceipt2Journal,
	addAttachment: addAttachment,
	addReceipt: addReceipt,
	updReceipt: updReceipt,
	delReceipt: delReceipt,
	delAttachment: delAttachment,
	getAccData: getAccData,
	importJournal: importJournal,
	uploadAtt: uploadAtt
};