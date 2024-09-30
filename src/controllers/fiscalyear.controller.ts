import { NextFunction, Request, Response, Router } from 'express';
import { Fiscalyear } from '@models/fiscalyear';
import { FiscalyearService } from '@services/fiscalyear.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class FiscalyearController implements Controller{
    public path = '/fiscalyear/';
    public router:Router = Router();
    public fiscalyear!:FiscalyearService;

    constructor() {
        this.initializeRoutes();
        this.fiscalyear = new FiscalyearService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getFiscalyears);
        this.router.get(this.path + 'getfiscalyearfk', authMiddleware, this.getFiscalyearFK);
        this.router.post(this.path + 'fiscalyear', authMiddleware, this.createFiscalyear);
        this.router.get(this.path + 'fiscalyear/:id', authMiddleware, this.getFiscalyearById);
        this.router.get(this.path + 'getbyyear', this.getFiscalyearByYear);
        this.router.put(this.path + 'fiscalyear/:id', authMiddleware, this.updateFiscalyear);
        this.router.delete(this.path + 'fiscalyear/:id', authMiddleware, this.deleteFiscalyear);
        this.router.get(this.path + 'closeyear', authMiddleware, this.closeYear);
        this.router.get(this.path + 'writebilanz', authMiddleware, this.writeBilanz);
    }

  public getFiscalyears = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllFiscalyearsData: Fiscalyear[] = await this.fiscalyear.findAllFiscalyear();

      res.status(200).json({ data: findAllFiscalyearsData, message: 'getFiscalyears' });
    } catch (error) {
      next(error);
    }
  };

  public getFiscalyearById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fiscalyearId = req.params.id;
      const findOneFiscalyearData: Fiscalyear = await this.fiscalyear.findFiscalyearById(fiscalyearId);

      res.status(200).json({ data: findOneFiscalyearData, message: 'getFiscalyearById' });
    } catch (error) {
      next(error);
    }
  };

  public getFiscalyearByYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const findOneFiscalyearData: Fiscalyear = await this.fiscalyear.findFiscalyearByYear(year);

      res.status(200).json({ data: findOneFiscalyearData, message: 'getFiscalyearByYear' });
    } catch (error) {
      next(error);
    }
  };

  public createFiscalyear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fiscalyearData = req.body;
      const updateFiscalyearData: Fiscalyear = await this.fiscalyear.createFiscalyear(fiscalyearData);

      res.status(200).json({ data: updateFiscalyearData, message: 'createFiscalyear' });
    } catch (error) {
      next(error);
    }
  };

  public updateFiscalyear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fiscalyearId = req.params.id;
      const fiscalyearData = req.body;
      const updateFiscalyearData: Fiscalyear = await this.fiscalyear.updateFiscalyear(fiscalyearId, fiscalyearData);

      res.status(200).json({ data: updateFiscalyearData, message: 'updateFiscalyear' });
    } catch (error) {
      next(error);
    }
  };

  public deleteFiscalyear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fiscalyearId = req.params.id;
      const deleteFiscalyearData: Fiscalyear = await this.fiscalyear.deleteFiscalyear(fiscalyearId);

      res.status(200).json({ data: deleteFiscalyearData, message: 'deleteFiscalyear' });
    } catch (error) {
      next(error);
    }
  };

  public getFiscalyearFK = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.query.name as string;
      const findFiscalyear: Fiscalyear[] = await this.fiscalyear.getFKData(name);

      res.status(200).json({ data: findFiscalyear, message: 'getFiscalyearFK' });
    } catch (error) {
      next(error);
    }
  };

  public closeYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const state = parseInt(req.query.state as string);
      const message = await this.fiscalyear.closeYear(year, state);

      res.status(200).json({data: message, message: "closeYear"});
    } catch (error) {
      next(error);
    }
  };

  public writeBilanz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = req.query.year as string;
      const message = await this.fiscalyear.writeBilanz(year);

      res.status(200).json({data: message, message: "writeBilanz"});
    } catch (error) {
      next(error);
    }
  };

}

export default FiscalyearController;