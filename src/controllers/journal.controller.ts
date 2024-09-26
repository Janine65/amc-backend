import { NextFunction, Request, Response, Router } from 'express';
import { Journal } from '@models/journal';
import { JournalService } from '@services/journal.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class JournalController implements Controller{
    public path = '/journal/';
    public router:Router = Router();
    public journal!:JournalService;

    constructor() {
        this.initializeRoutes();
        this.journal = new JournalService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getJournals);
        this.router.post(this.path + 'journal', authMiddleware, this.createJournal);
        this.router.get(this.path + 'journal/:id', authMiddleware, this.getJournalById);
        this.router.get(this.path + 'getbyyear', authMiddleware, this.getJournalByYear);
        this.router.put(this.path + 'journal/:id', authMiddleware, this.updateJournal);
        this.router.delete(this.path + 'journal/:id', authMiddleware, this.deleteJournal);
        this.router.get(this.path + 'getaccdata', authMiddleware, this.getAccountData);
        this.router.get(this.path + 'write', authMiddleware, this.writeJournal);
    }

  public getJournals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllJournalsData: Journal[] = await this.journal.findAllJournal();

      res.status(200).json({ data: findAllJournalsData, message: 'getJournals' });
    } catch (error) {
      next(error);
    }
  };

  public getJournalById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = req.params.id;
      const findOneJournalData: Journal = await this.journal.findJournalById(journalId);

      res.status(200).json({ data: findOneJournalData, message: 'getJournalById' });
    } catch (error) {
      next(error);
    }
  };

  public getJournalByYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const findOneJournalData: Journal[] = await this.journal.findJournalByYear(year);

      res.status(200).json({ data: findOneJournalData, message: 'getJournalByYear' });
    } catch (error) {
      next(error);
    }
  };

  public createJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalData = req.body;
      const updateJournalData: Journal = await this.journal.createJournal(journalData);

      res.status(200).json({ data: updateJournalData, message: 'createJournal' });
    } catch (error) {
      next(error);
    }
  };

  public updateJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = req.params.id;
      const journalData = req.body;
      const updateJournalData: Journal = await this.journal.updateJournal(journalId, journalData);

      res.status(200).json({ data: updateJournalData, message: 'updateJournal' });
    } catch (error) {
      next(error);
    }
  };

  public deleteJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journalId = req.params.id;
      const deleteJournalData: Journal = await this.journal.deleteJournal(journalId);

      res.status(200).json({ data: deleteJournalData, message: 'deleteJournal' });
    } catch (error) {
      next(error);
    }
  };

  public getAccountData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const account = Number(req.query.account);
      const getAccountData = await this.journal.getAccData(year, account);

      res.status(200).json({ data: getAccountData, message: 'getAccountData' });
    } catch (error) {
      next(error);
    }
  };

  public writeJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const fReceipt = (req.query.receipt as string) == 'true';
      const getAccountData = await this.journal.writeJournal(year, fReceipt);

      res.status(200).json({ data: getAccountData, message: 'writeJournal' });
    } catch (error) {
      next(error);
    }
  };

}

export default JournalController;