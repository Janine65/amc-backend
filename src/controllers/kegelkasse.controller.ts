import { NextFunction, Request, Response, Router } from 'express';
import { Kegelkasse } from '@models/kegelkasse';
import { KegelkasseService } from '@services/kegelkasse.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class KegelkasseController implements Controller{
    public path = '/kegelkasse/';
    public router:Router = Router();
    public kegelkasse!:KegelkasseService;

    constructor() {
        this.initializeRoutes();
        this.kegelkasse = new KegelkasseService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getKegelkasses);
        this.router.post(this.path + 'kegelkasse', authMiddleware, this.createKegelkasse);
        this.router.get(this.path + 'kegelkasse/:id', authMiddleware, this.getKegelkasseById);
        this.router.put(this.path + 'kegelkasse/:id', authMiddleware, this.updateKegelkasse);
        this.router.delete(this.path + 'kegelkasse/:id', authMiddleware, this.deleteKegelkasse);
        this.router.get(this.path + 'kassebyjahr', authMiddleware, this.getKegelkasseByJahr);
        this.router.get(this.path + 'kassebydatum', authMiddleware, this.getKegelkasseByDatum);
        this.router.get(this.path + 'genreceipt', authMiddleware, this.generateKegelkassePDF);
    }

  public getKegelkasses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllKegelkassesData: Kegelkasse[] = await this.kegelkasse.findAllKegelkasse();

      res.status(200).json({ data: findAllKegelkassesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getKegelkasseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelkasseId = req.params.id;
      const findOneKegelkasseData: Kegelkasse = await this.kegelkasse.findKegelkasseById(kegelkasseId);

      res.status(200).json({ data: findOneKegelkasseData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createKegelkasse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelkasseData = req.body;
      const updateKegelkasseData: Kegelkasse = await this.kegelkasse.createKegelkasse(kegelkasseData);

      res.status(200).json({ data: updateKegelkasseData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateKegelkasse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelkasseId = req.params.id;
      const kegelkasseData = req.body;
      const updateKegelkasseData: Kegelkasse = await this.kegelkasse.updateKegelkasse(kegelkasseId, kegelkasseData);

      res.status(200).json({ data: updateKegelkasseData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteKegelkasse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelkasseId = req.params.id;
      const deleteKegelkasseData: Kegelkasse = await this.kegelkasse.deleteKegelkasse(kegelkasseId);

      res.status(200).json({ data: deleteKegelkasseData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getKegelkasseByJahr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const findAllKegelkassesData: Kegelkasse[] = await this.kegelkasse.findKegelkasseByJahr(jahr);

      res.status(200).json({ data: findAllKegelkassesData, message: 'getKegelkasseByJahr' });
    } catch (error) {
      next(error);
    }
  };

  public getKegelkasseByDatum = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const monat = String(req.query.monat);
      const findAllKegelkassesData = await this.kegelkasse.findKegelkasseByDatum(jahr, monat);

      res.status(200).json({ data: findAllKegelkassesData, message: 'getKegelkasseByDatum' });
    } catch (error) {
      next(error);
    }
  };

  public generateKegelkassePDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelkasseId = Number(req.query.kegelkasseId as string);
      const deleteKegelkasseData = await this.kegelkasse.generateKegelkassePDF(kegelkasseId);

      res.status(200).json({ data: deleteKegelkasseData, message: 'copyYear' });
    } catch (error) {
      next(error);
    }
  };

}

export default KegelkasseController;