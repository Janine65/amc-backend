import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { JournalReceipt, JournalReceiptReceiptId } from './journalReceipt';

export interface ReceiptAttributes {
  id: number;
  receipt: string;
  createdAt?: Date;
  updatedAt?: Date;
  jahr?: string;
  bezeichnung?: string;
}

export type ReceiptPk = "id";
export type ReceiptId = Receipt[ReceiptPk];
export type ReceiptOptionalAttributes = "id" | "createdAt" | "updatedAt" | "jahr" | "bezeichnung";
export type ReceiptCreationAttributes = Optional<ReceiptAttributes, ReceiptOptionalAttributes>;

export class Receipt extends Model<ReceiptAttributes, ReceiptCreationAttributes> implements ReceiptAttributes {
  id!: number;
  receipt!: string;
  createdAt?: Date;
  updatedAt?: Date;
  jahr?: string;
  bezeichnung?: string;

  // Receipt hasMany JournalReceipt via receiptid
  journalReceipts!: JournalReceipt[];
  getJournalReceipts!: Sequelize.HasManyGetAssociationsMixin<JournalReceipt>;
  setJournalReceipts!: Sequelize.HasManySetAssociationsMixin<JournalReceipt, JournalReceiptReceiptId>;
  addJournalReceipt!: Sequelize.HasManyAddAssociationMixin<JournalReceipt, JournalReceiptReceiptId>;
  addJournalReceipts!: Sequelize.HasManyAddAssociationsMixin<JournalReceipt, JournalReceiptReceiptId>;
  createJournalReceipt!: Sequelize.HasManyCreateAssociationMixin<JournalReceipt>;
  removeJournalReceipt!: Sequelize.HasManyRemoveAssociationMixin<JournalReceipt, JournalReceiptReceiptId>;
  removeJournalReceipts!: Sequelize.HasManyRemoveAssociationsMixin<JournalReceipt, JournalReceiptReceiptId>;
  hasJournalReceipt!: Sequelize.HasManyHasAssociationMixin<JournalReceipt, JournalReceiptReceiptId>;
  hasJournalReceipts!: Sequelize.HasManyHasAssociationsMixin<JournalReceipt, JournalReceiptReceiptId>;
  countJournalReceipts!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Receipt {
    return Receipt.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    receipt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    jahr: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    bezeichnung: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'receipt',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "receipt_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
