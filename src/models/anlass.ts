import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Meisterschaft, MeisterschaftId } from './meisterschaft';

export interface AnlassAttributes {
  id: number;
  datum: string;
  name: string;
  beschreibung?: string;
  punkte?: number;
  istkegeln: boolean;
  istsamanlass: boolean;
  nachkegeln: boolean;
  gaeste?: number;
  anlaesseid?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  status: number;
  longname: string;
}

export type AnlassPk = "id";
export type AnlassId = Anlass[AnlassPk];
export type AnlassOptionalAttributes = "id" | "name" | "beschreibung" | "punkte" | "gaeste" | "anlaesseid" | "createdAt" | "updatedAt" | "status" | "longname";
export type AnlassCreationAttributes = Optional<AnlassAttributes, AnlassOptionalAttributes>;

export class Anlass extends Model<AnlassAttributes, AnlassCreationAttributes> implements AnlassAttributes {
  id!: number | undefined;
  datum!: string;
  name!: string;
  beschreibung?: string;
  punkte?: number;
  istkegeln!: boolean;
  istsamanlass!: boolean;
  nachkegeln!: boolean;
  gaeste?: number;
  anlaesseid?: number | undefined;
  createdAt!: Date;
  updatedAt!: Date;
  status!: number;
  longname!: string;
  vorjahr!: number;

  // Anlaesse belongsTo Anlaesse via anlaesseid
  anlaesse!: Anlass;
  getAnlass!: Sequelize.BelongsToGetAssociationMixin<Anlass>;
  setAnlass!: Sequelize.BelongsToSetAssociationMixin<Anlass, AnlassId>;
  createAnlass!: Sequelize.BelongsToCreateAssociationMixin<Anlass>;
  // Anlaesse hasMany Meisterschaft via eventid
  meisterschafts!: Meisterschaft[];
  getMeisterschafts!: Sequelize.HasManyGetAssociationsMixin<Meisterschaft>;
  setMeisterschafts!: Sequelize.HasManySetAssociationsMixin<Meisterschaft, MeisterschaftId>;
  addMeisterschaft!: Sequelize.HasManyAddAssociationMixin<Meisterschaft, MeisterschaftId>;
  addMeisterschafts!: Sequelize.HasManyAddAssociationsMixin<Meisterschaft, MeisterschaftId>;
  createMeisterschaft!: Sequelize.HasManyCreateAssociationMixin<Meisterschaft>;
  removeMeisterschaft!: Sequelize.HasManyRemoveAssociationMixin<Meisterschaft, MeisterschaftId>;
  removeMeisterschafts!: Sequelize.HasManyRemoveAssociationsMixin<Meisterschaft, MeisterschaftId>;
  hasMeisterschaft!: Sequelize.HasManyHasAssociationMixin<Meisterschaft, MeisterschaftId>;
  hasMeisterschafts!: Sequelize.HasManyHasAssociationsMixin<Meisterschaft, MeisterschaftId>;
  countMeisterschafts!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Anlass {
    return Anlass.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      datum: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      beschreibung: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      punkte: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      istkegeln: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      istsamanlass: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      nachkegeln: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      gaeste: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0
      },
      anlaesseid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'anlaesse',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1
      },
      longname: {
        type: DataTypes.STRING(250),
        allowNull: false
      },
      createdAt: '',
      updatedAt: ''
    }, {
    sequelize,
    tableName: 'anlaesse',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "anlaesse_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fki_anlaesse_fk",
        fields: [
          { name: "anlaesseid" },
        ]
      },
      {
        name: "public_anlaesse_datum0_idx",
        fields: [
          { name: "datum" },
        ]
      },
      {
        name: "public_anlaesse_longname1_idx",
        fields: [
          { name: "longname" },
        ]
      },
    ]
  });
  }
}
