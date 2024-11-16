import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Receipt } from '@/models/receipt';
import { Op, col, fn } from 'sequelize';
import { systemVal } from '@/utils/system';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { JournalReceipt } from '@/models/journalReceipt';
import { Journal } from '@/models/journal';
import { RetDataFiles } from '@/models/generel';

@Service()
export class ReceiptService {
  public async findAllReceipt(jahr: string): Promise<Receipt[]> {
    const findReceipts = await Receipt.findAll({
      where: { jahr: jahr },
      attributes: {
        include: [[fn('COUNT', col('journalReceipts.journalid')), 'cntjournal']]
      },
      include: [
        { model: JournalReceipt, as: 'journalReceipts', required: false, attributes: [] }
      ],
      group: ['id', 'receipt', 'bezeichnung', 'updatedAt', 'jahr', 'createdAt'],
      order: ['bezeichnung']

    });

    const pathname = systemVal.documents + jahr + '/';
    try {
      readdirSync(systemVal.uploads + 'receipt/');
    } catch (error) {
      console.log(error);
      mkdirSync(systemVal.uploads + 'receipt/')
    }
    findReceipts.forEach(rec => {
      try {
        copyFileSync(pathname + rec.receipt, systemVal.uploads + rec.receipt);
      } catch {
        // allow empty catch
        console.log(pathname + rec.receipt + ': File not found');
        rec.receipt = 'File not found: ' + rec.receipt
      }
    });


    return findReceipts;
  }

  public async findReceiptById(receiptId: string): Promise<Receipt> {
    const findReceipt: Receipt | null = await Receipt.findByPk(receiptId);
    if (!findReceipt) throw new GlobalHttpException(409, "Receipt doesn't exist");

    return findReceipt;
  }

  public async createReceipt(jahr: string, uploadFiles: string[]): Promise<RetDataFiles> {
    if (uploadFiles.length == 0) throw new GlobalHttpException(409, "No files uploaded to create Receipts");

    const payload: RetDataFiles = { type: "info", message: "", data: {files: []} }

    const path = systemVal.documents + jahr + '/';
    if (!existsSync(path)) {
      mkdirSync(path);
      mkdirSync(path + '/receipt');
    }

    for (const element of uploadFiles) {
      const receipt = 'receipt/' + element

      const filename = systemVal.uploads + element;

      if (existsSync(filename)) {
        let newReceipt = new Receipt();
        newReceipt.receipt = receipt;
        newReceipt.jahr = jahr;
        newReceipt.bezeichnung = element;
        newReceipt = await newReceipt.save();
        const newFilename = 'receipt/journal-' + newReceipt.id + '.pdf';
        newReceipt.receipt = newFilename;
        await newReceipt.save();
        copyFileSync(filename, path + newFilename);
        payload.data!.files.push(newFilename);
        chmodSync(path + newFilename, '0640');
      } else {
        payload.message += "Error while reading the file " + element + "; ";
        payload.type = 'error'
      }
    }

    return payload;
  }

  public async updateReceipt(receiptId: string, receiptData: Receipt): Promise<Receipt> {
    const findReceipt: Receipt | null = await Receipt.findByPk(receiptId);
    if (!findReceipt) throw new GlobalHttpException(409, "Receipt doesn't exist");

    await Receipt.update(receiptData, { where: { id: receiptId } });

    const updateReceipt: Receipt | null = await Receipt.findByPk(receiptId);
    return updateReceipt!;
  }

  public async deleteReceipt(receiptId: string): Promise<Receipt> {
    const findReceipt: Receipt | null = await Receipt.findByPk(receiptId);
    if (!findReceipt) throw new GlobalHttpException(409, "Receipt doesn't exist");

    await Receipt.destroy({ where: { id: receiptId } });

    return findReceipt;
  }

  public async findAllAttachments(jahr: string, journalId: number | undefined): Promise<Receipt[]> {
    let findReceipts: Receipt[];

    if (journalId && journalId > 0) {
      const recieptsJournal = await JournalReceipt.findAll({
        where: { journalid: journalId },
        attributes: ["receiptid"]
      });

    const alReceiptIds: number[] = recieptsJournal.map(rec => rec.receiptid!);

    findReceipts = await Receipt.findAll({
      attributes: {
        include: [[fn('COUNT', col('journalReceipts.journalid')), 'cntjournal']]
      },
      where: [
        { jahr: jahr },
        { "id": { [Op.notIn]: alReceiptIds } },
      ],
      include: [
        { model: JournalReceipt, as: 'journalReceipts', required: false, attributes: [] }
      ],
      group: ['id', 'receipt', 'bezeichnung', 'updatedAt', 'jahr', 'createdAt'],
      order: ['bezeichnung']
    });
  } else {
    findReceipts = await Receipt.findAll({
      attributes: {
        include: [[fn('COUNT', col('journalReceipts.journalid')), 'cntjournal']]
      },
      where: { jahr: jahr },
      include: [
        { model: JournalReceipt, as: 'journalReceipts', required: false, attributes: [] }
      ],
      group: ['id', 'receipt', 'bezeichnung', 'updatedAt', 'jahr', 'createdAt'],
      order: ['bezeichnung']
    });

  }

    const pathname = systemVal.documents + jahr + '/';
    try {
      readdirSync(systemVal.uploads + 'receipt/');
    } catch (error) {
      mkdirSync(systemVal.uploads + 'receipt/')
    }
    findReceipts.forEach(rec => {
      try {
        copyFileSync(pathname + rec.receipt, systemVal.uploads + rec.receipt);
      } catch (ex) {
        console.log(pathname + rec.receipt + ': File not found');
        rec.receipt = 'File not found: ' + rec.receipt
      }
    });

    return findReceipts;
  }

  public async findAttachments(journalId: number): Promise<Receipt[]> {
    const journal = await Journal.findByPk(journalId);
    if (!journal) throw new GlobalHttpException(409, "Journal doesn't exist");

    const findReceipts = await Receipt.findAll({
      include: [
        {
          model: JournalReceipt, as: 'journalReceipts', required: true, attributes: [],
          where: { "journalid": journalId }
        }
      ]
    });

    const date = new Date(journal.date!)
    const pathname = systemVal.documents + date.getFullYear() + '/';
    try {
      readdirSync(systemVal.uploads + 'receipt/');
    } catch {
      mkdirSync(systemVal.uploads + 'receipt/')
    }
    findReceipts.forEach(rec => {
      try {
        copyFileSync(pathname + rec.receipt, systemVal.uploads + rec.receipt);
      } catch {
        console.log(pathname + rec.receipt + ': File not found');
        rec.receipt = 'File not found: ' + rec.receipt
      }
    });

    return findReceipts;
  }

  public async addAttachment2Journal(year: string, journalId: number, uploadFiles: string[]): Promise<RetDataFiles> {
    if (uploadFiles.length == 0) throw new GlobalHttpException(409, "No files uploaded to create Receipts");

    const payload: RetDataFiles  = { type: "info", message: "", data: {files: []} }
    const path = systemVal.documents + year + '/';
    if (!existsSync(path)) {
      mkdirSync(path);
      mkdirSync(path + '/receipt');
    }

    for (const element of uploadFiles) {
      const receipt = 'receipt/' + element

      const filename = systemVal.uploads + element;

      if (existsSync(filename)) {
        // create receipt
        let newReceipt = new Receipt();
        newReceipt.receipt = receipt;
        newReceipt.jahr = year;
        newReceipt.bezeichnung = element;
        newReceipt = await newReceipt.save();
        const newFilename = 'receipt/journal-' + newReceipt.id + '.pdf';
        newReceipt.receipt = newFilename;
        await newReceipt.save();
        copyFileSync(filename, path + newFilename);
        payload.data!.files.push(newFilename);
        chmodSync(path + newFilename, '0640');

        // create journal_receipt
        const newJournalReceipt = new JournalReceipt();
        newJournalReceipt.journalid = journalId;
        newJournalReceipt.receiptid = newReceipt.id;
        await newJournalReceipt.save();
      } else {
        payload.message += "Error while reading the file " + element + "; ";
        payload.type = 'error'
      }
    }

    return payload;
  }


}
