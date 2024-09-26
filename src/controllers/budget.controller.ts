import { NextFunction, Request, Response, Router } from 'express';
import { Budget } from '@models/budget';
import { BudgetService } from '@services/budget.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class BudgetController implements Controller{
    public path = '/budget/';
    public router:Router = Router();
    public budget!:BudgetService;

    constructor() {
        this.initializeRoutes();
        this.budget = new BudgetService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getBudgets);
        this.router.post(this.path + 'budget', authMiddleware, this.createBudget);
        this.router.get(this.path + 'budget/:id', authMiddleware, this.getBudgetById);
        this.router.put(this.path + 'budget/:id', authMiddleware, this.updateBudget);
        this.router.delete(this.path + 'budget/:id', authMiddleware, this.deleteBudget);
        this.router.put(this.path + 'copyyear', authMiddleware, this.copyYear);
    }

  public getBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const findAllBudgetsData: Budget[] = await this.budget.findAllBudget(jahr);

      res.status(200).json({ data: findAllBudgetsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getBudgetById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetId = req.params.id;
      const findOneBudgetData: Budget = await this.budget.findBudgetById(budgetId);

      res.status(200).json({ data: findOneBudgetData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetData = req.body;
      const updateBudgetData: Budget = await this.budget.createBudget(budgetData);

      res.status(200).json({ data: updateBudgetData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetId = req.params.id;
      const budgetData = req.body;
      const updateBudgetData: Budget = await this.budget.updateBudget(budgetId, budgetData);

      res.status(200).json({ data: updateBudgetData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgetId = req.params.id;
      const deleteBudgetData: Budget = await this.budget.deleteBudget(budgetId);

      res.status(200).json({ data: deleteBudgetData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public copyYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = String(req.query.from);
      const to = String(req.query.to);
      const deleteBudgetData = await this.budget.copyYear(from, to);

      res.status(200).json({ data: deleteBudgetData, message: 'copyYear' });
    } catch (error) {
      next(error);
    }
  };

}

export default BudgetController;