
import express from 'express';
import cors from 'cors';

import helmet from 'helmet';
import path from "path";
import _ from "./src/cipher";
import http from "http";
import { Sequelize } from 'sequelize';
import errorHandler from './src/authorize/error-handler';
import { exit } from 'process';
import { formidable, Part }  from 'formidable';

import pkg from "./package.json";

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

const whitelist = ['http://localhost:4200', 'https://interna.automoto-sr.info', 'https://interna.neu.automoto-sr.info', 'http://olconet:4200','http://olconet:2700',]
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

app.use(express.text({limit: 52428800}));
app.use(express.json({limit: 52428800}));
app.use(express.urlencoded({extended: true, limit: 52428800}));

app.use(cors(corsOptionsDelegate));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', global.gConfig.webhost);
  res.setHeader('Access-Control-Allow-Methods', "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers,Access-Control-Allow-Methods,Access-Control-Allow-Origin, Origin, X-Requested-With, Content-Type, Authorization, Accept');
  next();
});

// fileupload router
app.post('/upload', function (req, res, next) {
  const form = formidable({ 
    multiples: true,
    maxFileSize: 500 * 1024 * 1024,
    keepExtensions: true,
    uploadDir: global.uploads,
    // Use it to control newFilename.              
    filename: (name: string, ext: string, part:Part, form:IncomingForm):string => {
          return part.originalFilename ?? ''; // Will be joined with options.uploadDir.
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

app.get('/download', function(req, res, next) {
  const filename = global.exports + '/' + req.query.filename;  
  res.sendFile(filename);
});

app.get('/about', function(req, res, next) {
  res.json(pkg);

});
(async () => {
  global.sequelize = new Sequelize(global.gConfig.database, global.gConfig.db_user, global.cipher.decrypt(global.gConfig.db_pwd), {
    host: global.gConfig.dbhost,
    port: global.gConfig.port,
    dialect: global.gConfig.dbtype,
  });

  global.connected = false;
  let retries = 5;
  while (retries) {
    try {
      await global.sequelize.authenticate();
      global.connected = true;
      require("./src/db");
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

app.use("/", express.static(path.join(__dirname, '/public')));

let expireDate = new Date();
expireDate.setDate(expireDate.getDate() + 1);

app.use(helmet());

app.use('/users', require('./src/authorize/users.controller'));
app.use('/club', require('./src/authorize/club.controller'));
app.use('/journal', require('./src/authorize/journal.controller'));

app.use(errorHandler);

app.get('/', function (req, res, next) {
  res.json({ status: 'ok', message: 'alive' });
});

app.get('/system/env', function (req, res, next) {
  res.json({ env: process.env.NODE_ENV });
});
const exportData = require("./src/controllers/exports");
app.post('/system/sendmail', exportData.sendEmail);


import parameter from "./src/controllers/parameter";
import IncomingForm from 'formidable/Formidable';
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

