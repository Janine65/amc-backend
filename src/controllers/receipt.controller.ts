import { NextFunction, Request, Response, Router } from 'express';
import { Receipt } from '@models/receipt';
import { ReceiptService } from '@services/receipt.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';
import { systemVal } from '@/utils/system';
import { RetDataFiles } from '@/models/generel';

class ReceiptController implements Controller{
    public path = '/receipt/';
    public router:Router = Router();
    public receipt!:ReceiptService;

    constructor() {
        this.initializeRoutes();
        this.receipt = new ReceiptService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getReceipts);
        this.router.post(this.path + 'receipt', authMiddleware, this.createReceipt);
        this.router.get(this.path + 'receipt/:id', authMiddleware, this.getReceiptById);
        this.router.put(this.path + 'receipt/:id', authMiddleware, this.updateReceipt);
        this.router.delete(this.path + 'receipt/:id', authMiddleware, this.deleteReceipt);
        this.router.get(this.path + 'findallatt', authMiddleware, this.findAllAttachments);
        this.router.get(this.path + 'findatt', authMiddleware, this.findAttachments);
        this.router.get(this.path + 'uploadatt', authMiddleware, this.uploadAtt);
        this.router.post(this.path + 'att2journal', authMiddleware, this.addAttachment2Journal);
    }

  public getReceipts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const findAllReceiptsData: Receipt[] = await this.receipt.findAllReceipt(jahr);

      res.status(200).json({ type: 'info', data: findAllReceiptsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getReceiptById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receiptId = req.params.id;
      const findOneReceiptData: Receipt = await this.receipt.findReceiptById(receiptId);

      res.status(200).json({ type: 'info', data: findOneReceiptData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      if (data.uploadFiles == undefined)
        res.status(409).json({type: 'error', message: 'No files found'});

      const updateReceiptData: RetDataFiles = await this.receipt.createReceipt(data.jahr, data.uploadFiles.split(','));

      res.status(200).json(updateReceiptData);
    } catch (error) {
      next(error);
    }
  };

  public updateReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receiptId = req.params.id;
      const receiptData = req.body;
      const updateReceiptData: Receipt = await this.receipt.updateReceipt(receiptId, receiptData);

      res.status(200).json({ type: 'info', data: updateReceiptData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receiptId = req.params.id;
      const deleteReceiptData: Receipt = await this.receipt.deleteReceipt(receiptId);

      res.status(200).json({ type: 'info', data: deleteReceiptData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public findAllAttachments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const journalId = Number(req.query.journalid);
      const findAllReceiptsData: Receipt[] = await this.receipt.findAllAttachments(jahr, journalId);

      res.status(200).json({ type: 'info', data: findAllReceiptsData, message: 'findAllAttachments' });
    } catch (error) {
      next(error);
    }
  };

  public findAttachments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = Number(req.query.journalid);
      const findAllReceiptsData: Receipt[] = await this.receipt.findAttachments(journalId);

      res.status(200).json({ type: 'info', data: findAllReceiptsData, message: 'findAttachments' });
    } catch (error) {
      next(error);
    }
  };

  public uploadAtt = async (req: Request, res: Response, next: NextFunction) => {
    const filename = req.query.receipt as string;
    const options = {
      root: systemVal.uploads
    };
    res.sendFile(filename, options, function (err) {
      if (err) {
        next(err);
      } else {
        console.log('Sent:', filename);
      }
    })
  
  };
  public addAttachment2Journal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      if (data.uploadFiles == undefined)
        res.status(409).json({type: 'error', message: 'No files found'});

      const updateReceiptData: RetDataFiles = await this.receipt.addAttachment2Journal(data.year, data.journalid, data.uploadFiles.split(','));

      res.status(200).json(updateReceiptData);
    } catch (error) {
      next(error);
    }
  };


}

export default ReceiptController;