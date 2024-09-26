import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Account, AccountId } from './account';
import type { Fiscalyear, FiscalyearId } from './fiscalyear';
import type { JournalReceipt, JournalReceiptJournalId } from './journalReceipt';
import type { Kegelkasse, KegelkasseId } from './kegelkasse';

export interface JournalAttributes {
  id?: number;
  from_account?: number;
  to_account?: number;
  date?: Date;
  memo?: string;
  journalno?: number;
  amount?: number;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
  year?: number;
  receipts?: JournalReceipt[];
}

export type JournalPk = "id";
export type JournalId = Journal[JournalPk];
export type JournalOptionalAttributes = "id" | "from_account" | "to_account" | "date" | "memo" | "journalno" | "amount" | "status" | "createdAt" | "updatedAt" | "year";
export type JournalCreationAttributes = Optional<JournalAttributes, JournalOptionalAttributes>;

export class Journal extends Model<JournalAttributes, JournalCreationAttributes> implements JournalAttributes {
  id!: number;
  from_account?: number;
  to_account?: number;
  date?: Date;
  memo?: string;
  journalno?: number;
  amount?: number;
  status?: number;
  createdAt!: Date;
  updatedAt!: Date;
  year?: number;
  receipts?: JournalReceipt[];

  // Journal belongsTo Account via from_account
  fromAccountAccount!: Account;
  getFromAccountAccount!: Sequelize.BelongsToGetAssociationMixin<Account>;
  setFromAccountAccount!: Sequelize.BelongsToSetAssociationMixin<Account, AccountId>;
  createFromAccountAccount!: Sequelize.BelongsToCreateAssociationMixin<Account>;
  // Journal belongsTo Account via to_account
  toAccountAccount!: Account;
  getToAccountAccount!: Sequelize.BelongsToGetAssociationMixin<Account>;
  setToAccountAccount!: Sequelize.BelongsToSetAssociationMixin<Account, AccountId>;
  createToAccountAccount!: Sequelize.BelongsToCreateAssociationMixin<Account>;
  // Journal belongsTo Fiscalyear via year
  yearFiscalyear!: Fiscalyear;
  getYearFiscalyear!: Sequelize.BelongsToGetAssociationMixin<Fiscalyear>;
  setYearFiscalyear!: Sequelize.BelongsToSetAssociationMixin<Fiscalyear, FiscalyearId>;
  createYearFiscalyear!: Sequelize.BelongsToCreateAssociationMixin<Fiscalyear>;
  // Journal hasMany JournalReceipt via journalid
  journalReceipts!: JournalReceipt[];
  getJournalReceipts!: Sequelize.HasManyGetAssociationsMixin<JournalReceipt>;
  setJournalReceipts!: Sequelize.HasManySetAssociationsMixin<JournalReceipt, JournalReceiptJournalId>;
  addJournalReceipt!: Sequelize.HasManyAddAssociationMixin<JournalReceipt, JournalReceiptJournalId>;
  addJournalReceipts!: Sequelize.HasManyAddAssociationsMixin<JournalReceipt, JournalReceiptJournalId>;
  createJournalReceipt!: Sequelize.HasManyCreateAssociationMixin<JournalReceipt>;
  removeJournalReceipt!: Sequelize.HasManyRemoveAssociationMixin<JournalReceipt, JournalReceiptJournalId>;
  removeJournalReceipts!: Sequelize.HasManyRemoveAssociationsMixin<JournalReceipt, JournalReceiptJournalId>;
  hasJournalReceipt!: Sequelize.HasManyHasAssociationMixin<JournalReceipt, JournalReceiptJournalId>;
  hasJournalReceipts!: Sequelize.HasManyHasAssociationsMixin<JournalReceipt, JournalReceiptJournalId>;
  countJournalReceipts!: Sequelize.HasManyCountAssociationsMixin;
  // Journal hasMany Kegelkasse via journalid
  kegelkasses!: Kegelkasse[];
  getKegelkasses!: Sequelize.HasManyGetAssociationsMixin<Kegelkasse>;
  setKegelkasses!: Sequelize.HasManySetAssociationsMixin<Kegelkasse, KegelkasseId>;
  addKegelkass!: Sequelize.HasManyAddAssociationMixin<Kegelkasse, KegelkasseId>;
  addKegelkasses!: Sequelize.HasManyAddAssociationsMixin<Kegelkasse, KegelkasseId>;
  createKegelkass!: Sequelize.HasManyCreateAssociationMixin<Kegelkasse>;
  removeKegelkass!: Sequelize.HasManyRemoveAssociationMixin<Kegelkasse, KegelkasseId>;
  removeKegelkasses!: Sequelize.HasManyRemoveAssociationsMixin<Kegelkasse, KegelkasseId>;
  hasKegelkass!: Sequelize.HasManyHasAssociationMixin<Kegelkasse, KegelkasseId>;
  hasKegelkasses!: Sequelize.HasManyHasAssociationsMixin<Kegelkasse, KegelkasseId>;
  countKegelkasses!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Journal {
    return Journal.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      from_account: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'account',
          key: 'id'
        }
      },
      to_account: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'account',
          key: 'id'
        }
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      memo: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      journalno: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0.00
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'fiscalyear',
          key: 'year'
        }
      },
      // receipts: {
      //   type: DataTypes.VIRTUAL,
      //   async get() {
      //     const receipts = await this.getJournalReceipts();
      //     return receipts;
      //   },
      //   set(value) {
      //     throw new Error('Do not try to set the `receipts` value!');
      //   },        
      // },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'journal',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "fki_journal_year",
        fields: [
          { name: "year" },
        ]
      },
      {
        name: "journal_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "public_journal_from_account0_idx",
        fields: [
          { name: "from_account" },
        ]
      },
      {
        name: "public_journal_to_account1_idx",
        fields: [
          { name: "to_account" },
        ]
      },
    ]
  });
  }
}
