import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Budget, BudgetId } from './budget';
import type { Journal, JournalId } from './journal';

export interface AccountAttributes {
  id?: number;
  name?: string;
  level?: number;
  order?: number;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
  longname?: string;
}

export type AccountPk = "id";
export type AccountId = Account[AccountPk];
export type AccountOptionalAttributes = "id" | "name" | "level" | "order" | "status" | "createdAt" | "updatedAt" | "longname";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  id?: number;
  name?: string;
  level?: number;
  order?: number;
  status?: number;
  createdAt?: Date;
  updatedAt?: Date;
  longname?: string;

  // Account hasMany Budget via account
  budgets!: Budget[];
  getBudgets!: Sequelize.HasManyGetAssociationsMixin<Budget>;
  setBudgets!: Sequelize.HasManySetAssociationsMixin<Budget, BudgetId>;
  addBudget!: Sequelize.HasManyAddAssociationMixin<Budget, BudgetId>;
  addBudgets!: Sequelize.HasManyAddAssociationsMixin<Budget, BudgetId>;
  createBudget!: Sequelize.HasManyCreateAssociationMixin<Budget>;
  removeBudget!: Sequelize.HasManyRemoveAssociationMixin<Budget, BudgetId>;
  removeBudgets!: Sequelize.HasManyRemoveAssociationsMixin<Budget, BudgetId>;
  hasBudget!: Sequelize.HasManyHasAssociationMixin<Budget, BudgetId>;
  hasBudgets!: Sequelize.HasManyHasAssociationsMixin<Budget, BudgetId>;
  countBudgets!: Sequelize.HasManyCountAssociationsMixin;
  // Account hasMany Journal via fromAccount
  fromAccountjournals!: Journal[];
  getFromAccountJournals!: Sequelize.HasManyGetAssociationsMixin<Journal>;
  setFromAccountJournals!: Sequelize.HasManySetAssociationsMixin<Journal, JournalId>;
  addFromAccountJournal!: Sequelize.HasManyAddAssociationMixin<Journal, JournalId>;
  addFromAccountJournals!: Sequelize.HasManyAddAssociationsMixin<Journal, JournalId>;
  createFromAccountJournal!: Sequelize.HasManyCreateAssociationMixin<Journal>;
  removeFromAccountJournal!: Sequelize.HasManyRemoveAssociationMixin<Journal, JournalId>;
  removeFromAccountJournals!: Sequelize.HasManyRemoveAssociationsMixin<Journal, JournalId>;
  hasFromAccountJournal!: Sequelize.HasManyHasAssociationMixin<Journal, JournalId>;
  hasFromAccountJournals!: Sequelize.HasManyHasAssociationsMixin<Journal, JournalId>;
  countFromAccountJournals!: Sequelize.HasManyCountAssociationsMixin;
  // Account hasMany Journal via toAccount
  toAccountJournals!: Journal[];
  getToAccountJournals!: Sequelize.HasManyGetAssociationsMixin<Journal>;
  setToAccountJournals!: Sequelize.HasManySetAssociationsMixin<Journal, JournalId>;
  addToAccountJournal!: Sequelize.HasManyAddAssociationMixin<Journal, JournalId>;
  addToAccountJournals!: Sequelize.HasManyAddAssociationsMixin<Journal, JournalId>;
  createToAccountJournal!: Sequelize.HasManyCreateAssociationMixin<Journal>;
  removeToAccountJournal!: Sequelize.HasManyRemoveAssociationMixin<Journal, JournalId>;
  removeToAccountJournals!: Sequelize.HasManyRemoveAssociationsMixin<Journal, JournalId>;
  hasToAccountJournal!: Sequelize.HasManyHasAssociationMixin<Journal, JournalId>;
  hasToAccountJournals!: Sequelize.HasManyHasAssociationsMixin<Journal, JournalId>;
  countToAccountJournals!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Account {
    return Account.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      longname: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            return this.level + ' ' + this.name;
        },
        set() {
          this.setDataValue('longname', this.level + ' ' + this.name);
        },
      },
    }, {
    sequelize,
    tableName: 'account',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "account_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
