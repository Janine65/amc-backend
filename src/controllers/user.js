let crypto = require('crypto');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
const { User}  = require('../db');
const { v4: uuid } = require('uuid');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function (email, password, done) {
    User.findOne(
      {
        where: {
          email: email
        }
      })
      .then((user) => {
        if (user == null) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        let tempPwd = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('base64');
        if (user.password !== tempPwd) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        // fillup lastlogin
        return done(null, user);
      })
      .catch(e => next(e));
  }
));

function isValidPassword(password) {
  return password.length >= 8;
}

//uses a regex to check if email is valid
function isValidEmail(email) {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = {
  getData: function (req, res, next) {
    User.findAll({ attributes: ["id", "name", "email", "role", "last_login"] })
      .then(data => res.json(data))
      .catch(error => next(error));
  },

  updateData: function (req, res, next) {
    let data = JSON.parse(req.body);

    User.findByPk(data.id)
      .then((user) => {
        user.update(data)
          .then((obj) => res.json({ obj }))
          .catch(e => next(e))
      })
      .catch(e => next(e));

  },

  deleteData: function (req, res, next) {
    let data = JSON.parse(req.body);

    User.findByPk(data.id)
      .then((user) => {
        user.destroy()
          .then((obj) => res.json({ status: "ok" }))
          .catch(e => next(e))
      })
      .catch(e => next(e));

  },

  readUser: function (req, res, next) {
    let name = req.query.name;

    User.findOne({ where: { name: name }, attributes: ["id", "name", "email"] })
      .then((user) => {
        res.json(user)
      })
      .catch(e => next(e));

  },

  checkEmail: function (req, res, next) {
    let email = req.query.email;

    User.findOne({ where: { email: email }} )
      .then((user) => {
        res.json(user)
      })
      .catch(e => next(e));

  },

  updateProfle: function (req, res, next) {
    let data = JSON.parse(req.body);

    if (data.password != undefined && data.password != "" && !isValidPassword(data.password)) {
      res.json({ status: 'error', message: 'Password must be 8 or more characters.' });
      console.error('Password must be 8 or more charachters', res);
      return;
    }
    if (!isValidEmail(data.email)) {
      res.json({ status: 'error', message: 'Email address not formed correctly.' });
      console.error('Email address not formed correctly.', res);
      return;
    }


    User.findByPk(data.id)
      .then((user) => {
        let update = {}
        let hasChange = false
        if (data.password != undefined && data.password != "") {
          let password = crypto.pbkdf2Sync(data.password, user.salt, 10000, 64, 'sha512').toString('base64');
          if (password != user.password) {
            update.password = password;
            hasChange = true;
          }
        }
        if (data.name != user.name) {
          update.name = data.name;
          hasChange = true;
        }
        if (data.email != user.email) {
          update.email = data.email;
          hasChange = true;
        }

        if (hasChange) {
          user.update(update)
            .then(obj => res.json(obj))
            .catch(error => next(error));
        } else {
          res.json({ status: 'error', message: 'Profile not changed' });
          console.error('Profile not changed.', res);
        }
      })
      .catch(e => next(e));

  },

  registerView: function (req, res, next) {
    res.render('user/register', {});
  },

  loginUser: function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        return res.json({ status: 'error', message: info.message });
      }
      req.logIn(user, function (err2) {
        if (err2) { return next(err2); }
        user.last_login = Date.now();

        user.update({ last_login: user.last_login })
          .catch(e => next(e));
        req.session.user = user;
        return res.json(user);
      });
    })(req, res, next);
  },

  registerPost: function (req, res, next) {
    let salt = crypto.randomBytes(64).toString('hex');
    let password = crypto.pbkdf2Sync(JSON.parse(req.body).password, salt, 10000, 64, 'sha512').toString('base64');

    if (!isValidPassword(JSON.parse(req.body).password)) {
      res.json({ status: 'error', message: 'Password must be 8 or more characters.' });
      console.error('Password must be 8 or more charachters', res);
      return;
    }
    if (!isValidEmail(JSON.parse(req.body).email)) {
      res.json({ status: 'error', message: 'Email address not formed correctly.' });
      console.error('Email address not formed correctly.', res);
      return;
    }

    let userid = uuid();


    User.create({
      userid: userid,
      name: JSON.parse(req.body).name,
      email: JSON.parse(req.body).email,
      role: JSON.parse(req.body).role,
      password: password,
      salt: salt
    })
      .then((obj) => res.json({ id: obj.id }))
      .catch((err) => next(err));

  }
};