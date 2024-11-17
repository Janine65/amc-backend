import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Kegelkasse, KegelkasseId } from './kegelkasse';

export interface UserAttributes {
  id?: number;
  userid: string;
  name?: string;
  email: string;
  salt?: string;
  password: string;
  role: string;
  last_login?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id" | "userid" | "name" | "email" | "salt" | "password" | "role" | "last_login" | "createdAt" | "updatedAt";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  id?: number;
  userid!: string;
  name?: string;
  email!: string;
  salt?: string;
  password!: string;
  role!: string;
  last_login?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // User hasMany Kegelkasse via userid
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

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: "userid_uq"      
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: "email_uq"
    },
    salt: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "user"
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "email_uq",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "public_user_email1_idx",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "public_user_userid0_idx",
        unique: true,
        fields: [
          { name: "userid" },
        ]
      },
      {
        name: "user_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "userid_uq",
        unique: true,
        fields: [
          { name: "userid" },
        ]
      },
    ]
  });
  }
}
