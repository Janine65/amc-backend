import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Budget, BudgetId } from './budget';
import type { Journal, JournalId } from './journal';

export interface FiscalyearAttributes {
  id?: number;
  name?: string;
  state?: number;
  createdAt: Date;
  updatedAt: Date;
  year?: number;
}

export type FiscalyearPk = "id";
export type FiscalyearId = Fiscalyear[FiscalyearPk];
export type FiscalyearOptionalAttributes = "id" | "name" | "state" | "createdAt" | "updatedAt" | "year";
export type FiscalyearCreationAttributes = Optional<FiscalyearAttributes, FiscalyearOptionalAttributes>;

export class Fiscalyear extends Model<FiscalyearAttributes, FiscalyearCreationAttributes> implements FiscalyearAttributes {
  id?: number;
  name?: string;
  state?: number;
  createdAt!: Date;
  updatedAt!: Date;
  year?: number;

  // Fiscalyear hasMany Budget via year
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
  // Fiscalyear hasMany Journal via year
  journals!: Journal[];
  getJournals!: Sequelize.HasManyGetAssociationsMixin<Journal>;
  setJournals!: Sequelize.HasManySetAssociationsMixin<Journal, JournalId>;
  addJournal!: Sequelize.HasManyAddAssociationMixin<Journal, JournalId>;
  addJournals!: Sequelize.HasManyAddAssociationsMixin<Journal, JournalId>;
  createJournal!: Sequelize.HasManyCreateAssociationMixin<Journal>;
  removeJournal!: Sequelize.HasManyRemoveAssociationMixin<Journal, JournalId>;
  removeJournals!: Sequelize.HasManyRemoveAssociationsMixin<Journal, JournalId>;
  hasJournal!: Sequelize.HasManyHasAssociationMixin<Journal, JournalId>;
  hasJournals!: Sequelize.HasManyHasAssociationsMixin<Journal, JournalId>;
  countJournals!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Fiscalyear {
    return Fiscalyear.init({
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
      state: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: "fiscalyear_unique"
      },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'fiscalyear',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "fiscalyear_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fiscalyear_unique",
        unique: true,
        fields: [
          { name: "year" },
        ]
      },
    ]
  });
  }
}
