import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { JournalReceipt } from '@/models/journalReceipt';
import { Receipt } from '@/models/receipt';

@Service()
export class JournalReceiptService {
  public async findAllJournalReceipt(): Promise<JournalReceipt[]> {
    const allJournalReceipt: JournalReceipt[] = await JournalReceipt.findAll({
      order: ["journalid"]
    });
    return allJournalReceipt;
  }

  public async findJournalReceiptByJournalId(journalId: number ): Promise<JournalReceipt[]> {
    const findJournalReceipt: JournalReceipt[] = await JournalReceipt.findAll({
      where: {journalid: journalId}
    });

    return findJournalReceipt;
  }

  public async findJournalReceiptByReceiptId(receiptId: number ): Promise<JournalReceipt[]> {
    const findJournalReceipt: JournalReceipt[] = await JournalReceipt.findAll({
      where: {receiptid: receiptId}
    });

    return findJournalReceipt;
  }

  public async createJournalReceipt(journalReceipt: JournalReceipt): Promise<unknown> {
    const findJournalReceipt = await JournalReceipt.findOne({
      where: [{journalid: journalReceipt.journalid},
        {receiptid: journalReceipt.receiptid}
      ]
    });
    if (findJournalReceipt) throw new GlobalHttpException(409, "JournalReceipt allready exists");

    const createJournalReceipt = await JournalReceipt.create(journalReceipt);

    return createJournalReceipt;
  }

  public async deleteJournalReceipt(journalReceipt: JournalReceipt): Promise<null> {
    const findJournalReceipt: JournalReceipt | null = await JournalReceipt.findOne({
      where: [{journalid: journalReceipt.journalid},
        {receiptid: journalReceipt.receiptid}
      ]
    });
    if (!findJournalReceipt) throw new GlobalHttpException(409, "JournalReceipt doesn't exist");

    await findJournalReceipt.destroy();

    return null;
  }

  public async addReceipts2Journal(journalId: number, receiptIds: Receipt[] ): Promise<unknown> {
    for (const element of receiptIds) {
      const journalReceipt = new JournalReceipt();
      journalReceipt.journalid = journalId;
      journalReceipt.receiptid = element.id;
      await journalReceipt.save();
    } 

    return {message: "done"}
  }

}
