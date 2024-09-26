import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './user';

export interface SessionAttributes {
  id: number;
  sid: string;
  userid?: string;
  expires?: Date;
  data?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type SessionPk = "id";
export type SessionId = Session[SessionPk];
export type SessionOptionalAttributes = "id" | "sid" | "userid" | "expires" | "data" | "createdAt" | "updatedAt";
export type SessionCreationAttributes = Optional<SessionAttributes, SessionOptionalAttributes>;

export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  id!: number;
  sid!: string;
  userid?: string;
  expires?: Date;
  data?: string;
  createdAt!: Date;
  updatedAt?: Date;

  // Session belongsTo User via userid
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Session {
    return Session.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: "session_sid"
      },
      userid: {
        type: DataTypes.STRING(45),
        allowNull: true,
        references: {
          model: 'user',
          key: 'userid'
        }
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: ''
    }, {
    sequelize,
    tableName: 'sessions',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "public_sessions_id0_idx",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "public_sessions_sid1_idx",
        unique: true,
        fields: [
          { name: "sid" },
        ]
      },
      {
        name: "session_sid",
        unique: true,
        fields: [
          { name: "sid" },
        ]
      },
      {
        name: "sessions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
