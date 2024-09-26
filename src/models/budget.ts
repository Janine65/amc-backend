import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Account, AccountId } from './account';
import type { Fiscalyear, FiscalyearId } from './fiscalyear';

export interface BudgetAttributes {
  id: number;
  account: number;
  year: number;
  memo?: string;
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetPk = "id";
export type BudgetId = Budget[BudgetPk];
export type BudgetOptionalAttributes = "id" | "memo" | "amount" | "createdAt" | "updatedAt";
export type BudgetCreationAttributes = Optional<BudgetAttributes, BudgetOptionalAttributes>;

export class Budget extends Model<BudgetAttributes, BudgetCreationAttributes> implements BudgetAttributes {
  id!: number;
  account!: number;
  year!: number;
  memo?: string;
  amount?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Budget belongsTo Account via account
  accountAccount!: Account;
  getAccountAccount!: Sequelize.BelongsToGetAssociationMixin<Account>;
  setAccountAccount!: Sequelize.BelongsToSetAssociationMixin<Account, AccountId>;
  createAccountAccount!: Sequelize.BelongsToCreateAssociationMixin<Account>;
  // Budget belongsTo Fiscalyear via year
  yearFiscalyear!: Fiscalyear;
  getYearFiscalyear!: Sequelize.BelongsToGetAssociationMixin<Fiscalyear>;
  setYearFiscalyear!: Sequelize.BelongsToSetAssociationMixin<Fiscalyear, FiscalyearId>;
  createYearFiscalyear!: Sequelize.BelongsToCreateAssociationMixin<Fiscalyear>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Budget {
    return Budget.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      account: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'account',
          key: 'id'
        },
        unique: "budget_unique"
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'fiscalyear',
          key: 'year'
        },
        unique: "budget_unique"
      },
      memo: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'budget',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "budget_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "budget_unique",
        unique: true,
        fields: [
          { name: "account" },
          { name: "year" },
        ]
      },
      {
        name: "public_budget_account0_idx",
        unique: true,
        fields: [
          { name: "account" },
          { name: "year" },
        ]
      },
      {
        name: "public_budget_account1_idx",
        fields: [
          { name: "account" },
        ]
      },
    ]
  });
  }
}
