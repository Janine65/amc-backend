// Import the 'express' module
import { systemVal } from '@/utils/system'
import { existsSync, mkdirSync } from 'node:fs';
import { logger } from '@utils/logger';

import config from '@config/config.json';

const defaultConfig = config.development;
const environment = process.env.NODE_ENV ?? 'development';
const environmentConfig = environment == 'development' ? defaultConfig : config.production;
const finalConfig = {...defaultConfig, ...environmentConfig};

systemVal.gConfig = finalConfig;

// instantiate app class
import AuthController from '@controllers/auth.controller'
import UserController from '@controllers/user.controller'
import ParameterController from '@controllers/parameter.controller'
import AdresseController from '@controllers/adresse.controller'
import AnlassController from '@controllers/anlass.controller'
import AccountController from '@controllers/account.controller'
import BudgetController from '@controllers/budget.controller'
import ClubmeisterController from '@controllers/clubmeister.controller'
import KegelmeisterController from '@controllers/kegelmeister.controller'
import FiscalyearController from '@controllers/fiscalyear.controller'
import JournalController from '@controllers/journal.controller'
import MeisterschaftController from '@controllers/meisterschaft.controller'
import KegelkasseController from '@controllers/kegelkasse.controller'
import ReceiptController from '@controllers/receipt.controller';
import JournalReceiptController from '@controllers/journalReceipt.controller';


let path =  __dirname + "/documents/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.documents = path

path =  __dirname + "/public/uploads/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.uploads = path

path = __dirname + "/public/exports/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.exports = path

path = __dirname + "/public/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.public = path

path = __dirname + "/public/assets/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.assets = path

path =  __dirname + "/logs/"
if (!existsSync(path)) 
  mkdirSync(path);
systemVal.log_dir = path

// log global.system.gConfig
logger.info(`systemVal.gConfig: ${JSON.stringify(systemVal.gConfig, undefined, systemVal.gConfig.json_indentation)}`);

import App from './app'

const app = new App(
  [
    new UserController(),
    new AuthController(),
    new ParameterController(),
    new AdresseController(),
    new AnlassController(),
    new AccountController(),
    new BudgetController(),
    new ClubmeisterController(),
    new KegelmeisterController(),
    new FiscalyearController(),
    new JournalController(),
    new MeisterschaftController(),
    new KegelkasseController(),
    new ReceiptController(),
    new JournalReceiptController(),
  ]
);

app.listen();