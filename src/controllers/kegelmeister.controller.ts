import { NextFunction, Request, Response, Router } from 'express';
import { Kegelmeister } from '@models/kegelmeister';
import { KegelmeisterService } from '@services/kegelmeister.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class KegelmeisterController implements Controller{
    public path = '/kegelmeister/';
    public router:Router = Router();
    public kegelmeister!:KegelmeisterService;

    constructor() {
        this.initializeRoutes();
        this.kegelmeister = new KegelmeisterService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getKegelmeisters);
        this.router.post(this.path + 'kegelmeister', authMiddleware, this.createKegelmeister);
        this.router.get(this.path + 'kegelmeister/:id', authMiddleware, this.getKegelmeisterById);
        this.router.put(this.path + 'kegelmeister/:id', authMiddleware, this.updateKegelmeister);
        this.router.delete(this.path + 'kegelmeister/:id', authMiddleware, this.deleteKegelmeister);
        this.router.get(this.path + 'overview', this.getOverviewData);
        this.router.get(this.path + 'calcmeister', authMiddleware, this.calcMeister);
    }

  public getKegelmeisters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const findAllKegelmeistersData: Kegelmeister[] = await this.kegelmeister.findAllKegelmeister(jahr);

      res.status(200).json({ data: findAllKegelmeistersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getKegelmeisterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelmeisterId = req.params.id;
      const findOneKegelmeisterData: Kegelmeister = await this.kegelmeister.findKegelmeisterById(kegelmeisterId);

      res.status(200).json({ data: findOneKegelmeisterData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createKegelmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelmeisterData = req.body;
      const updateKegelmeisterData: Kegelmeister = await this.kegelmeister.createKegelmeister(kegelmeisterData);

      res.status(200).json({ data: updateKegelmeisterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateKegelmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelmeisterId = req.params.id;
      const kegelmeisterData = req.body;
      const updateKegelmeisterData: Kegelmeister = await this.kegelmeister.updateKegelmeister(kegelmeisterId, kegelmeisterData);

      res.status(200).json({ data: updateKegelmeisterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteKegelmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kegelmeisterId = req.params.id;
      const deleteKegelmeisterData: Kegelmeister = await this.kegelmeister.deleteKegelmeister(kegelmeisterId);

      res.status(200).json({ data: deleteKegelmeisterData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getOverviewData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overviewData = await this.kegelmeister.getOverviewData();

      res.status(200).json({ data: overviewData, message: 'getOverviewData' });
    } catch (error) {
      next(error);
    }
  };

  public calcMeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string
      const overviewData = await this.kegelmeister.calcMeister(jahr);

      res.status(200).json({ data: overviewData, message: 'getOverviewData' });
    } catch (error) {
      next(error);
    }
  };


}

export default KegelmeisterController;