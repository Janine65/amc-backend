import { NextFunction, Request, Response, Router } from 'express';
import { Parameter } from '@models/parameter';
import { ParameterService } from '@services/parameter.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class ParameterController implements Controller{
    public path = '/parameter/';
    public router:Router = Router();
    public parameter!:ParameterService;

    constructor() {
        this.initializeRoutes();
        this.parameter = new ParameterService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', this.getParameters);
        this.router.post(this.path + 'parameter', authMiddleware, this.createParameter);
        this.router.get(this.path + 'parameter/:id', authMiddleware, this.getParameterById);
        this.router.put(this.path + 'parameter/:id', authMiddleware, this.updateParameter);
        this.router.delete(this.path + 'parameter/:id', authMiddleware, this.deleteParameter);
    }

  public getParameters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllParametersData: Parameter[] = await this.parameter.findAllParameter();

      res.status(200).json({ type: 'info', data: findAllParametersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getParameterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parameterId = req.params.id;
      const findOneParameterData: Parameter = await this.parameter.findParameterById(parameterId);

      res.status(200).json({ type: 'info', data: findOneParameterData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createParameter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parameterData = req.body;
      const createParameterData: Parameter = await this.parameter.createParameter(parameterData);
      
      res.status(200).json({ type: 'info', data: createParameterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateParameter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parameterId = req.params.id;
      const parameterData = req.body;
      const updateParameterData: Parameter = await this.parameter.updateParameter(parameterId, parameterData);

      res.status(200).json({ type: 'info', data: updateParameterData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteParameter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parameterId = req.params.id;
      const deleteParameterData: Parameter = await this.parameter.deleteParameter(parameterId);

      res.status(200).json({ type: 'info', data: deleteParameterData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

}

export default ParameterController;