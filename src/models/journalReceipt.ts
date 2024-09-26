import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Journal, JournalId } from './journal';
import type { Receipt, ReceiptId } from './receipt';

export interface JournalReceiptAttributes {
  journalid?: number;
  receiptid?: number;
}

export type JournalReceiptJournalId = JournalReceipt["journalid"]
export type JournalReceiptReceiptId = JournalReceipt["receiptid"]
export type JournalReceiptOptionalAttributes = "journalid" | "receiptid";
export type JournalReceiptCreationAttributes = Optional<JournalReceiptAttributes, JournalReceiptOptionalAttributes>;

export class JournalReceipt extends Model<JournalReceiptAttributes, JournalReceiptCreationAttributes> implements JournalReceiptAttributes {
  journalid?: number;
  receiptid?: number;

  // JournalReceipt belongsTo Journal via journalid
  journal!: Journal;
  getJournal!: Sequelize.BelongsToGetAssociationMixin<Journal>;
  setJournal!: Sequelize.BelongsToSetAssociationMixin<Journal, JournalId>;
  createJournal!: Sequelize.BelongsToCreateAssociationMixin<Journal>;
  // JournalReceipt belongsTo Receipt via receiptid
  receipt!: Receipt;
  getReceipt!: Sequelize.BelongsToGetAssociationMixin<Receipt>;
  setReceipt!: Sequelize.BelongsToSetAssociationMixin<Receipt, ReceiptId>;
  createReceipt!: Sequelize.BelongsToCreateAssociationMixin<Receipt>;

  static initModel(sequelize: Sequelize.Sequelize): typeof JournalReceipt {
    return JournalReceipt.init({
    journalid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'journal',
        key: 'id'
      }
    },
    receiptid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'receipt',
        key: 'id'
      },
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'journal_receipt',
    schema: 'public',
    timestamps: false
  });
  }
}
