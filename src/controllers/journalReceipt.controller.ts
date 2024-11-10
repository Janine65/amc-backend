import { NextFunction, Request, Response, Router } from 'express';
import { JournalReceipt } from '@models/journalReceipt';
import { JournalReceiptService } from '@/services/journalReceipt.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';
import { Receipt } from '@/models/receipt';

class JournalReceiptController implements Controller{
    public path = '/journalreceipt/';
    public router:Router = Router();
    public journalReceipt!:JournalReceiptService;

    constructor() {
        this.initializeRoutes();
        this.journalReceipt = new JournalReceiptService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getJournalReceipts);
        this.router.post(this.path + 'journalreceipt', authMiddleware, this.createJournalReceipt);
        this.router.post(this.path + 'add2journal', authMiddleware, this.addReceipts2Journal);
        this.router.get(this.path + 'getbyjournalid', authMiddleware, this.getJournalReceiptByJournalId);
        this.router.get(this.path + 'getbyreceiptid', authMiddleware, this.getJournalReceiptByReceiptId);
        this.router.delete(this.path + 'journalreceipt', authMiddleware, this.deleteJournalReceipt);
    }

  public getJournalReceipts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllJournalReceiptsData: JournalReceipt[] = await this.journalReceipt.findAllJournalReceipt();

      res.status(200).json({ type: 'info', data: findAllJournalReceiptsData, message: 'getJournalReceipts' });
    } catch (error) {
      next(error);
    }
  };

  public getJournalReceiptByJournalId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = Number(req.query.journalId as string);
      const findJournalReceiptData: JournalReceipt[] = await this.journalReceipt.findJournalReceiptByJournalId(journalId);

      res.status(200).json({ type: 'info', data: findJournalReceiptData, message: 'getJournalReceiptByJournalId' });
    } catch (error) {
      next(error);
    }
  };

  public getJournalReceiptByReceiptId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receiptId = Number(req.query.receiptId as string);
      const findJournalReceiptData: JournalReceipt[] = await this.journalReceipt.findJournalReceiptByReceiptId(receiptId);

      res.status(200).json({ type: 'info', data: findJournalReceiptData, message: 'getJournalReceiptByReceiptId' });
    } catch (error) {
      next(error);
    }
  };

  public createJournalReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalReceiptData = req.body;
      const updateJournalReceiptData = await this.journalReceipt.createJournalReceipt(journalReceiptData);

      res.status(200).json({ type: 'info', data: updateJournalReceiptData, message: 'createJournalReceipt' });
    } catch (error) {
      next(error);
    }
  };

  public deleteJournalReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalReceipt = req.body;
      await this.journalReceipt.deleteJournalReceipt(journalReceipt);

      res.status(200).json({ type: 'info', data: undefined, message: 'deleteJournalReceipt' });
    } catch (error) {
      next(error);
    }
  };

  public addReceipts2Journal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = Number(req.query.journalid as string);
      const receipts = req.body as Receipt[];
      const updateJournalReceiptData = await this.journalReceipt.addReceipts2Journal(journalId, receipts);

      res.status(200).json({ type: 'info', data: updateJournalReceiptData, message: 'createJournalReceipt' });
    } catch (error) {
      next(error);
    }
  };

}

export default JournalReceiptController;