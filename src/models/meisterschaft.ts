import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Adresse, AdresseId } from './adresse';
import type { Anlass, AnlassId } from './anlass';

export interface MeisterschaftAttributes {
  id: number;
  mitgliedid: number;
  eventid: number;
  punkte?: number | null;
  wurf1?: number | null;
  wurf2?: number | null;
  wurf3?: number | null;
  wurf4?: number | null;
  wurf5?: number | null;
  zusatz?: number | null;
  streichresultat?: boolean;
  createdAt: Date;
  updatedAt: Date;
  total_kegel: number | null;
}

export type MeisterschaftPk = "id";
export type MeisterschaftId = Meisterschaft[MeisterschaftPk];
export type MeisterschaftOptionalAttributes = "id" | "mitgliedid" | "eventid" | "punkte" | "wurf1" | "wurf2" | "wurf3" | "wurf4" | "wurf5" | "zusatz" | "streichresultat" | "createdAt" | "updatedAt" | "total_kegel";
export type MeisterschaftCreationAttributes = Optional<MeisterschaftAttributes, MeisterschaftOptionalAttributes>;

export class Meisterschaft extends Model<MeisterschaftAttributes, MeisterschaftCreationAttributes> implements MeisterschaftAttributes {
  id!: number;
  mitgliedid!: number;
  eventid!: number;
  punkte?: number;
  wurf1?: number;
  wurf2?: number;
  wurf3?: number;
  wurf4?: number;
  wurf5?: number;
  zusatz?: number;
  streichresultat?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  total_kegel!: number | null;
  teilnehmer!: number;

  // Meisterschaft belongsTo Adressen via mitgliedid
  mitglied!: Adresse;
  getMitglied!: Sequelize.BelongsToGetAssociationMixin<Adresse>;
  setMitglied!: Sequelize.BelongsToSetAssociationMixin<Adresse, AdresseId>;
  createMitglied!: Sequelize.BelongsToCreateAssociationMixin<Adresse>;
  // Meisterschaft belongsTo Anlaesse via eventid
  event!: Anlass;
  getEvent!: Sequelize.BelongsToGetAssociationMixin<Anlass>;
  setEvent!: Sequelize.BelongsToSetAssociationMixin<Anlass, AnlassId>;
  createEvent!: Sequelize.BelongsToCreateAssociationMixin<Anlass>;
  countEvent!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Meisterschaft {
    return Meisterschaft.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      mitgliedid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        references: {
          model: 'adressen',
          key: 'id'
        },
        unique: "eventmitglied"
      },
      eventid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        references: {
          model: 'anlaesse',
          key: 'id'
        },
        unique: "eventmitglied"
      },
      punkte: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      wurf1: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      wurf2: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      wurf3: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      wurf4: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      wurf5: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      zusatz: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5
      },
      streichresultat: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      total_kegel: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'meisterschaft',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "eventmitglied",
        unique: true,
        fields: [
          { name: "mitgliedid" },
          { name: "eventid" },
        ]
      },
      {
        name: "meisterschaft_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "public_meisterschaft_mitgliedid0_idx",
        unique: true,
        fields: [
          { name: "mitgliedid" },
          { name: "eventid" },
        ]
      },
    ]
  });
  }
}
