import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Adresse, AdresseId } from './adresse';

export interface KegelmeisterAttributes {
  id?: number;
  jahr: string;
  rang?: number;
  vorname?: string;
  nachname?: string;
  mitgliedid?: number;
  punkte?: number;
  anlaesse?: number;
  babeli?: number;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
}

export type KegelmeisterPk = "id";
export type KegelmeisterId = Kegelmeister[KegelmeisterPk];
export type KegelmeisterOptionalAttributes = "id" | "jahr" | "rang" | "vorname" | "nachname" | "mitgliedid" | "punkte" | "anlaesse" | "babeli" | "createdAt" | "updatedAt" | "status";
export type KegelmeisterCreationAttributes = Optional<KegelmeisterAttributes, KegelmeisterOptionalAttributes>;

export class Kegelmeister extends Model<KegelmeisterAttributes, KegelmeisterCreationAttributes> implements KegelmeisterAttributes {
  id?: number;
  jahr!: string;
  rang?: number;
  vorname?: string;
  nachname?: string;
  mitgliedid?: number;
  punkte?: number;
  anlaesse?: number;
  babeli?: number;
  createdAt!: Date;
  updatedAt!: Date;
  status!: boolean;

  // Kegelmeister belongsTo Adressen via mitgliedid
  mitglied!: Adresse;
  getMitglied!: Sequelize.BelongsToGetAssociationMixin<Adresse>;
  setMitglied!: Sequelize.BelongsToSetAssociationMixin<Adresse, AdresseId>;
  createMitglied!: Sequelize.BelongsToCreateAssociationMixin<Adresse>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Kegelmeister {
    return Kegelmeister.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      jahr: {
        type: DataTypes.STRING(4),
        allowNull: false,
        unique: "kegelmeister_unique"
      },
      rang: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        unique: "kegelmeister_unique"
      },
      vorname: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      nachname: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mitgliedid: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        references: {
          model: 'adressen',
          key: 'id'
        }
      },
      punkte: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      anlaesse: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      babeli: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
    sequelize,
    tableName: 'kegelmeister',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "fkik_mitgliedId_fk",
        fields: [
          { name: "mitgliedid" },
        ]
      },
      {
        name: "kegelmeister_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "kegelmeister_unique",
        unique: true,
        fields: [
          { name: "jahr" },
          { name: "rang" },
        ]
      },
    ]
  });
  }
}
