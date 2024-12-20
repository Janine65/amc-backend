import { NextFunction, Request, Response, Router } from 'express';
import { Anlass } from '@/models/anlass';
import { AnlassService } from '@services/anlass.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';
import { Dictionary } from 'lodash';

class AnlassController implements Controller{
    public path = '/anlass/';
    public router:Router = Router();
    public anlass!:AnlassService;

    constructor() {
        this.initializeRoutes();
        this.anlass = new AnlassService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getAnlasss);
        this.router.post(this.path + 'anlass', authMiddleware, this.createAnlass);
        this.router.get(this.path + 'anlass/:id', authMiddleware, this.getAnlassById);
        this.router.put(this.path + 'anlass/:id', authMiddleware, this.updateAnlass);
        this.router.delete(this.path + 'anlass/:id', authMiddleware, this.deleteAnlass);
        this.router.get(this.path + 'overview', this.getOverview);
        this.router.get(this.path + 'getFkData', authMiddleware, this.getFKData);
        this.router.get(this.path + 'writestammblatt', authMiddleware, this.writeStammblatt);
    }

  public getAnlasss = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromJahr = req.query.from as string;
      const toJahr = req.query.to as string;
      const istkegeln = Boolean(req.query.istkegeln as string);
      
      const findAllAnlasssData: Anlass[] = await this.anlass.findAllAnlass(fromJahr, toJahr, istkegeln);

      res.status(200).json({ type: 'info', data: findAllAnlasssData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAnlassById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AnlassId = req.params.id;
      const findOneAnlassData: Anlass = await this.anlass.findAnlassById(AnlassId);

      res.status(200).json({ type: 'info', data: findOneAnlassData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createAnlass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AnlassData = req.body;
      const updateAnlassData: Anlass | null = await this.anlass.createAnlass(AnlassData);

      res.status(200).json({ type: 'info', data: updateAnlassData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateAnlass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AnlassId = req.params.id;
      const AnlassData = req.body;
      const updateAnlassData: Anlass = await this.anlass.updateAnlass(AnlassId, AnlassData);

      res.status(200).json({ type: 'info', data: updateAnlassData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAnlass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AnlassId = req.params.id;
      const deleteAnlassData: Anlass = await this.anlass.deleteAnlass(AnlassId);

      res.status(200).json({ type: 'info', data: deleteAnlassData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overviewData = await this.anlass.getOverviewData();

      res.status(200).json({ type: 'info', data: overviewData, message: 'getOverview' });
    } catch (error) {
      next(error);
    }
  };

  public getFKData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr;
      const fkdata = await this.anlass.getFKData(jahr as string);

      res.status(200).json({ type: 'info', data: fkdata, message: 'getFKData' });
    } catch (error) {
      next(error);
    }

  };

  public writeStammblatt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string;
      const type = Number(req.query.type as string);
      let adresseId:string|number|undefined = req.query.adresseId as string;
      if (adresseId)
        adresseId = Number(adresseId);
      const data = await this.anlass.writeStammblatt(type, jahr, adresseId as number);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  };
}

export default AnlassController;