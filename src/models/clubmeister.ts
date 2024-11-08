import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Adresse, AdresseId } from './adresse';

export interface ClubmeisterAttributes {
  id?: number;
  jahr: string;
  rang?: number;
  vorname?: string;
  nachname?: string;
  mitgliedid?: number | undefined;
  punkte?: number;
  anlaesse?: number;
  werbungen?: number;
  mitglieddauer?: number;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
}               

export type ClubmeisterPk = "id";
export type ClubmeisterId = Clubmeister[ClubmeisterPk];
export type ClubmeisterOptionalAttributes = "id" | "jahr" | "rang" | "vorname" | "nachname" | "mitgliedid" | "punkte" | "anlaesse" | "werbungen" | "mitglieddauer" | "createdAt" | "updatedAt" | "status";
export type ClubmeisterCreationAttributes = Optional<ClubmeisterAttributes, ClubmeisterOptionalAttributes>;

export class Clubmeister extends Model<ClubmeisterAttributes, ClubmeisterCreationAttributes> implements ClubmeisterAttributes {
  id?: number;
  jahr!: string;
  rang?: number;
  vorname?: string;
  nachname?: string;
  mitgliedid?: number | undefined;
  punkte?: number;
  anlaesse?: number;
  werbungen?: number;
  mitglieddauer?: number;
  createdAt!: Date;
  updatedAt!: Date;
  status!: boolean;

  // Clubmeister belongsTo Adressen via mitgliedid
  mitglied!: Adresse;
  getMitglied!: Sequelize.BelongsToGetAssociationMixin<Adresse>;
  setMitglied!: Sequelize.BelongsToSetAssociationMixin<Adresse, AdresseId>;
  createMitglied!: Sequelize.BelongsToCreateAssociationMixin<Adresse>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Clubmeister {
    return Clubmeister.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      jahr: {
        type: DataTypes.STRING(4),
        allowNull: false,
        unique: "clubmeister_unique"
      },
      rang: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        unique: "clubmeister_unique"
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
        allowNull: true,
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
      werbungen: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      mitglieddauer: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'clubmeister',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "clubmeister_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "clubmeister_unique",
        unique: true,
        fields: [
          { name: "jahr" },
          { name: "rang" },
        ]
      },
      {
        name: "fki_mitgliedId_fk",
        fields: [
          { name: "mitgliedid" },
        ]
      },
      {
        name: "public_clubmeister_jahr0_idx",
        unique: true,
        fields: [
          { name: "jahr" },
          { name: "rang" },
        ]
      },
      {
        name: "public_clubmeister_mitgliedid1_idx",
        fields: [
          { name: "mitgliedid" },
        ]
      },
    ]
  });
  }
}
