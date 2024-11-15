// Import the 'express' module
import { systemVal } from  '@/utils/system'
import { logger } from '@utils/logger';

import App from './app'

// // instantiate app class
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

app.start();
systemVal.loadParams();
app.listen();