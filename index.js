
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')

const helmet = require('helmet');
const path = require("path");
const _ = require("./src/cipher");
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data
const http = require("http");
const fileUpload = require('express-fileupload');
const { Sequelize } = require('sequelize');
const errorHandler = require('./src/authorize/error-handler')
const { exit } = require('process');

// environment variables
if (process.env.NODE_ENV == undefined)
  process.env.NODE_ENV = 'development';

global.documents = __dirname + "/documents/"
global.uploads = __dirname + "/public/uploads/"
global.exports = __dirname + "/public/exports/"
global.public = "/uploads/"

const cfg = require('./config/config')
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cors())

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

app.set('trust proxy', 1) // trust first proxy
app.use(express.json());
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
app.post('/parameter/data', upload.array(), parameter.updateData);
app.put('/parameter/data', upload.array(), parameter.updateData);
app.get('/parameter/getOneDataByKey', parameter.getOneDataByKey);

global.Parameter = new Map();
parameter.getGlobal();
require('./src/system')

console.log(global.Parameter);


// fileupload router
app.use(fileUpload({ debug: true, useTempFiles: true, tempFileDir: '/tmp/' }));

app.post('/uploadFiles', fncUploadFiles);

function fncUploadFiles(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    console.error('status 400 : No files were uploaded');
    res.send('{"status" : "server", "error" : "status 400 : No files were uploaded"}');
    return;
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let uploadFiles = req.files.upload;

  // Use the mv() method to place the file somewhere on your server
  let newFileName = path.join(__dirname, '/public/uploads/' + uploadFiles.name);
  uploadFiles.mv(newFileName, function (err) {
    if (err) {
      console.error(err);
      res.send('{"status" : "error", "error" : "' + err + '"}');
      return;
    }
    res.send('{"status" : "server", "sname" : "' + newFileName + '"}');
  });
}

process.stdout.on('error', function (err) {
  if (err.code == "EPIPE") {
    process.exit(0);
  }
});

http.createServer(app).listen(global.gConfig.node_port, () => {
  console.log('%s listening on port %d in %s mode - Version %s', global.gConfig.app_name, global.gConfig.node_port, app.settings.env, global.system.version);
});

