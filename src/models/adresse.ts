import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Clubmeister, ClubmeisterId } from './clubmeister';
import type { Kegelmeister, KegelmeisterId } from './kegelmeister';
import type { Meisterschaft, MeisterschaftId } from './meisterschaft';

export interface AdresseAttributes {
  id?: number;
  mnr?: number;
  geschlecht: number;
  name: string;
  vorname: string;
  adresse: string;
  plz: number;
  ort: string;
  land: string;
  telefon_p?: string;
  telefon_g?: string;
  mobile?: string;
  email?: string;
  eintritt?: string;
  sam_mitglied: boolean;
  jahresbeitrag?: number;
  mnr_sam?: number;
  createdAt?: Date;
  updatedAt?: Date;
  vorstand: boolean;
  ehrenmitglied: boolean;
  veteran1: boolean;
  veteran2: boolean;
  revisor: boolean;
  motojournal: boolean;
  austritt?: string;
  austritt_mail: boolean;
  adressenid?: number | undefined;
  jahrgang?: number;
  arbeitgeber?: string;
  pensioniert: boolean;
  allianz: boolean;
  notes?: string;
  fullname?: string;
}

export type AdressePk = "id";
export type AdresseId = Adresse[AdressePk];
export type AdresseOptionalAttributes = "id" | "mnr" | "geschlecht" | "name" | "vorname" | "adresse" | "ort" | "land" | "telefon_p" | "telefon_g" | "mobile" | "email" | "eintritt" | "jahresbeitrag" | "mnr_sam" | "createdAt" | "updatedAt" | "austritt" | "adressenid" | "jahrgang" | "arbeitgeber" | "notes" | "fullname";
export type AdresseCreationAttributes = Optional<AdresseAttributes, AdresseOptionalAttributes>;

export class Adresse extends Model<AdresseAttributes, AdresseCreationAttributes> implements AdresseAttributes {
  id?: number;
  mnr?: number;
  geschlecht!: number;
  name!: string;
  vorname!: string;
  adresse!: string;
  plz!: number;
  ort!: string;
  land!: string;
  telefon_p?: string;
  telefon_g?: string;
  mobile?: string;
  email?: string;
  eintritt?: string;
  sam_mitglied!: boolean;
  jahresbeitrag?: number;
  mnr_sam?: number;
  createdAt?: Date;
  updatedAt?: Date;
  vorstand!: boolean;
  ehrenmitglied!: boolean;
  veteran1!: boolean;
  veteran2!: boolean;
  revisor!: boolean;
  motojournal!: boolean;
  austritt?: string;
  austritt_mail!: boolean;
  adressenid?: number | undefined;
  jahrgang?: number;
  brummEmail!: boolean;
  arbeitgeber?: string;
  pensioniert!: boolean;
  allianz!: boolean;
  notes?: string;
  fullname?: string;

  // Adressen belongsTo Adressen via adressenid
  adressen!: Adresse;
  getAdresse!: Sequelize.BelongsToGetAssociationMixin<Adresse>;
  setAdresse!: Sequelize.BelongsToSetAssociationMixin<Adresse, AdresseId>;
  createAdresse!: Sequelize.BelongsToCreateAssociationMixin<Adresse>;
  countAdressen!: Sequelize.HasManyCountAssociationsMixin;
  // Adressen hasMany Clubmeister via mitgliedid
  clubmeisters!: Clubmeister[];
  getClubmeisters!: Sequelize.HasManyGetAssociationsMixin<Clubmeister>;
  setClubmeisters!: Sequelize.HasManySetAssociationsMixin<Clubmeister, ClubmeisterId>;
  addClubmeister!: Sequelize.HasManyAddAssociationMixin<Clubmeister, ClubmeisterId>;
  addClubmeisters!: Sequelize.HasManyAddAssociationsMixin<Clubmeister, ClubmeisterId>;
  createClubmeister!: Sequelize.HasManyCreateAssociationMixin<Clubmeister>;
  removeClubmeister!: Sequelize.HasManyRemoveAssociationMixin<Clubmeister, ClubmeisterId>;
  removeClubmeisters!: Sequelize.HasManyRemoveAssociationsMixin<Clubmeister, ClubmeisterId>;
  hasClubmeister!: Sequelize.HasManyHasAssociationMixin<Clubmeister, ClubmeisterId>;
  hasClubmeisters!: Sequelize.HasManyHasAssociationsMixin<Clubmeister, ClubmeisterId>;
  countClubmeisters!: Sequelize.HasManyCountAssociationsMixin;
  // Adressen hasMany Kegelmeister via mitgliedid
  kegelmeisters!: Kegelmeister[];
  getKegelmeisters!: Sequelize.HasManyGetAssociationsMixin<Kegelmeister>;
  setKegelmeisters!: Sequelize.HasManySetAssociationsMixin<Kegelmeister, KegelmeisterId>;
  addKegelmeister!: Sequelize.HasManyAddAssociationMixin<Kegelmeister, KegelmeisterId>;
  addKegelmeisters!: Sequelize.HasManyAddAssociationsMixin<Kegelmeister, KegelmeisterId>;
  createKegelmeister!: Sequelize.HasManyCreateAssociationMixin<Kegelmeister>;
  removeKegelmeister!: Sequelize.HasManyRemoveAssociationMixin<Kegelmeister, KegelmeisterId>;
  removeKegelmeisters!: Sequelize.HasManyRemoveAssociationsMixin<Kegelmeister, KegelmeisterId>;
  hasKegelmeister!: Sequelize.HasManyHasAssociationMixin<Kegelmeister, KegelmeisterId>;
  hasKegelmeisters!: Sequelize.HasManyHasAssociationsMixin<Kegelmeister, KegelmeisterId>;
  countKegelmeisters!: Sequelize.HasManyCountAssociationsMixin;
  // Adressen hasMany Meisterschaft via mitgliedid
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

  static initModel(sequelize: Sequelize.Sequelize): typeof Adresse {
    return Adresse.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mnr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "mnr_UNIQUE"
    },
    geschlecht: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    vorname: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    plz: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ort: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    land: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "CH"
    },
    telefon_p: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    telefon_g: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    eintritt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    sam_mitglied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    jahresbeitrag: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    mnr_sam: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    vorstand: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ehrenmitglied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    veteran1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    veteran2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    revisor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    motojournal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    austritt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: "3000-01-01"
    },
    austritt_mail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    adressenid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'adressen',
        key: 'id'
      }
    },
    jahrgang: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    arbeitgeber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    pensioniert: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    allianz: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fullname: {
      type: DataTypes.STRING(250),
      allowNull: true,
      get() {
          return this.vorname + ' ' + this.name;
      },
      set() {
        this.setDataValue('fullname', this.vorname + ' ' + this.name);
      },
    }
  }, {
    sequelize,
    tableName: 'adressen',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "adressen_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fki_addresse_fk",
        fields: [
          { name: "adressenid" },
        ]
      },
      {
        name: "mnr_UNIQUE",
        unique: true,
        fields: [
          { name: "mnr" },
        ]
      },
      {
        name: "public_adressen_adresse1_idx",
        fields: [
          { name: "adresse" },
        ]
      },
      {
        name: "public_adressen_fullname5_idx",
        fields: [
          { name: "fullname" },
        ]
      },
      {
        name: "public_adressen_geschlecht2_idx",
        fields: [
          { name: "geschlecht" },
        ]
      },
      {
        name: "public_adressen_mnr0_idx",
        unique: true,
        fields: [
          { name: "mnr" },
        ]
      },
      {
        name: "public_adressen_name3_idx",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "public_adressen_plz4_idx",
        fields: [
          { name: "plz" },
        ]
      },
    ]
  });
  }
}
