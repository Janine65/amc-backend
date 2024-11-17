import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Journal, JournalId } from './journal';
import type { User, UserId } from './user';

export interface KegelkasseAttributes {
  id?: number;
  datum: string;
  kasse: number;
  rappen5: number;
  rappen10: number;
  rappen20: number;
  rappen50: number;
  franken1: number;
  franken2: number;
  franken5: number;
  franken10: number;
  franken20: number;
  franken50: number;
  franken100: number;
  total: number;
  differenz: number;
  journalid?: number | undefined;
  createdAt?: Date;
  updatedAt?: Date;
  userid?: number | undefined;
  cntUsers?: number;
}

export type KegelkassePk = "id";
export type KegelkasseId = Kegelkasse[KegelkassePk];
export type KegelkasseOptionalAttributes = "id" | "journalid" | "createdAt" | "updatedAt" | "userid";
export type KegelkasseCreationAttributes = Optional<KegelkasseAttributes, KegelkasseOptionalAttributes>;

export class Kegelkasse extends Model<KegelkasseAttributes, KegelkasseCreationAttributes> implements KegelkasseAttributes {
  id?: number;
  datum!: string;
  kasse!: number;
  rappen5!: number;
  rappen10!: number;
  rappen20!: number;
  rappen50!: number;
  franken1!: number;
  franken2!: number;
  franken5!: number;
  franken10!: number;
  franken20!: number;
  franken50!: number;
  franken100!: number;
  total!: number;
  differenz!: number;
  journalid?: number | undefined;
  createdAt!: Date;
  updatedAt!: Date;
  userid?: number | undefined;
  cntUsers?: number;

  // Kegelkasse belongsTo Journal via journalid
  journal!: Journal;
  getJournal!: Sequelize.BelongsToGetAssociationMixin<Journal>;
  setJournal!: Sequelize.BelongsToSetAssociationMixin<Journal, JournalId>;
  createJournal!: Sequelize.BelongsToCreateAssociationMixin<Journal>;
  // Kegelkasse belongsTo User via userid
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Kegelkasse {
    return Kegelkasse.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      datum: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: "date_uq"
      },
      kasse: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      rappen5: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rappen10: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rappen20: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rappen50: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken1: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken2: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken5: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken10: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken20: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken50: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      franken100: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      total: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      differenz: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      journalid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'journal',
          key: 'id'
        }
      },
      userid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        }
      },
    }, {
    sequelize,
    tableName: 'kegelkasse',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "date_uq",
        unique: true,
        fields: [
          { name: "datum" },
        ]
      },
      {
        name: "kegelkasse_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
