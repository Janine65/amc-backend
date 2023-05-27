const express = require('express');
const router = express.Router();
const authorize = require('./authorize');
const exportService = require('../controllers/exports');
const fiscalyearService = require('../controllers/fiscalyear');
const accountService = require('../controllers/account');
const journalService = require('../controllers/journal');
const budgetService = require('../controllers/budget');
//const multer = require('multer') // v1.0.5
//const upload = multer() // for parsing multipart/form-data

// routes
router.get('/fiscalyear/data', authorize(), fiscalyearService.getData);
router.post('/fiscalyear/data', authorize(), fiscalyearService.addData);
router.put('/fiscalyear/data', authorize(), fiscalyearService.updateData);
router.delete('/fiscalyear/data', authorize(), fiscalyearService.removeData);
router.get('/fiscalyear/getFkData', authorize(), fiscalyearService.getFKData);
router.get('/fiscalyear/getOneData', fiscalyearService.getOneData);
router.get('/fiscalyear/export', authorize(), exportService.writeExcelData);
router.post('/fiscalyear/close', authorize(), fiscalyearService.closeYear);

router.get('/account/data', authorize(), accountService.getData);
router.get('/account/alldata', authorize(), accountService.getAllData);
router.post('/account/data', authorize(), accountService.addData);
router.put('/account/data', authorize(), accountService.updateData);
router.delete('/account/data', authorize(), accountService.removeData);
router.get('/account/getFkData', authorize(), accountService.getFKData);
router.get('/account/showData', authorize(), accountService.getAccountSummary);
router.get('/account/export', authorize(), exportService.writeAccountToExcel);
router.get('/account/getOneDataByOrder', authorize(), accountService.getOneDataByOrder);


router.get('/journal/data', authorize(), journalService.getData);
router.post('/journal/data', authorize(), journalService.addData);
router.put('/journal/data', authorize(), journalService.updateData);
router.delete('/journal/data', authorize(), journalService.removeData);
router.post('/journal/import', authorize(), journalService.importJournal);
router.get('/journal/getAccData', authorize(), journalService.getAccData);
router.put('/journal/addR2J', authorize(), journalService.addReceipt2Journal)
router.post('/journal/addAtt', authorize(), journalService.addAttachment);
router.post('/journal/addReceipt', authorize(), journalService.addReceipt);
router.put('/journal/updReceipt', authorize(), journalService.updReceipt);
router.post('/journal/delReceipt', authorize(), journalService.delReceipt);

router.delete('/journal/delAtt', authorize(), journalService.delAttachment);
router.get('/journal/getAtt', authorize(), journalService.getAttachment);
router.get('/journal/getAllAtt', authorize(), journalService.getAllAttachment);
router.get('/journal/export', authorize(), exportService.writeJournal);

router.get('/budget/data', authorize(), budgetService.getData);
router.post('/budget/data', authorize(), budgetService.addData);
router.put('/budget/data', authorize(), budgetService.updateData);
router.delete('/budget/data', authorize(), budgetService.removeData);
router.get('/budget/getOne', authorize(), budgetService.getOneData);

module.exports = router;