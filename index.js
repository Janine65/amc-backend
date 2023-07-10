
const express = require('express');
const cors = require('cors')

const helmet = require('helmet');
const path = require("path");
const _ = require("./src/cipher");
const http = require("http");
const { Sequelize } = require('sequelize');
const errorHandler = require('./src/authorize/error-handler')
const { exit } = require('process');
const formidable = require('formidable');
const fs = require("fs")

// environment variables
if (process.env.NODE_ENV == undefined)
  process.env.NODE_ENV = 'development';

global.documents = __dirname + "/documents/"
global.uploads = __dirname + "/public/uploads/"
global.exports = __dirname + "/public/exports/"
global.public = __dirname + "/public/"
global.assets = __dirname + "/public/assets/"

require('./config/config')
const app = express();

const whitelist = ['http://localhost:4200', 'http://interna.neu.automoto-sr.info', 'https://interna.neu.automoto-sr.info', 'http://olconet:4200','http://olconet:2700',]
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
    console.log('CORS denied', req.header('Origin'))
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors(corsOptionsDelegate))
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', global.gConfig.webhost);
  res.setHeader('Access-Control-Allow-Methods', "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Authorization, Accept');
  next();
});

// fileupload router
app.post('/upload', function (req, res, next) {
  const form = formidable({ 
    multiples: true,
    maxFileSize: 1024 * 1024 * 1024,
    keepExtensions: true,
    uploadDir: global.uploads,
        // Use it to control newFilename.              
        filename: (name, ext, part, form) => {
          return part.originalFilename; // Will be joined with options.uploadDir.
      }
   });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    res.json({ status: 'ok', message: 'file uplaoded', fields, files });
  });
  }
);

app.get('/download', function(req, res) {
  const filename = global.exports + '/' + req.query.filename;  
  res.sendFile(filename);
});

const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  transports: [
    new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error', timestamp: true }),
    new winston.transports.File({ filename: path.join('logs', 'info.log'), level: 'info', timestamp: true }),
    new winston.transports.File({ filename: path.join('logs', 'combined.log'), timestamp: true }),
  ],
});



(async () => {
  const conn = new Sequelize(global.gConfig.database, global.gConfig.db_user, global.cipher.decrypt(global.gConfig.db_pwd), {
    host: global.gConfig.dbhost,
    port: global.gConfig.port,
    dialect: global.gConfig.dbtype,
    logging: (msg) => logger.info(msg),
  });
  global.sequelize = conn;

  global.connected = false;
  let retries = 5;
  while (retries) {
    try {
      await global.sequelize.authenticate();
      global.connected = true;
      break;
    } catch (err) {
      console.log(err);
      retries -= 1;
      console.log(`retries left: ${retries}`)
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (!global.connected)
    exit(1)
    

})();

const db = require("./src/db")

app.use("/", express.static(path.join(__dirname, '/public')));

let expireDate = new Date();
expireDate.setDate(expireDate.getDate() + 1);

app.use(helmet());

app.use('/users', require('./src/authorize/users.controller'));
app.use('/club', require('./src/authorize/club.controller'));
app.use('/journal', require('./src/authorize/journal.controller'));

app.use(errorHandler);

app.get('/', function (req, res) {
  res.json({ status: 'ok', message: 'alive' });
})

app.get('/system/env', function (req, res) {
  res.json({ env: process.env.NODE_ENV });
})
const exportData = require("./src/controllers/exports");
app.post('/system/sendmail', exportData.sendEmail);


const parameter = require("./src/controllers/parameter");
app.get('/parameter/data', parameter.getData);
app.post('/parameter/data', parameter.updateData);
app.put('/parameter/data', parameter.updateData);
app.get('/parameter/getOneDataByKey', parameter.getOneDataByKey);

global.Parameter = new Map();
parameter.getGlobal();
require('./src/system')

console.log(global.Parameter);

process.stdout.on('error', function (err) {
  if (err.code == "EPIPE") {
    process.exit(0);
  }
});

http.createServer(app).listen(global.gConfig.node_port, () => {
  console.log('%s listening on port %d in %s mode - Version %s', global.gConfig.app_name, global.gConfig.node_port, app.settings.env, global.system.version);
});

