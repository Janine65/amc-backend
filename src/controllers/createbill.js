const nodemailer = require("nodemailer");
const path = require("path");
//const SwissQRBill = require('swissqrbill')
const PDFDocument = require("pdfkit");
const SwissQRBill = require("swissqrbill/pdf")
const utils = require("swissqrbill/utils")
const nodeutils = require("node:fs")

const {
    Sequelize
} = require("sequelize");
const { Adressen, Journal}  = require('../db');
const fs = require('fs');

module.exports = {

    /**
     * Erstellt eine PDFDatei mit der QR-Rechnung 
     * @param {Request} req 
     * @param {Response} res 
     */
    createQRBill: async function (req, res, next) {
        console.log("createQRBill");

        const adresse = JSON.parse(req.body);
        const sJahr = global.Parameter.get("CLUBJAHR");
    
        const data = {
            currency: "CHF",
            //amount: 30.0,
            additionalInformation: "Rechnungsnummer " + sJahr + "0000" + adresse.mnr,
            av1: "twint/light/02:627a1c3325b04c5cbbbe9afcdfb6501b#6298bbc2451e7f036c9e39e989c20452aa6afd8a#",
            av2: "rn/twint/a~8Hbq5Y6GTd6RWWoWJ3pOsg~s~YbdhuKDqS5edL5KCHuzvtw/rn",
            creditor: {
                name: "Auto-Moto-Club Swissair",
                address: "Breitenrain",
                buildingNumber: "4",
                zip: 8917,
                city: "Oberlunkhofen",
                account: "CH3009000000870661227",
                country: "CH"
            },
            debtor: {
                name: adresse.vorname + " " + adresse.name,
                address: adresse.adresse,
                zip: eval(adresse.plz * 1),
                city: adresse.ort,
                country: adresse.land
            }
        };

        const filename = "AMC-Mitgliederbeitrag-" + sJahr + "-" + adresse.mnr + ".pdf";

        const stream = nodeutils.createWriteStream(global.uploads + filename);
        const pdf = new PDFDocument({ autoGenerate: false, size: "A4" });
        pdf.pipe(stream);
        pdf.info = {
            Title: "Mitgliederrechnung " + sJahr,
            Author: "Auto-Moto-Club Swissair",
            Subject: "Mitgliederrechnung " + sJahr,
            CreationDate: new Date()
        }
        pdf.save();

        // Fit the image within the dimensions
        let img = fs.readFileSync(global.assets + '/AMCfarbigKlein.jpg');
        pdf.image(img.buffer, utils.mm2pt(140), utils.mm2pt(5),
            { fit: [100, 100] });

        const date = new Date();

        pdf.fontSize(12);
        pdf.fillColor("black");
        pdf.font("Helvetica");
        pdf.text(data.creditor.name + "\n" + data.creditor.address + "\n" + data.creditor.zip + " " + data.creditor.city, utils.mm2pt(20), utils.mm2pt(35), {
            width: utils.mm2pt(100),
            align: "left"
        });

        pdf.fontSize(12);
        pdf.font("Helvetica");
        pdf.text(data.debtor.name + "\n" + data.debtor.address + "\n" + data.debtor.zip + " " + data.debtor.city, utils.mm2pt(130), utils.mm2pt(60), {
            width: utils.mm2pt(70),
            height: utils.mm2pt(50),
            align: "left"
        });

        pdf.moveDown();
        pdf.fontSize(11);
        pdf.font("Helvetica");
        pdf.text("Oberlunkhofen " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(), {
            width: utils.mm2pt(170),
            align: "right"
        });

        pdf.moveDown();
        pdf.fontSize(14);
        pdf.font("Helvetica-Bold");
        pdf.text(data.additionalInformation, utils.mm2pt(20), utils.mm2pt(100), {
            width: utils.mm2pt(140),
            align: "left"
        });

        pdf.moveDown();
        pdf.fontSize(12);
        pdf.fillColor("black");
        pdf.font("Helvetica");

        let text = (adresse.geschlecht == 1 ? "Lieber " : "Liebe ") + adresse.vorname + "\n";
        pdf.text(text, {
            width: utils.mm2pt(170),
            align: "left"
        });
        text += global.Parameter.get("RECHNUNG") + '\n';
        pdf.text(`${global.Parameter.get("RECHNUNG")}\n`, {
            width: utils.mm2pt(170),
            align: "justify"
        });
        pdf.moveDown();
        text += `Mit liebem Clubgruss\nJanine Franken`;
        pdf.text(`Mit liebem Clubgruss\nJanine Franken`, {
            width: utils.mm2pt(170),
            align: "left"
        });
        
        pdf.moveDown();
        pdf.fontSize(10);
        pdf.text(`Bitte beachte, dass für Einzahlungen am Postschalter eine Gebühr von CHF 2.50 erhoben wird. Zahlungen via Twint, Banküberweisung oder E-Finance sind kostenlos.\n`, {
            width: utils.mm2pt(170),
            align: "justify",
            oblique: true
        });

        // Fit the image within the dimensions
        img = fs.readFileSync(global.assets + '/RNW-TWINT-SWISS-QR-DE.png');
        pdf.image(img.buffer, utils.mm2pt(0), utils.mm2pt(182), {fit: [utils.mm2pt(210), utils.mm2pt(10)]});

        const qrBill = new SwissQRBill.SwissQRBill(data);
        qrBill.attachTo(pdf);
        pdf.save();
        pdf.end();

        let email_body = "<p>" + text.split("\n").join("</p><p>") + "</p>";

        let email = {
            email_an: adresse.email, email_cc: '', email_bcc: '',
            email_body: email_body,
            email_subject: "Auto-Moto-Club Swissair - Mitgliederrechnung",
            uploadFiles: filename,
            email_signature: "JanineFranken"
        }

        const retVal = await fncSendEmail(email);

        // journal Eintrag erstellen
        let journal = {};
        journal.memo = "Mitgliederbeitrag " + sJahr + " von " + data.debtor.name;
        journal.date = new Date();
        journal.amount = 30;
        journal.from_account = 31;
        journal.to_account = 21;
        journal.receipt = undefined;

        await Journal.create(journal)
            .then(resp => {
                let jahrCost = new Date(resp.date).getFullYear();
                const pathname = global.documents + jahrCost + '/';
                if (!fs.existsSync(pathname)) {
                    fs.mkdirSync(pathname);
                    fs.mkdirSync(pathname + '/receipt');
                }
                const receipt =  'receipt/' + 'Journal-' + resp.id + '.pdf';
        
                if (fs.existsSync(global.uploads + filename)) {
                    fs.copyFileSync(global.uploads + filename, pathname + receipt);
                    
                    Journal.update({receipt: receipt}, {where: {id: resp.id}})
                        .then(resp2 => {
                            res.json({
                                type: "info",
                                message: "QR-Rechnung erstellt und versendet"
                            });                
                        })
                        .catch(e => next(e));						
                } else {
                    res.json({
                        type: "error",
                        message: "QR-Rechnung erstellt und versendet. Konnte File nicht kopieren und an den Journaleintrag hängen"
                    })
                }
            })
            .catch(e => {
                console.error(e);
                res.json({
                    type: "error",
                    message: "QR-Rechnung erstellt und versendet, Journaleintrag fehlt",
                    filename: filename,
                    retVal: retVal,
                    error: e
                });
            });
    },

    sendEmail: async function (req, res, next) {
        const email = JSON.parse(req.body);

        const retVal = await fncSendEmail(email);
        res.json(retVal);

    },
}

async function fncSendEmail(email) {
    console.log(email);
    let email_from = global.gConfig.defaultEmail;
    if (email.email_signature != "") {
        email_from = email.email_signature;
        let email_signature = fs.readFileSync(global.assets + email.email_signature + ".html")
        email.email_body += "<p>" + email_signature + "</p>";
    }
    // console.log(email);
    let emailConfig = global.gConfig[email_from];
    console.log(emailConfig);

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
        } else {
            console.log("Server is ready to take our messages");
        }
    });

    let attachments = []

    if (email.uploadFiles) {
        let files = email.uploadFiles.split(',');
        for (let ind2 = 0; ind2 < files.length; ind2++) {
            const file = files[ind2];
            attachments.push({ filename: file, path: global.uploads + file });
        }
    }

    await transporter.sendMail({
        from: emailConfig.email_from, // sender address
        to: email.email_an, // list of receivers
        cc: email.email_cc,
        bcc: email.email_bcc,
        attachments: attachments,
        subject: email.email_subject, // Subject line
        text: decodeURI(email.email_body), // plain text body
        html: email.email_body, // html body
        dsn: {
            id: 'AMC',
            return: 'headers',
            notify: ['failure', 'delay'],
            recipient: emailConfig.email_from
        }
    }, (err, info) => {
        if (err) {
            console.log(err);
            return err;
        }
        console.log(info);
        transporter.close();
        return info;
    });
}
