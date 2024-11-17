import type { Sequelize } from "sequelize";
import { Account as _Account } from "./account";
import type { AccountAttributes, AccountCreationAttributes } from "./account";
import { Adresse as _Adressen } from "./adresse";
import type { AdresseAttributes, AdresseCreationAttributes } from "./adresse";
import { Anlass as _Anlaesse } from "./anlass";
import type { AnlassAttributes, AnlassCreationAttributes } from "./anlass";
import { Budget as _Budget } from "./budget";
import type { BudgetAttributes, BudgetCreationAttributes } from "./budget";
import { Clubmeister as _Clubmeister } from "./clubmeister";
import type { ClubmeisterAttributes, ClubmeisterCreationAttributes } from "./clubmeister";
import { Fiscalyear as _Fiscalyear } from "./fiscalyear";
import type { FiscalyearAttributes, FiscalyearCreationAttributes } from "./fiscalyear";
import { Journal as _Journal } from "./journal";
import type { JournalAttributes, JournalCreationAttributes } from "./journal";
import { JournalReceipt as _JournalReceipt } from "./journalReceipt";
import type { JournalReceiptAttributes, JournalReceiptCreationAttributes } from "./journalReceipt";
import { Kegelkasse as _Kegelkasse } from "./kegelkasse";
import type { KegelkasseAttributes, KegelkasseCreationAttributes } from "./kegelkasse";
import { Kegelmeister as _Kegelmeister } from "./kegelmeister";
import type { KegelmeisterAttributes, KegelmeisterCreationAttributes } from "./kegelmeister";
import { Meisterschaft as _Meisterschaft } from "./meisterschaft";
import type { MeisterschaftAttributes, MeisterschaftCreationAttributes } from "./meisterschaft";
import { Parameter as _Parameter } from "./parameter";
import type { ParameterAttributes, ParameterCreationAttributes } from "./parameter";
import { Receipt as _Receipt } from "./receipt";
import type { ReceiptAttributes, ReceiptCreationAttributes } from "./receipt";
import { User as _User } from "./user";
import type { UserAttributes, UserCreationAttributes } from "./user";

export {
  _Account as Account,
  _Adressen as Adressen,
  _Anlaesse as Anlaesse,
  _Budget as Budget,
  _Clubmeister as Clubmeister,
  _Fiscalyear as Fiscalyear,
  _Journal as Journal,
  _JournalReceipt as JournalReceipt,
  _Kegelkasse as Kegelkasse,
  _Kegelmeister as Kegelmeister,
  _Meisterschaft as Meisterschaft,
  _Parameter as Parameter,
  _Receipt as Receipt,
  _User as User,
};

export type {
  AccountAttributes,
  AccountCreationAttributes,
  AdresseAttributes as AdressenAttributes,
  AdresseCreationAttributes as AdressenCreationAttributes,
  AnlassAttributes as AnlaesseAttributes,
  AnlassCreationAttributes as AnlaesseCreationAttributes,
  BudgetAttributes,
  BudgetCreationAttributes,
  ClubmeisterAttributes,
  ClubmeisterCreationAttributes,
  FiscalyearAttributes,
  FiscalyearCreationAttributes,
  JournalAttributes,
  JournalCreationAttributes,
  JournalReceiptAttributes,
  JournalReceiptCreationAttributes,
  KegelkasseAttributes,
  KegelkasseCreationAttributes,
  KegelmeisterAttributes,
  KegelmeisterCreationAttributes,
  MeisterschaftAttributes,
  MeisterschaftCreationAttributes,
  ParameterAttributes,
  ParameterCreationAttributes,
  ReceiptAttributes,
  ReceiptCreationAttributes,
  UserAttributes,
  UserCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Account = _Account.initModel(sequelize);
  const Adressen = _Adressen.initModel(sequelize);
  const Anlaesse = _Anlaesse.initModel(sequelize);
  const Budget = _Budget.initModel(sequelize);
  const Clubmeister = _Clubmeister.initModel(sequelize);
  const Fiscalyear = _Fiscalyear.initModel(sequelize);
  const Journal = _Journal.initModel(sequelize);
  const JournalReceipt = _JournalReceipt.initModel(sequelize);
  const Kegelkasse = _Kegelkasse.initModel(sequelize);
  const Kegelmeister = _Kegelmeister.initModel(sequelize);
  const Meisterschaft = _Meisterschaft.initModel(sequelize);
  const Parameter = _Parameter.initModel(sequelize);
  const Receipt = _Receipt.initModel(sequelize);
  const User = _User.initModel(sequelize);

  Budget.belongsTo(Account, { as: "accountAccount", foreignKey: "account"});
  Account.hasMany(Budget, { as: "budgets", foreignKey: "account"});
  Journal.belongsTo(Account, { as: "fromAccountAccount", foreignKey: "from_account"});
  Account.hasMany(Journal, { as: "fromAccountJournals", foreignKey: "from_account"});
  Journal.belongsTo(Account, { as: "toAccountAccount", foreignKey: "to_account"});
  Account.hasMany(Journal, { as: "toAccountJournals", foreignKey: "to_account"});
  Adressen.belongsTo(Adressen, { as: "adressen", foreignKey: "adressenid"});
  Adressen.hasMany(Adressen, { as: "adressenAdressens", foreignKey: "adressenid"});
  Clubmeister.belongsTo(Adressen, { as: "mitglied", foreignKey: "mitgliedid"});
  Adressen.hasMany(Clubmeister, { as: "clubmeisters", foreignKey: "mitgliedid"});
  Kegelmeister.belongsTo(Adressen, { as: "mitglied", foreignKey: "mitgliedid"});
  Adressen.hasMany(Kegelmeister, { as: "kegelmeisters", foreignKey: "mitgliedid"});
  Meisterschaft.belongsTo(Adressen, { as: "mitglied", foreignKey: "mitgliedid"});
  Adressen.hasMany(Meisterschaft, { as: "meisterschafts", foreignKey: "mitgliedid"});
  Anlaesse.belongsTo(Anlaesse, { as: "anlaesse", foreignKey: "anlaesseid"});
  Anlaesse.hasMany(Anlaesse, { as: "anlaesseAnlaesses", foreignKey: "anlaesseid"});
  Meisterschaft.belongsTo(Anlaesse, { as: "event", foreignKey: "eventid"});
  Anlaesse.hasMany(Meisterschaft, { as: "meisterschafts", foreignKey: "eventid"});
  Budget.belongsTo(Fiscalyear, { as: "yearFiscalyear", foreignKey: "year"});
  Fiscalyear.hasMany(Budget, { as: "budgets", foreignKey: "year"});
  Journal.belongsTo(Fiscalyear, { as: "yearFiscalyear", foreignKey: "year"});
  Fiscalyear.hasMany(Journal, { as: "journals", foreignKey: "year"});
  JournalReceipt.belongsTo(Journal, { as: "journal", foreignKey: "journalid"});
  Journal.hasMany(JournalReceipt, { as: "journalReceipts", foreignKey: "journalid"});
  Kegelkasse.belongsTo(Journal, { as: "journal", foreignKey: "journalid"});
  Journal.hasMany(Kegelkasse, { as: "kegelkasses", foreignKey: "journalid"});
  JournalReceipt.belongsTo(Receipt, { as: "receipt", foreignKey: "receiptid"});
  Receipt.hasMany(JournalReceipt, { as: "journalReceipts", foreignKey: "receiptid"});
  Kegelkasse.belongsTo(User, { as: "user", foreignKey: "userid"});
  User.hasMany(Kegelkasse, { as: "kegelkasses", foreignKey: "userid"});

  return {
    Account: Account,
    Adressen: Adressen,
    Anlaesse: Anlaesse,
    Budget: Budget,
    Clubmeister: Clubmeister,
    Fiscalyear: Fiscalyear,
    Journal: Journal,
    JournalReceipt: JournalReceipt,
    Kegelkasse: Kegelkasse,
    Kegelmeister: Kegelmeister,
    Meisterschaft: Meisterschaft,
    Parameter: Parameter,
    Receipt: Receipt,
    User: User,
  };
}
