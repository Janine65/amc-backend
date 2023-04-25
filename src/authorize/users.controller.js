const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('./validate-request');
const authorize = require('./authorize')
const userService = require('../controllers/user.service');
const exportsFnc = require('../controllers/exports')

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, authorize(), register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/newpass', newPass);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(JSON.parse(req.body))
        .then(user => res.json(user))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        role: Joi.string().required()
    });
    validateRequest(req, next, schema);
}
function newPass(req, res, next) {
    userService.setNewPwd(req.query.email)
        .then((retVal) => {
            const newPass = retVal.newPass;
            const user = retVal.user;
            const emailBody = {
                email_signature: 'JanineFranken',
                email_an: req.query.email,
                email_cc: '',
                email_bcc: '',
                email_subject: 'AMC Interna - Neues Passwort gesetzt',
                email_body: 'Hallo ' + user.name + '<br/>Dein Passwort wurde ersetzt mit ' + newPass + '<br/>Bitte setze nach dem Login ein neues Passwort!'
            }
            JSON.parse(req.body) = emailBody
            exportsFnc.sendEmail(req, res, next)
                .then(() => res.json({ message: 'Passwort erfolgreich gesetzt und Mail gesendet' }))
                .catch(next);
            
        })
        .catch(next);
}

function register(req, res, next) {
    userService.create(JSON.parse(req.body))
        .then((retVal) => {
            const newPass = retVal.newPass;
            const user = retVal.newUser;
            // send Welcome Mail
            let emailBody = {
                email_signature: 'JanineFranken',
                email_an: user.email,
                email_cc: '',
                email_bcc: '',
                email_subject: 'AMC Interna - Willkommen',
                email_body: 'Hallo ' + user.name + '<br/>Willkommen auf der Applikation für den Auto-Moto-Club Swissair. Dies ist eine interne Applikation und darf nicht in unberechtigte Hände gelangen.<br/>Mit freundlichen Grüssen'
            }
            JSON.parse(req.body) = emailBody
            exportsFnc.sendEmail(req, res, next)
                .then(() => {
                // send Password Mail
                emailBody.email_body = 'Hallo ' + user.name + '<br/>Hier dein Passwort: ' + newPass + '<br/>Bitte setze nach dem Login ein neues Passwort!';
                emailBody.email_subject = 'AMC Interna - Neues Passwort gesetzt';
                
                JSON.parse(req.body) = emailBody
                exportsFnc.sendEmail(req, res, next)
                    .then(() => res.json({ message: 'Registrierung erfolgreich und Mail an ' + user.email + ' gesendet' }))
                    .catch(next);
                    })
                })
            .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().empty(''),
        email: Joi.string().empty(''),
        password: Joi.string().min(6).empty(''),
        role: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, JSON.parse(req.body))
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}