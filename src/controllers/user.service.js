const config = require('../../config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { v4: uuid } = require('uuid');

module.exports = {
    authenticate,
    setNewPwd,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)))
        throw new Error('Email oder Passwort nicht korrekt');

    // authentication successful
    // set lastLogin
    
    user.last_login = new Date();
    await user.save();

    // create token
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function setNewPwd(email) {
    let user = await db.User.findOne({ where: { email } });
    if (!user)
        throw new Error('Email nicht bekannt');

    const newPass =  await generateNewPass()
    user.password = await bcrypt.hash(newPass, 10);
    
    await user.save()

    return {newPass, user}
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw new Error('Username "' + params.email + '" is already taken');
    }

    // hash password
    let newPass = params.password;
    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    } else {
        newPass =  await generateNewPass()
        params.password = await bcrypt.hash(newPass, 10);
    }
    params.userid = uuid();

    // save user
    let newUser = await db.User.create(params);

    return {newUser, newPass};
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.email && user.email !== params.email;
    if (usernameChanged && await db.User.findOne({ where: { email: params.email } })) {
        throw new Error('Username "' + params.email + '" is already taken');
    }

    // hash password if it was entered
    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    console.log(user)
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('User not found');
    return user;
}

function omitHash(user) {
    const { password, ...userWithoutHash } = user;
    return userWithoutHash;
}

async function generateNewPass() {
    let length = 10,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    newPass = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        newPass += charset.charAt(Math.floor(Math.random() * n));
    }
    return newPass;

}