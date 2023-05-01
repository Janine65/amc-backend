const express = require('express');
const router = express.Router();
const authorize = require('./authorize');
const exportService = require('../controllers/exports');
const adressService = require('../controllers/adresse');
const anlaesseService = require('../controllers/anlaesse');
const qrbill = require('../controllers/createbill');
const meisterschaftService = require('../controllers/meisterschaft');
const clubmeisterService = require('../controllers/clubmeister');
const kegelmeisterService = require('../controllers/kegelmeister');

// routes
router.get('/adressen/alldata', authorize(), adressService.getData);
router.get('/adressen/data', authorize(), adressService.getOneData);
router.post('/adressen/data', authorize(), adressService.updateData);
router.put('/adressen/data', authorize(), adressService.updateData);
router.delete('/adressen/data', authorize(), adressService.removeData);
router.get('/adressen/getFkData', authorize(), adressService.getFKData);
router.get('/adressen/overview', adressService.getOverviewData);
router.put('/adressen/export', authorize(), exportService.writeAdresses);
router.post('/adressen/email', authorize(), qrbill.sendEmail);
router.post('/adressen/qrbill', authorize(), qrbill.createQRBill);
router.post('/adressen/sendmail', authorize(), exportService.sendEmail);

router.get('/anlaesse/data', authorize(), anlaesseService.getData);
router.post('/anlaesse/data', authorize(), anlaesseService.updateData);
router.put('/anlaesse/data', authorize(), anlaesseService.updateData);
router.delete('/anlaesse/data', authorize(), anlaesseService.removeData);
router.get('/anlaesse/getFkData', authorize(), anlaesseService.getFKData);
router.get('/anlaesse/data/:id', authorize(), anlaesseService.getOneData);
router.get('/anlaesse/overview', anlaesseService.getOverviewData);
router.post('/anlaesse/sheet', authorize(), exportService.writeExcelTemplate);
router.post('/anlaesse/writeAuswertung', authorize(), exportService.writeAuswertung);

router.get('/meisterschaft/data', authorize(), meisterschaftService.getData);
router.post('/meisterschaft/data', authorize(), meisterschaftService.addData);
router.put('/meisterschaft/data', authorize(), meisterschaftService.updateData);
router.delete('/meisterschaft/data, authorize()', meisterschaftService.removeData);
router.get('/meisterschaft/getOneData', authorize(), meisterschaftService.getOneData);
router.get('/meisterschaft/mitglied', authorize(), meisterschaftService.getMitgliedData);
router.get('/meisterschaft/getChartData', authorize(), meisterschaftService.getChartData);
router.get('/meisterschaft/checkJahr', authorize(), meisterschaftService.checkJahr);

router.get('/clubmeister/data', authorize(), clubmeisterService.getData);
router.get('/clubmeister/refresh', authorize(), clubmeisterService.calcMeister);
router.get('/clubmeister/overview', clubmeisterService.getOverviewData);

router.get('/kegelmeister/data', authorize(), kegelmeisterService.getData);
router.get('/kegelmeister/refresh', authorize(), kegelmeisterService.calcMeister);
router.get('/kegelmeister/overview', kegelmeisterService.getOverviewData);

module.exports = router;