import { NextFunction, Request, Response, Router } from 'express';
import { Clubmeister } from '@models/clubmeister';
import { ClubmeisterService } from '@services/clubmeister.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class ClubmeisterController implements Controller{
    public path = '/clubmeister/';
    public router:Router = Router();
    public clubmeister!:ClubmeisterService;

    constructor() {
        this.initializeRoutes();
        this.clubmeister = new ClubmeisterService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getClubmeisters);
        this.router.post(this.path + 'clubmeister', authMiddleware, this.createClubmeister);
        this.router.get(this.path + 'clubmeister/:id', authMiddleware, this.getClubmeisterById);
        this.router.put(this.path + 'clubmeister/:id', authMiddleware, this.updateClubmeister);
        this.router.delete(this.path + 'clubmeister/:id', authMiddleware, this.deleteClubmeister);
        this.router.get(this.path + 'overview', authMiddleware, this.getOverviewData);
        this.router.get(this.path + 'calcmeister', authMiddleware, this.calcMeister);
    }

  public getClubmeisters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const findAllClubmeistersData: Clubmeister[] = await this.clubmeister.findAllClubmeister(jahr);

      res.status(200).json({ data: findAllClubmeistersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getClubmeisterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clubmeisterId = req.params.id;
      const findOneClubmeisterData: Clubmeister = await this.clubmeister.findClubmeisterById(clubmeisterId);

      res.status(200).json({ data: findOneClubmeisterData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createClubmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clubmeisterData = req.body;
      const updateClubmeisterData: Clubmeister = await this.clubmeister.createClubmeister(clubmeisterData);

      res.status(200).json({ data: updateClubmeisterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateClubmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clubmeisterId = req.params.id;
      const clubmeisterData = req.body;
      const updateClubmeisterData: Clubmeister = await this.clubmeister.updateClubmeister(clubmeisterId, clubmeisterData);

      res.status(200).json({ data: updateClubmeisterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteClubmeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clubmeisterId = req.params.id;
      const deleteClubmeisterData: Clubmeister = await this.clubmeister.deleteClubmeister(clubmeisterId);

      res.status(200).json({ data: deleteClubmeisterData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getOverviewData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overviewData = await this.clubmeister.getOverviewData();

      res.status(200).json({ data: overviewData, message: 'getOverviewData' });
    } catch (error) {
      next(error);
    }
  };

  public calcMeister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = req.query.jahr as string
      const overviewData = await this.clubmeister.calcMeister(jahr);

      res.status(200).json({ data: overviewData, message: 'getOverviewData' });
    } catch (error) {
      next(error);
    }
  };


}

export default ClubmeisterController;