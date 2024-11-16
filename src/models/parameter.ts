import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ParameterAttributes {
  id: number | undefined;
  key?: string;
  value?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ParameterPk = "id";
export type ParameterId = Parameter[ParameterPk];
export type ParameterOptionalAttributes = "id" | "key" | "value" | "createdAt" | "updatedAt";
export type ParameterCreationAttributes = Optional<ParameterAttributes, ParameterOptionalAttributes>;

export class Parameter extends Model<ParameterAttributes, ParameterCreationAttributes> implements ParameterAttributes {
  id!: number | undefined;
  key!: string;
  value!: string;
  createdAt!: Date;
  updatedAt!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Parameter {
    return Parameter.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      key: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: "parameter_unique"
      },
      value: {
        type: DataTypes.STRING(2000),
        allowNull: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
    sequelize,
    tableName: 'parameter',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "parameter_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "parameter_unique",
        unique: true,
        fields: [
          { name: "key" },
        ]
      },
      {
        name: "public_parameter_id0_idx",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "public_parameter_key1_idx",
        fields: [
          { name: "key" },
        ]
      },
    ]
  });
  }
}
