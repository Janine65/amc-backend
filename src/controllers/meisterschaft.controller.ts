import { NextFunction, Request, Response, Router } from 'express';
import { Meisterschaft } from '@models/meisterschaft';
import { MeisterschaftService } from '@services/meisterschaft.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';
import { Anlaesse } from '@/models/init-models';

class MeisterschaftController implements Controller{
    public path = '/meisterschaft/';
    public router:Router = Router();
    public meisterschaft!:MeisterschaftService;

    constructor() {
        this.initializeRoutes();
        this.meisterschaft = new MeisterschaftService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getMeisterschafts);
        this.router.get(this.path + 'listevent', authMiddleware, this.getMeisterschaftForEvent);
        this.router.get(this.path + 'listmitglied', authMiddleware, this.getMeisterschaftForMitglied);
        this.router.get(this.path + 'listmitgliedmeister', authMiddleware, this.getMeisterForMitglied);
        this.router.get(this.path + 'checkjahr', authMiddleware, this.checkJahr);
        this.router.get(this.path + 'getchartdata', authMiddleware, this.getChartData);
        this.router.post(this.path + 'meisterschaft', authMiddleware, this.createMeisterschaft);
        this.router.get(this.path + 'meisterschaft/:id', authMiddleware, this.getMeisterschaftById);
        this.router.put(this.path + 'meisterschaft/:id', authMiddleware, this.updateMeisterschaft);
        this.router.delete(this.path + 'meisterschaft/:id', authMiddleware, this.deleteMeisterschaft);
        this.router.get(this.path + 'writeauswertung', authMiddleware, this.writeAuswertung);
    }

  public getMeisterschafts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllMeisterschaftsData: Meisterschaft[] = await this.meisterschaft.findAllMeisterschaft();

      res.status(200).json({ data: findAllMeisterschaftsData, message: 'getMeisterschafts' });
    } catch (error) {
      next(error);
    }
  };

  public getMeisterschaftById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meisterschaftId = req.params.id;
      const findOneMeisterschaftData: Meisterschaft = await this.meisterschaft.findMeisterschaftById(meisterschaftId);

      res.status(200).json({ data: findOneMeisterschaftData, message: 'getMeisterschaftById' });
    } catch (error) {
      next(error);
    }
  };

  public getMeisterschaftForEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventid = Number(req.query.eventid as string);
      const findOneMeisterschaftData: Meisterschaft[] = await this.meisterschaft.getMeisterschaftForEvent(eventid);

      res.status(200).json({ data: findOneMeisterschaftData, message: 'getMeisterschaftForEvent' });
    } catch (error) {
      next(error);
    }
  };

  public getMeisterschaftForMitglied = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mitgliedid = Number(req.query.mitgliedid as string);
      const findMeisterschaftData = await this.meisterschaft.getMeisterschaftForMitglied(mitgliedid);

      res.status(200).json({ data: findMeisterschaftData, message: 'getMeisterschaftForMitglied' });
    } catch (error) {
      next(error);
    }
  };

  public getMeisterForMitglied = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mitgliedid = Number(req.query.mitgliedid as string);
      const findMeisterData = await this.meisterschaft.getMeisterForMitglied(mitgliedid);

      res.status(200).json({ data: findMeisterData, message: 'getMeisterForMitglied' });
    } catch (error) {
      next(error);
    }
  };

  public checkJahr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string;
      const retValue = await this.meisterschaft.checkJahr(jahr);

      res.status(200).json({ data: retValue, message: 'createMeisterschaft' });
    } catch (error) {
      next(error);
    }
  };

  public getChartData  = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string;
      const vorjahr = Boolean(req.query.vorjahr as string);
      const alAnlaesse: Anlaesse[] = await this.meisterschaft.getChartData(jahr, vorjahr);

      res.status(200).json({ data: alAnlaesse, message: 'getChartData' });
    } catch (error) {
      next(error);
    }
  };

  public createMeisterschaft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meisterschaftData = req.body;
      const updateMeisterschaftData: Meisterschaft = await this.meisterschaft.createMeisterschaft(meisterschaftData);

      res.status(200).json({ data: updateMeisterschaftData, message: 'createMeisterschaft' });
    } catch (error) {
      next(error);
    }
  };

  public updateMeisterschaft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meisterschaftId = req.params.id;
      const meisterschaftData = req.body;
      const updateMeisterschaftData: Meisterschaft = await this.meisterschaft.updateMeisterschaft(meisterschaftId, meisterschaftData);

      res.status(200).json({ data: updateMeisterschaftData, message: 'updateMeisterschaft' });
    } catch (error) {
      next(error);
    }
  };

  public deleteMeisterschaft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meisterschaftId = req.params.id;
      const deleteMeisterschaftData: Meisterschaft = await this.meisterschaft.deleteMeisterschaft(meisterschaftId);

      res.status(200).json({ data: deleteMeisterschaftData, message: 'deleteMeisterschaft' });
    } catch (error) {
      next(error);
    }
  };

  public writeAuswertung = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string;
      const deleteMeisterschaftData = await this.meisterschaft.writeAuswertung(jahr);

      res.status(200).json({ data: deleteMeisterschaftData, message: 'writeAuswertung' });
    } catch (error) {
      next(error);
    }
  };

}

export default MeisterschaftController;