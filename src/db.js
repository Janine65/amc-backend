const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = global.sequelize;

class Adressen extends Model {
}
Adressen.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  mnr: {
    type: DataTypes.INTEGER,
    allowNull: true,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "") {
        this.setDataValue('mnr', null);
      } else {
        this.setDataValue('mnr', value);
      }
    }
  },
  geschlecht: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "")
        this.setDataValue('geschlecht', 1);
      else
        this.setDataValue('geschlecht', value);
    }
  },
  name: { type: DataTypes.STRING, allowNull: false },
  vorname: { type: DataTypes.STRING, allowNull: false },
  adresse: { type: DataTypes.STRING, allowNull: false },
  plz: { type: DataTypes.INTEGER, allowNull: false },
  ort: { type: DataTypes.STRING, allowNull: false },
  land: { type: DataTypes.STRING, allowNull: false, defaultValue: "CH" },
  telefon_p: DataTypes.STRING,
  telefon_g: DataTypes.STRING,
  mobile: DataTypes.STRING,
  email: DataTypes.STRING,
  eintritt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  sam_mitglied: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1
  },
  jahresbeitrag: DataTypes.DECIMAL(19, 2),
  mnr_sam: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "")
        this.setDataValue('mnr_sam', null);
      else
        this.setDataValue('mnr_sam', value);
    }
  },
  vorstand: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },
  ehrenmitglied: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },
  revisor: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },
  austritt: {
    type: DataTypes.DATEONLY,
    defaultValue: new Date("01.01.3000")
  },
  austritt_mail: {
    type: DataTypes.BOOLEAN
  },
  adressenid: {
    type: DataTypes.INTEGER,
    references: {
      model: Adressen,
      key: 'id'
    },
    defaultValue: null,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "")
        this.setDataValue('adressenid', null);
      else
        this.setDataValue('adressenid', value);
    }
  },
  allianz: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },
  notes: DataTypes.STRING,
  fullname: {
    type: DataTypes.VIRTUAL,
    noUpdate: true,
  }
},
  {
    sequelize,
    tableName: 'adressen',
    modelName: 'adressen',
    //indexes: [{ unique: true, fields: ['name', 'vorname', 'ort'] }]
  });

class Anlaesse extends Model {
}
Anlaesse.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  datum: { type: DataTypes.DATEONLY, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  beschreibung: { type: DataTypes.STRING, allowNull: true },
  punkte: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },
  istkegeln: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
  nachkegeln: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
  istsamanlass: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
  gaeste: {
    type: DataTypes.INTEGER, allowNull: true, defaultValue: null,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "")
        this.setDataValue('gaeste', null);
      else
        this.setDataValue('gaeste', value);
    }
  },
  anlaesseid: {
    type: DataTypes.INTEGER, allowNull: true,
    references: {
      model: Anlaesse,
      key: 'id'
    },
    defaultValue: null,
  },
  longname: {
    type: DataTypes.STRING,
    noUpdate: true,
  },
  status: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
},
  {
    sequelize,
    tableName: 'anlaesse',
    modelName: 'anlaesse',
    indexes: [{ unique: true, fields: ['datum', 'name'] }]
  }
);

class Meisterschaft extends Model {
}
Meisterschaft.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  mitgliedid: {
    type: DataTypes.INTEGER,
    references: {
      model: Adressen,
      key: 'id'
    }
  },
  eventid: {
    type: DataTypes.INTEGER,
    references: {
      model: Anlaesse,
      key: 'id'
    }
  },
  punkte: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  wurf1: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wurf2: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wurf3: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wurf4: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wurf5: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  zusatz: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streichresultat: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_kegel: {
    type: DataTypes.INTEGER,
    // set() {
    //   throw new Error('Do not try to set the total_kegel value!');
    // }
  }
},
  {
    sequelize,
    tableName: 'meisterschaft',
    modelName: 'meisterschaft'
  }
);
class Clubmeister extends Model {
}
Clubmeister.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  jahr: { type: DataTypes.STRING, allowNull: false },
  rang: { type: DataTypes.INTEGER, allowNull: false },
  vorname: { type: DataTypes.STRING, allowNull: false },
  nachname: { type: DataTypes.STRING, allowNull: false },
  mitgliedid: { type: DataTypes.INTEGER, allowNull: false },
  punkte: { type: DataTypes.INTEGER, allowNull: false },
  anlaesse: { type: DataTypes.INTEGER, allowNull: false },
  werbungen: { type: DataTypes.INTEGER, allowNull: false },
  mitglieddauer: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.INTEGER, allowNull: false },
},
  {
    sequelize,
    tableName: 'clubmeister',
    modelName: 'clubmeister'
  }
);


class Kegelmeister extends Model {
}
Kegelmeister.init({
  jahr: { type: DataTypes.STRING, allowNull: false },
  rang: { type: DataTypes.INTEGER, allowNull: false },
  vorname: { type: DataTypes.STRING, allowNull: false },
  nachname: { type: DataTypes.STRING, allowNull: false },
  mitgliedid: { type: DataTypes.INTEGER, allowNull: false },
  punkte: { type: DataTypes.INTEGER, allowNull: false },
  anlaesse: { type: DataTypes.INTEGER, allowNull: false },
  babeli: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.INTEGER, allowNull: false },
},
  {
    sequelize,
    tableName: 'kegelmeister',
    modelName: 'kegelmeister'
  }
);

Adressen.belongsTo(Adressen, { foreignKey: 'adressenid' });
Adressen.hasMany(Adressen, { foreignKey: 'adressenid' });

Anlaesse.belongsTo(Anlaesse, { as: 'linkedEvent', foreignKey: 'anlaesseid' });
Anlaesse.hasMany(Meisterschaft, { foreignKey: 'eventid' });
Meisterschaft.belongsTo(Anlaesse, { as: 'linkedEvent', constraints: true, foreignKey: 'eventid' });
Meisterschaft.belongsTo(Adressen, { as: 'teilnehmer', constraints: true, foreignKey: 'mitgliedid' });
Adressen.hasMany(Meisterschaft, { foreignKey: 'mitgliedid' });


class Parameter extends Model {
}
Parameter.init({
  key: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
},
  {
    sequelize,
    tableName: 'parameter',
    modelName: 'parameter'
  }
);


class FiscalYear extends Model {

}
FiscalYear.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  year: DataTypes.STRING,
  name: DataTypes.STRING,
  state: DataTypes.INTEGER,
},
  {
    sequelize,
    tableName: 'fiscalyear',
    modelName: 'fiscalyear'
  });


class Account extends Model {

}
Account.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  level: DataTypes.INTEGER,
  order: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  longname: DataTypes.STRING
},
  {
    sequelize,
    tableName: 'account',
    modelName: 'account'
  });

class Journal extends Model {
}
Journal.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  from_account: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id'
    }
  },
  to_account: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id'
    }
  },
  date: DataTypes.DATEONLY,
  memo: DataTypes.STRING,
  journalno: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    set(value) {
      // einen empty String zu Null konvertieren
      if (value == "")
        this.setDataValue('journalno', null);
      else
        this.setDataValue('journalno', value);
    }
  },
  amount: DataTypes.DECIMAL(7, 2),
  status: DataTypes.INTEGER
},
  {
    sequelize,
    tableName: 'journal',
    modelName: 'journal'
  });
class Receipt extends Model {
}
Receipt.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  receipt: DataTypes.STRING,
  bezeichnung: DataTypes.STRING,
  jahr: DataTypes.STRING
},
  {
    sequelize,
    tableName: 'receipt',
    modelName: 'receipt'
  });

class JournalReceipt extends Model {
}
JournalReceipt.init({
},
  {
    sequelize,
    tableName: 'journal_receipt',
    modelName: 'journalreceipt',
    timestamps: false
  });

Journal.belongsTo(Account, { as: 'fromAccount', constraints: true, foreignKey: 'from_account' });
Journal.belongsTo(Account, { as: 'toAccount', constraints: true, foreignKey: 'to_account' });
Receipt.belongsToMany(Journal, { as: 'journals', through: JournalReceipt, foreignKey: 'journalid', otherKey: 'receiptid' });
Receipt.hasMany(JournalReceipt, { as: 'receipt2journal', constraints: true, foreignKey: 'receiptid' });
Journal.belongsToMany(Receipt, { as: 'receipts', through: JournalReceipt, foreignKey: 'receiptid', otherKey: 'journalid' });
Journal.hasMany(JournalReceipt, { as: 'journal2receipt', constraints: true, foreignKey: 'journalid' });
Account.hasMany(Journal, { as: 'fromAccount', constraints: true, foreignKey: 'from_account' });
Account.hasMany(Journal, { as: 'toAccount', constraints: true, foreignKey: 'to_account' });

class Budget extends Model {
}
Budget.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  account: {
    type: DataTypes.INTEGER,
    references: {
      model: Account,
      key: 'id'
    }
  },
  year: DataTypes.INTEGER,
  memo: DataTypes.STRING,
  amount: DataTypes.DECIMAL(7, 2),
},
  {
    sequelize,
    tableName: 'budget',
    modelName: 'budget'
  });

Budget.belongsTo(Account, { as: "acc", constraints: true, foreignKey: 'account' });
Account.hasMany(Budget, { constraints: true, foreignKey: 'account' });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  userid: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin', 'revisor'), default: 'user' },
  last_login: DataTypes.DATE
},
  {
    defaultScope: {
      // exclude hash by default
      attributes: { exclude: ['password'] }
    },
    scopes: {
      // include hash with this scope
      withHash: { attributes: {}, }
    },
    tableName: 'user',
    modelName: 'user'

  });

class Kegelkasse extends Model {
}
Kegelkasse.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  datum: DataTypes.DATEONLY,
  kasse: DataTypes.DECIMAL(7, 2),
  rappen5: DataTypes.INTEGER,
  rappen10: DataTypes.INTEGER,
  rappen20: DataTypes.INTEGER,
  rappen50: DataTypes.INTEGER,
  franken1: DataTypes.INTEGER,
  franken2: DataTypes.INTEGER,
  franken5: DataTypes.INTEGER,
  franken10: DataTypes.INTEGER,
  franken20: DataTypes.INTEGER,
  franken50: DataTypes.INTEGER,
  franken100: DataTypes.INTEGER,
  total: DataTypes.DECIMAL(7, 2),
  differenz: DataTypes.DECIMAL(7, 2),
  cntUsers: DataTypes.VIRTUAL
},
  {
    sequelize,
    tableName: 'kegelkasse',
    modelName: 'kegelkasse'

  })
Kegelkasse.belongsTo(Journal, { as: "journal", constraints: true, foreignKey: 'journalid' })

Kegelkasse.belongsTo(User, { as: "user", constraints: true, foreignKey: 'userid' });
User.hasMany(Kegelkasse, { constraints: true, foreignKey: 'userid' });

module.exports = {
  User,
  Adressen, Anlaesse, Parameter, Meisterschaft, Clubmeister, Kegelkasse, Kegelmeister, Account, Journal, FiscalYear, Budget, Receipt, JournalReceipt,
};

