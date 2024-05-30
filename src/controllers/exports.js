const { Meisterschaft, Adressen, Kegelmeister, Clubmeister, Account, Budget, Journal, Anlaesse, Receipt, JournalReceipt, Kegelkasse, User } = require("../db");
const {
    Op, QueryTypes, Sequelize
} = require("sequelize");

const fs = require("fs");
const path = require("path");
const Archiver = require("archiver");
const ExcelJS = require("exceljs");
const PDFDocument = require('pdfkit-table');
const numeral = require('numeral');
const nodemailer = require("nodemailer");
const { type } = require("os");

const cName = "C6";
const cVorname = "C7";
const sFirstRow = 13;

const iFontSizeHeader = 18
const iFontSizeTitel = 14
const iFontSizeRow = 13

module.exports = {
    /**
     * Sendet eine Email
     * @param {Request} req 
     * @param {Response} res 
     * @returns 
     */
    sendEmail: async function (req, res, next) {
        console.log("sendEmail");

        let emailBody = {};

        try {
            emailBody = JSON.parse(req.body);

        } catch (error) {
            emailBody = req.body;
        }
        if (emailBody.email_signature == "") {
            emailBody.email_signature = global.gConfig.defaultEmail;
        }
        let email_from = emailBody.email_signature;
        try {
            let email_signature = fs.readFileSync(global.assets + emailBody.email_signature + ".html")
            emailBody.email_body += "<p>" + email_signature + "</p>";
        } catch (error) {
            return res.json(error)
        }
        let emailConfig = global.gConfig[email_from];

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: emailConfig.smtp,
            port: emailConfig.smtp_port,
            secure: true,
            auth: {
                user: emailConfig.smtp_user,
                pass: global.cipher.decrypt(emailConfig.smtp_pwd),
            }
        });

        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                return { type: "error", message: "SMTP Connection can not be verified" };
            }
            if (success) {
                console.log("Server is ready to take our messages");
            }
        });

        let attachments = []

        if (emailBody.uploadFiles) {
            let files = emailBody.uploadFiles.split(',');
            for (let ind2 = 0; ind2 < files.length; ind2++) {
                const file = files[ind2];
                attachments.push({ filename: file, path: path.join(global.uploads, file) });
            }
        }

        await transporter.sendMail({
            from: emailConfig.email_from, // sender address
            to: emailBody.email_an, // list of receivers
            cc: emailBody.email_cc,
            bcc: emailBody.email_bcc,
            attachments: attachments,
            subject: emailBody.email_subject, // Subject line
            text: decodeURI(emailBody.email_body), // plain text body
            html: emailBody.email_body, // html body
            dsn: {
                id: 'AMC',
                return: 'headers',
                notify: ['failure', 'delay'],
                recipient: emailConfig.email_from
            }
        }, (err, info) => {
            if (err) {
                console.log(err);
                res.json(err);
                return err;
            }
            console.log(info);
            transporter.close();
            res.json(info);
        });

    },

    /**
     * Erstellt ein Excelfile mit dem Journal
     * @param {Request} req 
     * @param {Response} res 
     */
    writeAdresses: async function (req, res, next) {
        console.log("writeAdresses");

        // filter einbauen aus body.filter
        const filter = JSON.parse(req.body);
        console.log(filter);

        let sWhere = { austritt: { [Op.gte]: new Date() } };
        if (filter.adresse != '')
            sWhere.adresse = { [Op.like]: "%" + filter.adresse + "%" };
        if (filter.name != '')
            sWhere.name = { [Op.like]: "%" + filter.name + "%" };
        if (filter.vorname != '')
            sWhere.vorname = { [Op.like]: "%" + filter.vorname + "%" };
        if (filter.ort != '')
            sWhere.ort = { [Op.like]: "%" + filter.ort + "%" };
        if (filter.plz != '')
            sWhere.plz = { [Op.like]: "%" + filter.plz + "%" };
        if (filter.sam_mitglied != '')
            sWhere.sam_mitglied = filter.sam_mitglied;
        if (filter.vorstand != '')
            sWhere.vorstand = filter.vorstand;
        if (filter.revisor != '')
            sWhere.revisor = filter.revisor;
        if (filter.ehrenmitglied != '')
            sWhere.ehrenmitglied = filter.ehrenmitglied;

        let arData = await Adressen.findAll(
            {
                where: sWhere,
                order: ["name", "vorname"]
            }
        )
            .catch((e) => {
                console.error(e);
                next(e);
            });

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        let fmtToday = new Date().toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" });
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Janine Franken";

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        let sheet = workbook.addWorksheet("Adressen", {
            pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
            },
            headerFooter: {
                oddHeader: "&18Auto-Moto-Club Swissair",
                oddFooter: "&14Adressen Stand per " + fmtToday
            }
        });


        // Schreibe Adressdaten
        setCellValueFormat(sheet, 'A1', "MNR", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'B1', "Anrede", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'C1', "Name", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'D1', "Vorname", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'E1', "Adresse", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'F1', "PLZ", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'G1', "Ort", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'H1', "Land", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'I1', "Telefon (P)", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'J1', "Mobile", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'K1', "Email", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'L1', "Notizen", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'M1', "SAM Nr.", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'N1', "SAM Mitglied", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'O1', "Ehrenmitglied", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'P1', "Vorstand", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'Q1', "Revisor", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'R1', "Allianz", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'S1', "Eintritt", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(sheet, 'T1', "Austritt", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });

        let row = 2;

        for (let index = 0; index < arData.length; index++) {
            const element = arData[index];

            setCellValueFormat(sheet, 'A' + row, element.mnr, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'B' + row, (element.geschlecht == '1' ? "Herr" : "Frau"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C' + row, element.name, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'D' + row, element.vorname, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'E' + row, element.adresse, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'F' + row, element.plz, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'G' + row, element.ort, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'H' + row, element.land, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'I' + row, element.telefon_p, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'J' + row, element.mobile, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'K' + row, element.email, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'L' + row, element.notes, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'M' + row, element.mnr_sam, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            setCellValueFormat(sheet, 'N' + row, (element.sam_mitglied == "1" ? "Ja" : "Nein"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('N' + row).alignment = { horizontal: "center" };
            setCellValueFormat(sheet, 'O' + row, (element.ehrenmitglied == "1" ? "Ja" : "Nein"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('O' + row).alignment = { horizontal: "center" };
            setCellValueFormat(sheet, 'P' + row, (element.vorstand == "1" ? "Ja" : "Nein"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('P' + row).alignment = { horizontal: "center" };
            setCellValueFormat(sheet, 'Q' + row, (element.revisor == "1" ? "Ja" : "Nein"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('Q' + row).alignment = { horizontal: "center" };
            setCellValueFormat(sheet, 'R' + row, (element.allianz == "1" ? "Ja" : "Nein"), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('R' + row).alignment = { horizontal: "center" };
            setCellValueFormat(sheet, 'S' + row, new Date(element.eintritt).toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" }), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            let date = new Date(element.austritt);
            let dateFmt = date.toLocaleDateString('de-DE', options);
            setCellValueFormat(sheet, 'T' + row, (dateFmt == "01.01.3000" ? "" : dateFmt), true, '', { size: iFontSizeRow, name: 'Tahoma' });

            row++;

        }

        sheet.autoFilter = "A1:T1";

        sheet.getColumn('A').width = 10;
        sheet.getColumn('B').width = 12;
        sheet.getColumn('C').width = 15;
        sheet.getColumn('D').width = 15;
        sheet.getColumn('E').width = 25;
        sheet.getColumn('F').width = 8;
        sheet.getColumn('G').width = 25;
        sheet.getColumn('H').width = 10;
        sheet.getColumn('I').width = 20;
        sheet.getColumn('J').width = 20;
        sheet.getColumn('K').width = 35;
        sheet.getColumn('L').width = 35;
        sheet.getColumn('M').width = 13;
        sheet.getColumn('N').width = 20;
        sheet.getColumn('O').width = 20;
        sheet.getColumn('P').width = 20;
        sheet.getColumn('Q').width = 20;
        sheet.getColumn('R').width = 20;
        sheet.getColumn('S').width = 12;
        sheet.getColumn('T').width = 12;

        const filename = "Adressen-" + fmtToday + ".xlsx";
        await workbook.xlsx.writeFile("./public/exports/" + filename)
            .catch((e) => {
                console.error(e);
                next(e);
            });

        return res.json({
            type: "info",
            message: "Excelfile erstellt",
            filename: filename
        });
    },

    /**
     * Erstellt ein Excelfile mit dem Journal
     * @param {Request} req 
     * @param {Response} res 
     */
    writeJournal: async function (req, res, next) {
        console.log("writeJournal");
        const sjahr = eval(req.query.jahr * 1);
        let fReceipt = (req.query.receipt == '1');
        // load a locale
        try {
            let locale = numeral.localeData('ch')

            locale.delimiters = {
                thousands: ' ',
                decimal: '.'
            };
        } catch (error) {
            numeral.register('locale', 'ch', {
                delimiters: {
                    thousands: ' ',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    return '.';
                },
                currency: {
                    symbol: 'Fr.'
                }
            });

        }
        numeral.locale('ch');

        let arData = await Journal.findAll(
            {
                where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), sjahr),
                include: [
                    { model: Account, as: 'fromAccount', required: true, attributes: ['id', 'order', 'name'] },
                    { model: Account, as: 'toAccount', required: true, attributes: ['id', 'order', 'name'] }
                ],
                order: [
                    ['journalno', 'asc'],
                    ['date', 'asc'],
                    ['from_account', 'asc'],
                ]
            }
        )
            .catch((e) => {
                console.error(e);
                next(e)
            });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Janine Franken";

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        let sheet = workbook.addWorksheet("Journal", {
            pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
                orientation: "landscape"
            },
            properties: {
                defaultRowHeight: 22
            },
            headerFooter: {
                oddHeader: "&18Auto-Moto-Club Swissair",
                oddFooter: "&14Journal " + sjahr
            }
        });

        // Schreibe Journal
        setCellValueFormat(sheet, 'B1', "Journal " + sjahr, false, '', { bold: true, size: iFontSizeHeader, name: 'Tahoma' });

        const tHeaders = [
            {property: 'no', label: 'No.', width: 50, align: "right"},
            { property: 'date', label: 'Date', valign: 'top', width: 80 },
            { property: 'from', label: 'From', valign: 'top', width: 50 },
            { property: 'to', label: 'To', valign: 'top', width: 50 },
            { property: 'text', label: 'Booking Text', valign: 'top', width: 150 },
            { property: 'amount', label: 'Amount', valign: 'top', align: 'right', width: 100,
            renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) => { return typeof value == 'number' ? Number(value).toFixed(2) : value } },
            { property: 'receipt', label: 'Receipt', valign: 'top', width: 250 }
        ]
        setCellValueFormat(sheet, 'B3', "No", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('B3').alignment = { vertical: "top" };
        setCellValueFormat(sheet, 'C3', "Date", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('C3').alignment = { vertical: "top" };
        setCellValueFormat(sheet, 'D3', "From ", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('D3').alignment = { vertical: "top" };
        setCellValueFormat(sheet, 'E3', "To ", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('E3').alignment = { vertical: "top" };
        setCellValueFormat(sheet, 'F3', "Booking Text ", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('F3').alignment = { vertical: "top" };
        setCellValueFormat(sheet, 'G3', "Amount", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('G3').alignment = { horizontal: "right", vertical: "top" };
        setCellValueFormat(sheet, 'H3', "Receipt", true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        sheet.getCell('H3').alignment = { vertical: "top" };

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        let row = 4;

        let tRows = [];
        for (let index = 0; index < arData.length; index++) {
            const element = arData[index];
            const date = new Date(element.date);
            let dateFmt = date.toLocaleDateString('de-DE', options);
            let num = eval(element.amount * 1)

            let rowRecord = {
                no: (element.journalno == null ? '' : element.journalno), date: dateFmt, from: element.fromAccount.order, to: element.toAccount.order,
                text: element.memo, amount: num, receipt: ''
            };

            sheet.getRow(row).height = 22;
            setCellValueFormat(sheet, 'B' + row, element.journalno, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('B' + row).alignment = { vertical: "top" };
            setCellValueFormat(sheet, 'C' + row, dateFmt, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('C' + row).alignment = { vertical: "top" };
            setCellValueFormat(sheet, 'D' + row, element.fromAccount.order + " " + element.fromAccount.name, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('D' + row).alignment = { vertical: "top" };
            setCellValueFormat(sheet, 'E' + row, element.toAccount.order + " " + element.toAccount.name, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('E' + row).alignment = { vertical: "top" };
            setCellValueFormat(sheet, 'F' + row, element.memo, true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('F' + row).alignment = { vertical: "top" };
            setCellValueFormat(sheet, 'G' + row, eval(element.amount * 1), true, '', { size: iFontSizeRow, name: 'Tahoma' });
            sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            sheet.getCell('G' + row).alignment = { vertical: "top" };
            sheet.getCell('H' + row).alignment = { vertical: "top", wrapText: true };
            let linkAdress = ""
            await Receipt.findAll({
                logging: console.debug,
                include: [
                    { model: JournalReceipt, as: 'receipt2journal', required: true, attributes: [], where: { 'journalid': element.id } }
                ],
                order: ['bezeichnung']
            }
            )
                .then(recLst => {
                    for (let indR = 0; indR < recLst.length; indR++) {
                        if (indR == 0)
                            linkAdress = recLst[indR].bezeichnung + ": " + recLst[indR].receipt
                        else
                            linkAdress += "\r\n" + recLst[indR].bezeichnung + ": " + recLst[indR].receipt
                    }
                    setCellValueFormat(sheet, 'H' + row, linkAdress, true, '', { size: iFontSizeRow, name: 'Tahoma' });
                })
                .catch(err => next(err))
            rowRecord.receipt = linkAdress;
            tRows.push(rowRecord);
            row++;

        }

        sheet.getColumn('B').width = 8;
        sheet.getColumn('C').width = 18;
        sheet.getColumn('D').width = 35;
        sheet.getColumn('E').width = 35;
        sheet.getColumn('F').width = 50;
        sheet.getColumn('G').width = 18;
        sheet.getColumn('H').width = 75;

        const filename = "Journal-" + sjahr;
        await workbook.xlsx.writeFile(global.exports + filename + ".xlsx")
            .catch((e) => {
                console.error(e);
                next(e)
            });


        let sExt = '.xlsx';
        if (fReceipt) {
            sExt = '.zip';

            let pdf = new PDFDocument({
                autoFirstPage: false,
                bufferPages: true,
                layout: 'landscape',
                size: 'A4',
                info: {
                    Title: 'Journal ' + sjahr,
                    Author: 'AutoMoto-Club Swissair, Janine Franken'
                }
            });

            const table = {
                headers: tHeaders,
                datas: tRows
            }

            
            // if no page already exists in your PDF, do not forget to add one
            pdf.addPage();
            // Embed a font, set the font size, and render some text
            pdf
                .font('Helvetica-Bold')
                .fontSize(18)
                .text('Journal ' + sjahr)
                .moveDown(1);

            // draw content, by passing data to the addBody method
            pdf.table(table, {
                divider: {
                    header: { disabled: false, width: 2, opacity: 1 },
                    horizontal: { disabled: false, width: 0.5, opacity: 1 },
                    vertical: { disabled: false, width: 0.5, opacity: 1 },
                },
                padding: 5, // {Number} default: 0
                columnSpacing: 5,
                prepareHeader: () => pdf.font("Helvetica-Bold").fontSize(10),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    pdf.font("Helvetica").fontSize(10);
                }

            })

            // see the range of buffered pages            
            let gedrucktAm = 'Erstellt am: ' + new Date().toLocaleDateString('de-DE', options);
            const range = pdf.bufferedPageRange(); // => { start: 0, count: 1 ... }
            for (let i = range.start, end = range.start + range.count; i < end; i++) {
                pdf.switchToPage(i);

                let x = pdf.page.margins.left + 5;
                let y = pdf.page.height - pdf.heightOfString(gedrucktAm) - pdf.page.margins.bottom;
                console.log(gedrucktAm + ' ' + x + '/' + y);
                pdf.text(gedrucktAm, x, y);

                let text = `Page ${i + 1} of ${range.count}`
                x = pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
                console.log(text + ' ' + x + '/' + y);
                pdf.text(text, x, y);
            }

            // Pipe its output somewhere, like to a file or HTTP response
            // See below for browser usage
            pdf.pipe(fs.createWriteStream(global.exports + filename + '.pdf'));

            // Finalize PDF file
            pdf.end();

            // create a file to stream archive data to.
            const output = fs.createWriteStream(global.exports + filename + ".zip");
            const archive = Archiver('zip');

            // listen for all archive data to be written
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                res.json({
                    type: "info",
                    message: "Datei erstellt",
                    filename: filename + sExt
                });

            });

            // This event is fired when the data source is drained no matter what was the data source.
            // It is not part of this library but rather from the NodeJS Stream API.
            // @see: https://nodejs.org/api/stream.html#stream_event_end
            output.on('end', function () {
                console.log('Data has been drained');
            });

            // good practice to catch warnings (ie stat failures and other non-blocking errors)
            archive.on('warning', function (err3) {
                if (err3.code === 'ENOENT') {
                    // log warning
                } else {
                    // throw error
                    throw err3;
                }
            });
            archive.on('error', function (err4) {
                throw err4;
            });
            archive.pipe(output);

            // append a file
            if (fs.existsSync(global.exports + filename + ".pdf")) {
                archive.file(global.exports + filename + ".pdf", { name: filename + ".pdf" });
            }
            else {
                console.error("File not found");
            }

            // append files from a sub-directory and naming it `new-subdir` within the archive
            archive.directory(global.documents + sjahr + '/receipt/', 'receipt');
            archive.finalize();
        }
        else {
            return res.json({
                type: "info",
                message: "Datei erstellt",
                filename: filename + sExt
            });
        }

    },

    /**
   * Erstellt eine Exceldatei mit den Meisterschaftsauswertungen
   * @param {Request} req 
   * @param {Response} res 
   */
    writeAuswertung: async function (req, res, next) {
        console.log("writeAuswertung");

        let objSave = JSON.parse(req.body);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile("./public/exports/Meisterschaft-Vorlage.xlsx");

        // Clubmeisterschaft lesen und exportieren
        let dbMeister = await Clubmeister.findAll({
            where: { jahr: { [Op.eq]: objSave.year } },
            order: [
                ['rang', 'asc']
            ]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });

        Promise.resolve(dbMeister)
            .catch((e) => {
                console.error(e);
                next(e)
            });

        let worksheet = workbook.getWorksheet('Clubmeisterschaft');
        worksheet.getCell("A1").value = "Clubmeisterschaft " + objSave.year;
        let row = 5
        for (const meister of dbMeister) {
            // Add a row by contiguous Array (assign to columns A, B & C)
            worksheet.insertRow(row, [meister.rang, meister.punkte, meister.vorname, meister.nachname, meister.mitgliedid, meister.anlaesse, meister.werbungen, meister.mitglieddauer, meister.status], 'i+');
            row++;
        }
        worksheet.getColumn(5).hidden = true;
        worksheet.getColumn(9).hidden = true;
        worksheet.spliceRows(4, 1);

        // Kegelmeisterschaft lesen und exportieren
        dbMeister = await Kegelmeister.findAll({
            where: { jahr: { [Op.eq]: objSave.year } },
            order: [
                ['rang', 'asc']
            ]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });

        Promise.resolve(dbMeister)
            .catch((e) => {
                console.error(e);
                next(e)
            });


        worksheet = workbook.getWorksheet('Kegelmeisterschaft');
        worksheet.getCell("A1").value = "Kegelmeisterschaft " + objSave.year;
        row = 5
        for (const meister of dbMeister) {
            // Add a row by contiguous Array (assign to columns A, B & C)
            worksheet.insertRow(row, [meister.rang, meister.punkte, meister.vorname, meister.name, meister.mitgliedid, meister.anlaesse, meister.babeli, meister.status], 'i+');
            row++;
        }
        worksheet.getColumn(5).hidden = true;
        worksheet.getColumn(8).hidden = true;
        worksheet.spliceRows(4, 1);

        // Datei sichern
        let filename = "Meisterschaft-" + objSave.year + ".xlsx";
        await workbook.xlsx.writeFile("./public/exports/" + filename)
            .catch((e) => {
                console.error(e);
                next(e)
            });

        return res.json({
            type: "info",
            message: "Excelfile erstellt",
            filename: filename
        });

    },

    /**
     * Erstellt Stammblätter mit oder ohne Daten
     * @param {Request} req 
     * @param {Response} res 
     */
    writeExcelTemplate: async function (req, res, next) {
        console.log("writeExcelTemplate");

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Janine Franken";

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        let sheet
        let oneAdresse

        let objSave = JSON.parse(req.body);

        switch (objSave.type) {
            case 0:
                // Datenblatt leer
                sheet = workbook.addWorksheet("Template", {
                    pageSetup: {
                        fitToPage: true,
                        fitToHeight: 1,
                        fitToWidth: 1,
                    },
                });
                await createTemplate(objSave.year, sheet, true);
                //sheet.commit();
                break;

            case 1:
                // Datenblatt leer für Adressen
                if (objSave.id == 0) {
                    // für alle aktiven Mitglieder
                    let dbAdressen = await Adressen.findAll({
                        where: {
                            austritt: {
                                [Op.gte]: new Date()
                            }
                        },
                        order: [["name", "asc"], ["vorname", "asc"]]
                    })
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });
                    Promise.resolve(dbAdressen)
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });

                    for (const adress of dbAdressen) {
                        sheet = workbook.addWorksheet(adress.vorname + " " + adress.name, {
                            pageSetup: {
                                fitToPage: true,
                                fitToHeight: 1,
                                fitToWidth: 1,
                            },
                        });
                        await createTemplate(objSave.year, sheet, true);
                        await fillName(sheet, adress);
                        //sheet.commit();
                    }

                } else {
                    // für ein Mitglied
                    oneAdresse = await Adressen.findByPk(objSave.id)
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });
                    Promise.resolve(oneAdresse)
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });
                    sheet = workbook.addWorksheet(oneAdresse.vorname + " " + oneAdresse.name, {
                        pageSetup: {
                            fitToPage: true,
                            fitToHeight: 1,
                            fitToWidth: 1,
                        },
                    });
                    await createTemplate(objSave.year, sheet, true);
                    await fillName(sheet, oneAdresse);
                    //sheet.commit();
                }
                break;

            case 2:
                // Datenblatt gefüllt für Adressen
                if (objSave.id == 0) {
                    // für alle aktiven Mitglieder
                    const dbAdressen = await Adressen.findAll({
                        where: { "austritt": { [Op.gt]: new Date() } },
                        include: {
                            model: Meisterschaft, required: true,
                            attributes: [],
                            include: {
                                model: Anlaesse, as: 'linkedEvent', required: true,
                                attributes: [],
                                where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("datum")), objSave.year)
                            }
                        },
                        order: ["name", "vorname"]
                    });

                    for (let index = 0; index < dbAdressen.length; index++) {
                        const adress = dbAdressen[index];
                        sheet = workbook.addWorksheet(adress.vorname + " " + adress.name, {
                            pageSetup: {
                                fitToPage: true,
                                fitToHeight: 1,
                                fitToWidth: 1,
                            },
                        });
                        await createTemplate(objSave.year, sheet, false);
                        await fillName(sheet, adress);
                        await fillTemplate(sheet, adress.id, objSave.year);
                        //sheet.commit();
                    }

                } else {
                    // für ein Mitglied
                    oneAdresse = await Adressen.findByPk(objSave.id)
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });

                    Promise.resolve(oneAdresse)
                        .catch((e) => {
                            console.error(e);
                            res.json({
                                type: "error",
                                message: e,
                            });
                        });

                    sheet = workbook.addWorksheet(oneAdresse.vorname + " " + oneAdresse.name, {
                        pageSetup: {
                            fitToPage: true,
                            fitToHeight: 1,
                            fitToWidth: 1,
                        },
                    });
                    await createTemplate(objSave.year, sheet, false);
                    await fillName(sheet, oneAdresse);
                    await fillTemplate(sheet, oneAdresse.id, objSave.year);
                    //sheet.commit;
                }
                break;

            default:
                break;
        }

        const filename = "Stammblätter-" + objSave.year + ".xlsx";
        await workbook.xlsx.writeFile("./public/exports/" + filename)
            .catch((e) => {
                console.error(e);
                next(e)
            });

        return res.json({
            type: "info",
            message: "Excelfile erstellt",
            filename: filename
        });
    },

    /**
     * Write Bilanz and Erfolgsrechnung to Excelfile
     * @param {Request} req 
     * @param {Response} res 
     */
    writeExcelData: async function (req, res, next) {
        console.log("writeExcelData");
        let sjahr = req.query.jahr;

        let iVJahr = eval((sjahr * 1) - 1);
        let iNJahr = eval((sjahr * 1) + 1);

        const workbook = new ExcelJS.Workbook();

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        let bsheet = workbook.addWorksheet("Bilanz", {
            pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
            },
            properties: {
                defaultRowHeight: 22
            },
            headerFooter: {
                oddHeader: "&18Auto-Moto-Club Swissair",
                oddFooter: "&14Bilanz " + sjahr
            }
        });

        let esheet = workbook.addWorksheet("Erfolgsrechnung", {
            pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
            },
            properties: {
                defaultRowHeight: 22
            },
            headerFooter: {
                oddHeader: "&18Auto-Moto-Club Swissair",
                oddFooter: "&14Erfolgsrechnung " + sjahr
            }
        });

        let busheet = workbook.addWorksheet("Budget", {
            pageSetup: {
                fitToPage: true,
                fitToHeight: 1,
                fitToWidth: 1,
            },
            properties: {
                defaultRowHeight: 22
            },
            headerFooter: {
                oddHeader: "&18Auto-Moto-Club Swissair",
                oddFooter: "&14Budget " + iNJahr
            }
        });

        let accData = await Account.findAll({
            attributes: ["id", "name", "level", "order", "status",
                [Sequelize.literal(0), "amount"], [Sequelize.literal(0), "amountVJ"],
                [Sequelize.literal(0), "budget"], [Sequelize.literal(0), "budgetVJ"], [Sequelize.literal(0), "budgetNJ"]
            ],
            order: ["level", "order"],
            raw: true, nest: true
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });

        let accBudget = await Budget.findAll({
            where: { "year": { [Op.in]: [sjahr, iVJahr, iNJahr] } },
            order: ["year", "account"],
            raw: true
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });

        for (let index = 0; index < accBudget.length; index++) {
            let found = accData.findIndex(acc => acc.id == accBudget[index].account);
            if (found == -1) {
                console.warn("Account: " + accBudget[index].account + " hat Budget aber keine Stammdaten!");
            } else {
                switch (accBudget[index].year) {
                    case eval(sjahr * 1):
                        accData[found].budget = eval(accBudget[index].amount * 1);
                        break;
                    case iVJahr:
                        accData[found].budgetVJ = eval(accBudget[index].amount * 1);
                        break;
                    case iNJahr:
                        accData[found].budgetNJ = eval(accBudget[index].amount * 1);
                        break;
                }
            }

        }
        let arrAmount = await Journal.findAll({
            attributes: ["from_account", [Sequelize.fn('SUM', Sequelize.col("amount")), "amount"]],
            where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), sjahr),
            group: ["from_account"]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });
        for (let ind2 = 0; ind2 < arrAmount.length; ind2++) {
            const element = arrAmount[ind2];
            let found = accData.findIndex(acc => acc.id == element.from_account);
            accData[found].amount = eval(element.amount + 0);
        }

        arrAmount = await Journal.findAll({
            attributes: ["to_account", [Sequelize.fn('SUM', Sequelize.col("amount")), "amount"]],
            where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), sjahr),
            group: ["to_account"]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });
        for (let ind2 = 0; ind2 < arrAmount.length; ind2++) {
            const element = arrAmount[ind2];
            let found = accData.findIndex(acc => acc.id == element.to_account);
            switch (accData[found].level) {
                case 1:
                case 4:
                    accData[found].amount = eval(accData[found].amount - element.amount);
                    break;
                case 2:
                case 6:
                    accData[found].amount = eval(element.amount - accData[found].amount);
                    break;
            }
        }
        arrAmount = await Journal.findAll({
            attributes: ["from_account", [Sequelize.fn('SUM', Sequelize.col("amount")), "amount"]],
            where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), iVJahr),
            group: ["from_account"]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });
        for (let ind2 = 0; ind2 < arrAmount.length; ind2++) {
            const element = arrAmount[ind2];
            let found = accData.findIndex(acc => acc.id == element.from_account);
            accData[found].amountVJ = eval(element.amount + 0);
        }

        arrAmount = await Journal.findAll({
            attributes: ["to_account", [Sequelize.fn('SUM', Sequelize.col("amount")), "amount"]],
            where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), iVJahr),
            group: ["to_account"]
        })
            .catch((e) => {
                console.error(e);
                next(e)
            });
        for (let ind2 = 0; ind2 < arrAmount.length; ind2++) {
            const element = arrAmount[ind2];
            let found = accData.findIndex(acc => acc.id == element.to_account);
            switch (accData[found].level) {
                case 1:
                case 4:
                    accData[found].amountVJ = eval(accData[found].amountVJ - element.amount);
                    break;
                case 2:
                case 6:
                    accData[found].amountVJ = eval(element.amount - accData[found].amountVJ);
                    break;
            }
        }

        // Schreibe Bilanzdaten
        setCellValueFormat(bsheet, 'B1', "Bilanz " + sjahr, false, false, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'B3', "Konto", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'C3', "Bezeichnung", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'D3', "Saldo " + sjahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        bsheet.getCell('D3').alignment = { horizontal: "right" };
        setCellValueFormat(bsheet, 'E3', "Saldo " + iVJahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        bsheet.getCell('E3').alignment = { horizontal: "right" };
        setCellValueFormat(bsheet, 'F3', "Differenz", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        bsheet.getCell('F3').alignment = { horizontal: "right" };

        let accBData = accData.filter(function (value, index, array) {

            return (value.status == 1 || value.amount != 0 || value.amountVJ != 0) && value.level < 3;
        });
        let Total = writeArray(bsheet, accBData, 4, false);
        let row = Total.lastRow + 2;
        let formula1 = { formula: 'D' + Total.total1 + '-D' + Total.total2 };
        let formula2 = { formula: 'E' + Total.total1 + '-E' + Total.total2 };
        let formula3 = { formula: 'D' + row + '-E' + row };
        setCellValueFormat(bsheet, 'B' + row, "Gewinn / Verlust", true, 'B' + row + ':C' + row, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'D' + row, formula1, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'E' + row, formula2, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'F' + row, formula3, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        bsheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        bsheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        bsheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';

        row += 2;
        formula1 = { formula: 'D' + Total.lastRow + '+D' + eval(Total.lastRow + 2) };
        formula2 = { formula: 'E' + Total.lastRow + '+E' + eval(Total.lastRow + 2) };
        formula3 = { formula: 'D' + row + '-E' + row };
        setCellValueFormat(bsheet, 'B' + row, "Vermögen Ende Jahr", true, 'B' + row + ':C' + row, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'D' + row, formula1, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'E' + row, formula2, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(bsheet, 'F' + row, formula3, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        bsheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        bsheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        bsheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';

        bsheet.getColumn('C').width = 32;
        bsheet.getColumn('D').width = 18;
        bsheet.getColumn('E').width = 18;
        bsheet.getColumn('F').width = 18;

        // Schreibe Erfolgsrechnung
        setCellValueFormat(esheet, 'B1', "Erfolgsrechnung " + sjahr, false, false, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(esheet, 'B3', "Konto", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'C3', "Bezeichnung", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'D3', "Saldo " + sjahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('D3').alignment = { horizontal: "right" };
        setCellValueFormat(esheet, 'E3', "Saldo " + iVJahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('E3').alignment = { horizontal: "right" };
        setCellValueFormat(esheet, 'F3', "Differenz", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('F3').alignment = { horizontal: "right" };
        setCellValueFormat(esheet, 'G3', "Budget " + sjahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('G3').alignment = { horizontal: "right" };
        setCellValueFormat(esheet, 'H3', "Differenz", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('H3').alignment = { horizontal: "right" };

        let accEData = accData.filter(function (value, index, array) {
            return (value.status == 1 || value.amount != 0 || value.amountVJ != 0 || value.budget != 0 || value.budgetNJ != 0) && value.level > 2 && value.level < 9;
        });
        Total = writeArray(esheet, accEData, 4, true);
        row = Total.lastRow + 2;
        formula1 = { formula: 'D' + Total.total2 + '-D' + Total.total1 };
        formula2 = { formula: 'E' + Total.total2 + '-E' + Total.total1 };
        formula3 = { formula: 'D' + row + '-E' + row };
        let formula4 = { formula: 'G' + Total.total2 + '-G' + Total.total1 };
        let formula5 = { formula: 'G' + row + '-D' + row };
        setCellValueFormat(esheet, 'B' + row, "Gewinn / Verlust", true, 'B' + row + ':C' + row, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(esheet, 'D' + row, formula1, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'E' + row, formula2, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'F' + row, formula3, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'G' + row, formula4, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(esheet, 'H' + row, formula5, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        esheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        esheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        esheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        esheet.getCell('G' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        esheet.getCell('H' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';

        esheet.getColumn('C').width = 32;
        esheet.getColumn('D').width = 18;
        esheet.getColumn('E').width = 18;
        esheet.getColumn('F').width = 18;
        esheet.getColumn('G').width = 18;
        esheet.getColumn('H').width = 18;

        // Schreibe Budgetvergleich
        setCellValueFormat(busheet, 'B1', "Budget " + iNJahr, false, false, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(busheet, 'B3', "Konto", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'C3', "Bezeichnung", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'D3', "Saldo " + sjahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('D3').alignment = { horizontal: "right" };
        setCellValueFormat(busheet, 'E3', "Budget " + sjahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('E3').alignment = { horizontal: "right" };
        setCellValueFormat(busheet, 'F3', "Differenz", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('F3').alignment = { horizontal: "right" };
        setCellValueFormat(busheet, 'G3', "Budget " + iNJahr, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('G3').alignment = { horizontal: "right" };
        setCellValueFormat(busheet, 'H3', "Differenz", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('H3').alignment = { horizontal: "right" };

        Total = writeArray(busheet, accEData, 4, true, true);

        row = Total.lastRow + 2;
        formula1 = { formula: 'D' + Total.total2 + '-D' + Total.total1 };
        formula2 = { formula: 'E' + Total.total2 + '-E' + Total.total1 };
        formula3 = { formula: 'E' + row + '-D' + row };
        formula4 = { formula: 'G' + Total.total2 + '-G' + Total.total1 };
        formula5 = { formula: 'G' + row + '-E' + row };
        setCellValueFormat(busheet, 'B' + row, "Gewinn / Verlust", true, 'B' + row + ':C' + row, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
        setCellValueFormat(busheet, 'D' + row, formula1, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'E' + row, formula2, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'F' + row, formula3, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'G' + row, formula4, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        setCellValueFormat(busheet, 'H' + row, formula5, true, '', { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
        busheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        busheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        busheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        busheet.getCell('G' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
        busheet.getCell('H' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';

        busheet.getColumn('C').width = 32;
        busheet.getColumn('D').width = 18;
        busheet.getColumn('E').width = 18;
        busheet.getColumn('F').width = 18;
        busheet.getColumn('G').width = 18;
        busheet.getColumn('H').width = 18;

        const filename = "Bilanz-" + sjahr + ".xlsx";
        await workbook.xlsx.writeFile("./public/exports/" + filename)
            .catch((e) => {
                console.error(e);
                next(e)
            });

        return res.json({
            type: "info",
            message: "Excelfile erstellt",
            filename: filename
        });
    },

    /**
     * Erstellt ein Excelfile mit dem Journal
     * @param {Request} req 
     * @param {Response} res 
     */
    writeAccountToExcel: async function (req, res, next) {
        console.log("writeAccountToExcel");
        const sJahr = req.query.jahr;
        let arData = [];

        if (req.query.all == 0) {
            let arAccId = await Journal.findAll({
                attributes: ["from_account", "to_account"],
                where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), req.query.jahr)
            });
            let arAccounts = [];
            for (let index = 0; index < arAccId.length; index++) {
                arAccounts.push(arAccId[index].from_account);
                arAccounts.push(arAccId[index].to_account);
            }

            arData = await Account.findAll({
                where: [{ "order": { [Op.gt]: 9 } },
                { "id": { [Op.in]: arAccounts } }]
            })
                .catch((e) => {
                    console.error(e);
                    res.json({
                        type: "error",
                        message: e,
                    });
                });
        } else {
            arData = await Account.findAll({
                where: [{ "order": { [Op.gt]: 9 } },
                { "status": 1 }]
            })
                .catch((e) => {
                    console.error(e);
                    res.json({
                        type: "error",
                        message: e,
                    });
                });

        }

        const workbook = new ExcelJS.Workbook();

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        for (let index = 0; index < arData.length; index++) {
            const element = arData[index];

            let sSheetName = element.order + " " + element.name.replace("/", "");
            let sheet = workbook.addWorksheet(sSheetName.substring(0, 31), {
                pageSetup: {
                    fitToPage: true,
                    fitToHeight: 1,
                    fitToWidth: 1,
                },
                properties: {
                    defaultRowHeight: 18
                },
                headerFooter: {
                    oddHeader: "&18Auto-Moto-Club Swissair",
                    oddFooter: "&14" + element.element + " " + element.name + " " + sJahr
                }
            });

            setCellValueFormat(sheet, 'B1', element.order + " " + element.name, false, false, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
            setCellValueFormat(sheet, 'B3', "No.", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C3', "Datum", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'D3', "Gegenkonto", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'E3', "Text ", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'F3', "Soll ", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            sheet.getCell('F3').alignment = { horizontal: "right" };
            setCellValueFormat(sheet, 'G3', "Haben", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            sheet.getCell('G3').alignment = { horizontal: "right" };
            setCellValueFormat(sheet, 'H3', "Saldo", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            sheet.getCell('H3').alignment = { horizontal: "right" };
            sheet.getColumn('B').width = 12;
            sheet.getColumn('C').width = 12;
            sheet.getColumn('D').width = 35;
            sheet.getColumn('E').width = 55;
            sheet.getColumn('F').width = 12;
            sheet.getColumn('G').width = 12;
            sheet.getColumn('H').width = 12;


            let iSaldo = 0.0;
            let iRow = 4;

            let arJournal = await Journal.findAll({
                where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), sJahr),
                {
                    [Op.or]: [
                        { "from_account": element.id },
                        { "to_account": element.id }
                    ]
                }],
                order: ["journalno", "date"]
            })
                .catch((e) => {
                    console.error(e);
                    res.json({
                        type: "error",
                        message: e,
                    });
                });

            for (let ind2 = 0; ind2 < arJournal.length; ind2++) {
                const entry = arJournal[ind2];
                const iAmount = eval(entry.amount + 0);

                setCellValueFormat(sheet, 'B' + iRow, entry.journalno, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                setCellValueFormat(sheet, 'C' + iRow, entry.formdate, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                setCellValueFormat(sheet, 'E' + iRow, entry.memo, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                sheet.getCell('F' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
                sheet.getCell('G' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
                sheet.getCell('H' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';

                if (entry.from_account == element.id) {
                    const toAcc = arData.find(rec => rec.id == entry.to_account);
                    if (toAcc)
                        setCellValueFormat(sheet, 'D' + iRow, toAcc.order + " " + toAcc.name, true, false, { size: iFontSizeTitel, name: 'Tahoma' });

                    else
                        setCellValueFormat(sheet, 'D' + iRow, entry.to_account, true, false, { size: iFontSizeTitel, name: 'Tahoma' });

                    setCellValueFormat(sheet, 'F' + iRow, iAmount, true, false, { size: iFontSizeTitel, name: 'Tahoma' });
                    setCellValueFormat(sheet, 'G' + iRow, "", true, false, { size: iFontSizeTitel, name: 'Tahoma' });
                    if (element.level == 2 || element.level == 6)
                        iSaldo -= iAmount;

                    else
                        iSaldo += iAmount;
                    setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, false, { size: iFontSizeTitel, name: 'Tahoma' });
                } else {
                    const fromAcc = arData.find(rec => rec.id == entry.from_account);
                    if (fromAcc)
                        setCellValueFormat(sheet, 'D' + iRow, fromAcc.order + " " + fromAcc.name, true, false, { size: iFontSizeRow, name: 'Tahoma' });

                    else
                        setCellValueFormat(sheet, 'D' + iRow, entry.from_account, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                    setCellValueFormat(sheet, 'F' + iRow, "", true, false, { size: iFontSizeRow, name: 'Tahoma' });
                    setCellValueFormat(sheet, 'G' + iRow, iAmount, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                    if (element.level == 2 || element.level == 6)
                        iSaldo += iAmount;

                    else
                        iSaldo -= iAmount;
                    setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, false, { size: iFontSizeRow, name: 'Tahoma' });
                }
                iRow++;
            }

            sheet.commit = true;
        }

        const filename = "Kontoauszug-" + sJahr + ".xlsx";
        await workbook.xlsx.writeFile("./public/exports/" + filename)
            .catch((e) => {
                console.error(e);
                next(e)
            });

        return res.json({
            type: "info",
            message: "Excelfile erstellt",
            filename: filename
        });

    },

    /**
     * Erstellt ein PDF mit der Kegelkasse und hängt es an den entsprechenden Journaleintrag
     * @param {Request} req 
     * @param {Response} res 
     */
    generateReceiptKegelkasse: async function (req, res, next) {
        console.log("generateReceiptKegelkasse");
        const sKegelId = req.query.kegelid;
        // load a locale
        try {
            let locale = numeral.localeData('ch')

            locale.delimiters = {
                thousands: ' ',
                decimal: '.'
            };
        } catch (error) {
            numeral.register('locale', 'ch', {
                delimiters: {
                    thousands: ' ',
                    decimal: '.'
                },
                abbreviations: {
                    thousand: 'k',
                    million: 'm',
                    billion: 'b',
                    trillion: 't'
                },
                ordinal: function (number) {
                    return '.';
                },
                currency: {
                    symbol: 'Fr.'
                }
            });

        }
        numeral.locale('ch');

        const payload = {
            type: 'info',
            message: '',
            file: ''
        }

        const kegelkasse = await Kegelkasse.findByPk(sKegelId, {
            include: [{
                model: User, as: 'user', required: true
            }]
        });
        console.log(kegelkasse);

        if (kegelkasse.journalid > 0) {
            const workbook = new ExcelJS.Workbook();

            // Force workbook calculation on load
            workbook.calcProperties.fullCalcOnLoad = true;

            let sSheetName = "Kegelkasse";
            let sheet = workbook.addWorksheet(sSheetName.substring(0, 31), {
                pageSetup: {
                    fitToPage: true,
                    fitToHeight: 1,
                    fitToWidth: 1,
                },
                properties: {
                    defaultRowHeight: 18
                },
                headerFooter: {
                    oddHeader: "&18Auto-Moto-Club Swissair",
                    oddFooter: "&14erstellt am " + new Date().toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' })
                }
            });

            sheet.getColumn('A').width = 17;
            sheet.getColumn('B').width = 17;
            sheet.getColumn('C').width = 17;

            const kegelDate = new Date(kegelkasse.datum)
            const kegelDateFormat = kegelDate.toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' });
            setCellValueFormat(sheet, 'A1', "Kegelkasse " + kegelDateFormat, false, "A1:C1", { bold: true, size: iFontSizeHeader, name: 'Tahoma' });

            const tHeaders = [
                {
                    property: 'value', label: 'Einheit', width: 80, align: "right",
                    renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) => { return typeof value == 'number' ? Number(value).toFixed(2) : value }
                },
                { property: 'field', label: 'Anzahl', width: 80, align: "right" },
                {
                    property: 'sum', label: 'Total', width: 80, align: "right",
                    renderer: (value, indexColumn, indexRow, row, rectRow, rectCell) => { return typeof value == 'number' ? Number(value).toFixed(2) : value }
                }];

            setCellValueFormat(sheet, 'A3', "Einheit", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'B3', "Anzahl", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C3', "Total", true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });

            let tRows = [];
            let sumTotal = 0
            let row = 4
            let record = writeKegelLine(sheet, row, 0.05, kegelkasse.rappen5);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 0.10, kegelkasse.rappen10);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 0.20, kegelkasse.rappen20);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 0.50, kegelkasse.rappen50);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 1, kegelkasse.franken1);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 2, kegelkasse.franken2);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 5, kegelkasse.franken5);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 10, kegelkasse.franken10);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 20, kegelkasse.franken20);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 50, kegelkasse.franken50);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            record = writeKegelLine(sheet, row, 100, kegelkasse.franken100);
            sumTotal += record['sum'];
            tRows.push(record);
            row++;
            row++;
            setCellValueFormat(sheet, 'A' + row, "Total", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C' + row, sumTotal, true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            tRows.push({ value: 'bold:Total', sum: `bold:${sumTotal.toFixed(2)}`, field: '' });
            row++;
            row++;
            setCellValueFormat(sheet, 'A' + row, "Kasse", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C' + row, Number(kegelkasse.kasse), true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            tRows.push({ value: '', sum: '', field: '' });
            tRows.push({ options: { separation: true }, value: 'bold:Kasse', sum: `bold:${kegelkasse.kasse}`, field: '' });
            row++;
            setCellValueFormat(sheet, 'A' + row, "Differenz", true, "A" + row + ":B" + row, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
            setCellValueFormat(sheet, 'C' + row, Number(kegelkasse.differenz), true, false, { bold: true, size: iFontSizeTitel, name: 'Tahoma', color: { argb: 'CD143C' } });
            sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            tRows.push({ value: 'bold:Differenz', sum: `bold:${kegelkasse.differenz}`, field: '' });
            row++;
            row++;
            setCellValueFormat(sheet, 'A' + row, "Glattbrugg, den " + formatDateLong(kegelDate), false, "A" + row + ":C" + row, { bold: false, italic: true, size: iFontSizeTitel, name: 'Tahoma' });

            const filename = "Kegelkasse-" + kegelkasse.datum + ".xlsx";
            await workbook.xlsx.writeFile("./public/exports/" + filename)
                .catch((e) => {
                    console.error(e);
                    res.json({
                        type: "error",
                        message: e,
                    });
                });

            const table = {
                headers: tHeaders,
                datas: tRows
            };

            const filenamePDF = filename.replace('.xlsx', '.pdf')
            let pdf = new PDFDocument({
                autoFirstPage: true,
                bufferPages: true,
                layout: 'portrait',
                size: 'A4',
                info: {
                    Title: 'Kegelkasse ' + kegelDateFormat,
                    Author: 'AutoMoto-Club Swissair, Janine Franken'
                }
            });
            // Embed a font, set the font size, and render some text
            pdf
                .font('Helvetica-Bold')
                .fontSize(18)
                .text('Kegelkasse ' + kegelDateFormat)
                .moveDown(2);

            // draw content, by passing data to the addBody method
            pdf.table(table, {
                divider: {
                    header: { disabled: false, width: 2, opacity: 1 },
                    horizontal: { disabled: false, width: 0.5, opacity: 1 },
                    vertical: { disabled: false, width: 0.5, opacity: 1 },
                },
                padding: 5, // {Number} default: 0
                columnSpacing: 5,
                prepareHeader: () => pdf.font("Helvetica-Bold").fontSize(11),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    pdf.font("Helvetica").fontSize(11);
                }
            })

            pdf
                .moveDown(2)
                .fontSize(12)
                .text('Glattbrugg, den ' + formatDateLong(kegelDate), pdf.page.margins.left + 5)
                .moveDown(1)
                .font('Helvetica-Oblique')
                .text('Kegelkasse erfasst durch ' + kegelkasse.user.name, pdf.page.margins.left + 5)
                .font("Helvetica")
                .fontSize(10)

            // see the range of buffered pages            
            let gedrucktAm = 'Erstellt am: ' + new Date().toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const range = pdf.bufferedPageRange(); // => { start: 0, count: 1 ... }
            for (let i = range.start, end = range.start + range.count; i < end; i++) {
                pdf.switchToPage(i);

                let x = pdf.page.margins.left + 5;
                let y = pdf.page.height - pdf.heightOfString(gedrucktAm) - pdf.page.margins.bottom;
                console.log(gedrucktAm + ' ' + x + '/' + y);
                pdf.text(gedrucktAm, x, y);

                let text = `Seite ${i + 1} von ${range.count}`
                x = pdf.page.width - pdf.widthOfString(text) - pdf.page.margins.right - 5;
                console.log(text + ' ' + x + '/' + y);
                pdf.text(text, x, y);
            }

            // Pipe its output somewhere, like to a file or HTTP response
            // See below for browser usage
            pdf.pipe(fs.createWriteStream(global.exports + filenamePDF));

            // Finalize PDF file
            pdf.end();

            // PDF an Journaleintrag hängen
            const receipt = 'receipt/' + filenamePDF
            const path = global.documents + kegelDate.getFullYear() + '/';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
                fs.mkdirSync(path + '/receipt');
            }
            let newReceipt = Receipt.build({ receipt: receipt, jahr: kegelDate.getFullYear(), bezeichnung: 'Kegelkasse ' + kegelDateFormat })
            await newReceipt.save({ fields: ['receipt', 'jahr', 'bezeichnung'] })
                .then(async (result) => {
                    let newFilename = 'receipt/journal-' + result.id + '.pdf'
                    result.receipt = newFilename
                    payload.file = newFilename
                    await result.save({ fields: ['receipt'] })
                        .then(result2 => {
                            fs.copyFileSync(global.exports + filenamePDF, path + newFilename);
                            fs.chmod(path + newFilename, '0640', err => {
                                if (err) {
                                    console.log(err)
                                    payload.message += "Error while changing the mode of the file - " + err.message + "; "
                                }
                            });
                            let journal = JournalReceipt.build({ journalid: kegelkasse.journalid, receiptid: result.id });
                            journal.save()
                                .then(jResp => {
                                    console.log(jResp)
                                })
                                .catch(err => {
                                    console.log(err);
                                    payload.message += "Error while saving journal_receipt;";
                                    payload.type = 'error';
                                })
                        })
                })
                .catch(e => {
                    console.log(e)
                    payload.message += "Error while saving new receipt " + element + "; "
                    payload.type = 'error'
                })


            return res.json(payload);


        } else {
            return res.json({
                type: "error",
                message: "Kegelkasse nicht mit Journal verbunden"
            });
        }

    }
};

/**
 * 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {number} row
 * @param {number} value
 * @param {number} field
 * @return {Object}
 */
function writeKegelLine(sheet, row, value, field) {
    setCellValueFormat(sheet, 'A' + row, value, true, false, { bold: false, size: iFontSizeRow, name: 'Tahoma' });
    sheet.getCell('A' + row).numFmt = '#,##0.00';
    setCellValueFormat(sheet, 'B' + row, field, true, false, { bold: false, size: iFontSizeRow, name: 'Tahoma' });
    sheet.getCell('B' + row).numFmt = '#,##0';
    setCellValueFormat(sheet, 'C' + row, field * value, true, false, { bold: false, size: iFontSizeRow, name: 'Tahoma' });
    sheet.getCell('C' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
    return { sum: field * value, value: value, field: field };
}

/**
 * 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {Array} arData 
 * @param {number} firstRow 
 * @param {boolean} fBudget
 * @param {boolean} fBudgetVergleich
 */
function writeArray(sheet, arData, firstRow, fBudget = false, fBudgetVergleich = false) {
    let row = firstRow;

    let cellLevel;

    for (let ind2 = 0; ind2 < arData.length; ind2++) {
        const element = arData[ind2];
        if (element.level == element.order) {
            row++;
            cellLevel = row;
            setCellValueFormat(sheet, "B" + row, element.name, true, "B" + row + ":C" + row, { name: 'Tahoma', bold: true, size: iFontSizeTitel })

            setCellValueFormat(sheet, "D" + row, '', true, '', { name: 'Tahoma', bold: true, size: iFontSizeTitel })
            setCellValueFormat(sheet, "E" + row, '', true, '', { name: 'Tahoma', bold: true, size: iFontSizeTitel })
            setCellValueFormat(sheet, "F" + row, '', true, '', { name: 'Tahoma', bold: true, size: iFontSizeTitel })

            sheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            sheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            sheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            if (fBudget) {
                setCellValueFormat(sheet, "G" + row, '', true, '', { name: 'Tahoma', bold: true, size: iFontSizeTitel })
                setCellValueFormat(sheet, "H" + row, '', true, '', { name: 'Tahoma', bold: true, size: iFontSizeTitel })

                sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
                sheet.getCell('H' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            }
        } else {
            let font = { name: 'Tahoma', size: iFontSizeRow };
            setCellValueFormat(sheet, "B" + row, element.order, true, '', font);
            setCellValueFormat(sheet, "C" + row, element.name, true, '', font);
            setCellValueFormat(sheet, 'D' + row, element.amount, true, '', font);
            setCellValueFormat(sheet, 'E' + row, element.amountVJ, true, '', font);

            switch (element.level) {
                case 2:
                case 4:
                    setCellValueFormat(sheet, 'F' + row, { formula: 'E' + row + '-D' + row }, true, '', font);
                    break;

                case 1:
                case 6:
                    setCellValueFormat(sheet, 'F' + row, { formula: 'D' + row + '-E' + row }, true, '', font);
                    break;

                default:
                    break;
            }

            sheet.getCell('D' + cellLevel).value = { formula: '=SUM(D' + eval(cellLevel + 1) + ':' + 'D' + row + ')' };
            sheet.getCell('E' + cellLevel).value = { formula: '=SUM(E' + eval(cellLevel + 1) + ':' + 'E' + row + ')' };
            sheet.getCell('F' + cellLevel).value = { formula: '=SUM(F' + eval(cellLevel + 1) + ':' + 'F' + row + ')' };

            sheet.getCell('D' + row).alignment = {
                horizontal: "right",
            };
            sheet.getCell('E' + row).alignment = {
                horizontal: "right",
            };
            sheet.getCell('F' + row).alignment = {
                horizontal: "right",
            };

            sheet.getCell('D' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            sheet.getCell('E' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            sheet.getCell('F' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';

            if (fBudget) {
                setCellValueFormat(sheet, 'G' + row, eval(element.budget * 1), true, '', font);

                switch (element.level) {
                    case 2:
                    case 4:
                        setCellValueFormat(sheet, 'H' + row, { formula: 'G' + row + '-D' + row }, true, '', font);
                        break;

                    case 1:
                    case 6:
                        setCellValueFormat(sheet, 'H' + row, { formula: 'D' + row + '-G' + row }, true, '', font);
                        break;

                    default:
                        break;
                }

                sheet.getCell('G' + cellLevel).value = { formula: '=SUM(G' + eval(cellLevel + 1) + ':' + 'G' + row + ')' };
                sheet.getCell('H' + cellLevel).value = { formula: '=SUM(H' + eval(cellLevel + 1) + ':' + 'H' + row + ')' };

                sheet.getCell('G' + row).alignment = {
                    horizontal: "right",
                };
                sheet.getCell('H' + row).alignment = {
                    horizontal: "right",
                };

                sheet.getCell('G' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
                sheet.getCell('H' + row).numFmt = '#,##0.00;[Red]\-#,##0.00';
            }

            if (fBudgetVergleich) {
                setCellValueFormat(sheet, 'E' + row, eval(element.budget * 1), true, '', font);
                setCellValueFormat(sheet, 'F' + row, { formula: 'E' + row + '-D' + row }, true, '', font);
                setCellValueFormat(sheet, 'G' + row, eval(element.budgetNJ * 1), true, '', font);
                setCellValueFormat(sheet, 'H' + row, { formula: 'G' + row + '-E' + row }, true, '', font);
            }
        }

        row++;
    }

    return { lastRow: row - 1, total1: firstRow + 1, total2: cellLevel };
}

/**
 * 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {number} id 
 * @param {string} syear 
 */
async function fillTemplate(sheet, id, syear) {
    const sqlstring = "select m.* from meisterschaft as m join anlaesse as a on m.eventid = a.id and year(a.datum) = " + syear + " where m.mitgliedid = " + id + " order by m.id"
    const data = await sequelize.query(sqlstring, { type: QueryTypes.SELECT, logging: console.debug, raw: false, model: Meisterschaft })

    if (data != undefined && data.length > 0) {
        let cols = sheet.getColumn('K');

        let clubTotal = 0
        let kegelTotal = 0

        cols.eachCell(function (cell, row) {
            if (cell.value != null && cell.value != "eventid") {
                for (let meisterschaft of data) {

                    if (cell.value == meisterschaft.eventid) {
                        sheet.getCell('A' + cell.row).value = meisterschaft.punkte;
                        clubTotal += meisterschaft.punkte;

                        if (meisterschaft.wurf1 > 0 || meisterschaft.wurf2 > 0 || meisterschaft.wurf3 > 0 || meisterschaft.wurf4 > 0 || meisterschaft.wurf5 > 0) {
                            // Kegelresultat
                            let kegelSumme = meisterschaft.wurf1 + meisterschaft.wurf2 + meisterschaft.wurf3 + meisterschaft.wurf4 + meisterschaft.wurf5 + meisterschaft.zusatz;
                            sheet.getCell('C' + cell.row).value = meisterschaft.wurf1;
                            sheet.getCell('D' + cell.row).value = meisterschaft.wurf2;
                            sheet.getCell('E' + cell.row).value = meisterschaft.wurf3;
                            sheet.getCell('F' + cell.row).value = meisterschaft.wurf4;
                            sheet.getCell('G' + cell.row).value = meisterschaft.wurf5;
                            sheet.getCell('I' + cell.row).value = kegelSumme;
                            if (meisterschaft.streichresultat == 0) {
                                kegelTotal += kegelSumme;
                            } else {
                                // setzte diagonale Linie - > Streichresultat                                
                                sheet.getRow(row).eachCell({ includeEmpty: false }, function (formatCell, colNumber) {
                                    // formatCell.style.fill = {
                                    //     type: 'pattern',
                                    //     pattern: 'solid',
                                    //     bgColor: { argb: '96C8FB' }
                                    // };
                                    formatCell.style.border = {
                                        bottom: { style: 'thin'},
                                        left: { style: 'thin'},
                                        right: { style: 'thin'},
                                        top: { style: 'thin'},
                                        diagonal: {
                                            up: true,
                                            down: true,
                                            style: 'thin',
                                        }
                                    };
                                });
                            }
                        }
                        break;
                    }
                }
            }
        });

        // Jetzt noch die Totals schreiben
        for (let i = sFirstRow; i <= sheet.lastRow.number; i++) {
            const row = sheet.getRow(i);
            if (row.getCell('F').value == "Total Kegeln") {
                row.getCell('I').value = kegelTotal;
            } else if (row.getCell('B').value == "Total Club") {
                row.getCell('A').value = clubTotal;
            }
        }


    }

}

/**
 * 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {Adressen} adress 
 */
async function fillName(sheet, adress) {

    let cell = sheet.getCell(cName)
    cell.value = adress.name;
    cell = sheet.getCell(cVorname)
    cell.value = adress.vorname;
}

/**
 * 
 * @param {string} syear 
 * @param {ExcelJS.Worksheet} sheet 
 * @param {number} inclPoints 
 */
async function createTemplate(syear, sheet, inclPoints) {
    // read all events
    let dbEvents = await Anlaesse.findAll({
        where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('datum')), syear),
        {
            [Op.or]: [
                { "istkegeln": true },
                { "punkte": { [Op.gt]: 0 } }
            ]
        }
        ],
        order: [
            ["istkegeln", "desc"],
            ["datum", "asc"],
            ["name", "asc"],
        ],
    })
        .catch((e) => {
            console.error(e);
            res.json({
                type: "error",
                message: e,
            });
        });

    setCellValueFormat(sheet, "A2", "CLUB/KEGELMEISTERSCHAFT", false, "A2:I2", { bold: true, size: iFontSizeHeader });
    let cell = sheet.getCell("A2");
    cell.alignment = {
        vertical: "middle",
        horizontal: "center",
    };

    setCellValueFormat(sheet, "A4", syear, false, "A4:I4");

    cell = sheet.getCell("A4");
    cell.font = {
        bold: true,
        size: iFontSizeHeader,
    };
    cell.alignment = {
        vertical: "middle",
        horizontal: "center",
    };

    sheet.getCell("B6").value = "Name:";
    sheet.getCell("B6").font = {
        bold: true,
        size: iFontSizeTitel
    };
    sheet.getCell(cName).font = {
        bold: true,
        size: iFontSizeTitel
    };
    sheet.getCell("B7").value = "Vorname:";
    sheet.getCell("B7").font = {
        bold: true,
        size: iFontSizeTitel
    };
    sheet.getCell(cVorname).font = {
        size: iFontSizeTitel
    };

    setCellValueFormat(sheet, "C11", "Kegelmeisterschaft", true, "C11:E11", { bold: true, size: iFontSizeTitel });

    let row = sFirstRow - 1;
    setCellValueFormat(sheet, "A" + row, "Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "B" + row, "Datum", true, "", { bold: true, size: iFontSizeRow });
    sheet.getColumn("B").width = 11;
    setCellValueFormat(sheet, "C" + row, "Resultate", true, "C" + row + ":G" + row, { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "H" + row, "z Pkt.", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "I" + row, "Total", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "J" + row, "Visum", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "K" + row, "eventid", false, "", { bold: true, size: iFontSizeRow });

    let clubTotal = 0;

    for (const event of dbEvents) {

        if (event.istkegeln == 1) {
            // clubevent einfache Liste
            row++;
            if (event.status == 1) {
                clubTotal += event.punkte;
                setCellValueFormat(sheet, "A" + row, (inclPoints ? event.punkte : ""), true, "", { size: iFontSizeRow });
            } else {
                setCellValueFormat(sheet, "A" + row, "", true, "", { size: iFontSizeRow, strike: true });
            }

            setCellValueFormat(sheet, "B" + row, new Date(event.datum).toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" }), true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "C" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "D" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "E" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "F" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "G" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "H" + row, (event.nachkegeln == 0 ? 5 : 0), true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "I" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "J" + row, "", true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "K" + row, event.id, false, "", { size: iFontSizeRow });
        }
    }

    row++;
    setCellValueFormat(sheet, "F" + row, "Total Kegeln", true, "F" + row + ":H" + row, { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "I" + row, 0, true, "", { bold: true, size: iFontSizeRow });
    row++;
    row++;

    setCellValueFormat(sheet, "C" + row, "Clubmeisterschaft", true, "C" + row + ":E" + row, { bold: true, size: iFontSizeTitel });

    row++;
    setCellValueFormat(sheet, "A" + row, "Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "B" + row, "Datum", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "C" + row, "Bezeichnung", true, "C" + row + ":I" + row, { bold: true, size: iFontSizeRow });

    for (const event of dbEvents) {

        if (event.istkegeln != 1) {
            row++;
            // clubevent einfache Liste
            if (event.status > 0) {
                clubTotal += event.punkte;
                setCellValueFormat(sheet, "A" + row, (inclPoints ? event.punkte : ""), true, "", { size: iFontSizeRow });
            } else {
                setCellValueFormat(sheet, "A" + row, "", true, "", { size: iFontSizeRow, strike: true });
            }
            setCellValueFormat(sheet, "B" + row, new Date(event.datum).toLocaleDateString("de-CH", { year: 'numeric', month: "2-digit", day: "2-digit" }), true, "", { size: iFontSizeRow });
            setCellValueFormat(sheet, "C" + row, event.name, true, "C" + row + ":I" + row, { size: iFontSizeRow });
            setCellValueFormat(sheet, "K" + row, event.id, false, "", { size: iFontSizeRow });
        }
    }

    row++;
    setCellValueFormat(sheet, "B" + row, "Total Club", true, "", { bold: true, size: iFontSizeRow });
    setCellValueFormat(sheet, "A" + row, (inclPoints ? clubTotal : 0), true, "", { bold: true, size: iFontSizeRow });


    sheet.getColumn("K").hidden = true;
    sheet.getColumn("J").width = 17;
    // Iterate over all rows (including empty rows) in a worksheet
    sheet.eachRow({
        includeEmpty: true
    }, function (rowData, rowNumber) {
        rowData.height = 15;
    });

}

/**
 * 
 * @param {ExcelJS.Worksheet} sheet Excel Worksheet
 * @param {string} cell Range
 * @param {*} value value to fill in cell
 * @param {Boolean} border Set thin boarder line
 * @param {Boolean} merge Merge the cells
 * @param {*} font Object of font settings
 */
function setCellValueFormat(sheet, range, value, border, merge, font) {
    let cell = sheet.getCell(range)
    cell.value = value;
    if (merge != "") {
        sheet.mergeCells(merge);
    }

    if (border)
        cell.border = {
            top: {
                style: "thin",
            },
            left: {
                style: "thin",
            },
            bottom: {
                style: "thin",
            },
            right: {
                style: "thin",
            }
        };

    if (font)
        cell.font = font;

}

/**
 * Function to format a date in a long German date
 * 
 * @param {Date} date The date
 * @returns {string} The formatted date
 */
function formatDateLong(date) {
    let retString = ''

    const months = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
    ];

    const monthName = months[date.getMonth()]

    retString = date.getDate() + '. ' + monthName + ' ' + date.getFullYear()
    return retString
}