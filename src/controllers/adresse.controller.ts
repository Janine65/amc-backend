import { NextFunction, Request, Response, Router } from 'express';
import { Adresse } from '@/models/adresse';
import { AdresseService, EmailBody, FilterAdressen } from '@services/adresse.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class AdresseController implements Controller{
    public path = '/adresse/';
    public router:Router = Router();
    public adresse!:AdresseService;

    constructor() {
        this.initializeRoutes();
        this.adresse = new AdresseService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getAdresses);
        this.router.post(this.path + 'adresse', authMiddleware, this.createAdresse);
        this.router.get(this.path + 'adresse/:id', authMiddleware, this.getAdresseById);
        this.router.put(this.path + 'adresse/:id', authMiddleware, this.updateAdresse);
        this.router.delete(this.path + 'adresse/:id', authMiddleware, this.deleteAdresse);
        this.router.get(this.path + 'overview', this.getOverview);
        this.router.get(this.path + 'getFkData', authMiddleware, this.getFKData);
        this.router.post(this.path + 'export', authMiddleware, this.exportAdressen);
        this.router.post(this.path + 'sendmail', authMiddleware, this.sendEmail);
        this.router.post(this.path + 'qrbill', authMiddleware, this.createQRBill);
    }

  public getAdresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAdressesData: Adresse[] = await this.adresse.findAllAdresse();

      res.status(200).json({ data: findAllAdressesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAdresseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AdresseId = req.params.id;
      const findOneAdresseData: Adresse = await this.adresse.findAdresseById(AdresseId);

      res.status(200).json({ data: findOneAdresseData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createAdresse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AdresseData = req.body;
      const updateAdresseData: Adresse = await this.adresse.createAdresse(AdresseData);

      res.status(200).json({ data: updateAdresseData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateAdresse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AdresseId = req.params.id;
      const AdresseData = req.body;
      const updateAdresseData: Adresse = await this.adresse.updateAdresse(AdresseId, AdresseData);

      res.status(200).json({ data: updateAdresseData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAdresse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const AdresseId = req.params.id;
      const deleteAdresseData: Adresse = await this.adresse.deleteAdresse(AdresseId);

      res.status(200).json({ data: deleteAdresseData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overviewData = await this.adresse.getOverview();

      res.status(200).json({ data: overviewData, message: 'getOverview' });
    } catch (error) {
      next(error);
    }
  };

  public getFKData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fkdata = await this.adresse.getFKData();

      res.status(200).json({ data: fkdata, message: 'getFKData' });
    } catch (error) {
      next(error);
    }

  }

  public exportAdressen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: FilterAdressen = req.body;
      const retdata = await this.adresse.exportAdressen(filter);

      res.status(200).json(retdata);
    } catch (error) {
      next(error);
    }

  }

  public sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailBody: EmailBody = req.body;
      const retdata = await this.adresse.sendEmail(emailBody);

      res.status(200).json(retdata);
    } catch (error) {
      next(error);
    }

  }

  public createQRBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adresse: Adresse = req.body;
      const retdata = await this.adresse.createQRBill(adresse);

      res.status(200).json(retdata);
    } catch (error) {
      next(error);
    }

  }


}

export default AdresseController;