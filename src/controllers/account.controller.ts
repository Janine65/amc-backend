import { NextFunction, Request, Response, Router } from 'express';
import { Account } from '@models/account';
import { AccountService } from '@services/account.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';

class AccountController implements Controller{
    public path = '/account/';
    public router:Router = Router();
    public account!:AccountService;

    constructor() {
        this.initializeRoutes();
        this.account = new AccountService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getAccounts);
        this.router.post(this.path + 'account', authMiddleware, this.createAccount);
        this.router.get(this.path + 'account/:id', authMiddleware, this.getAccountById);
        this.router.put(this.path + 'account/:id', authMiddleware, this.updateAccount);
        this.router.delete(this.path + 'account/:id', authMiddleware, this.deleteAccount);
        this.router.get(this.path + 'getaccjahr', authMiddleware, this.getAccountJahr);
        this.router.get(this.path + 'getonedatabyorder', authMiddleware, this.getOneDataByOrder);
        this.router.get(this.path + 'getamountoneacc', authMiddleware, this.getAmountOneAcc);
        this.router.get(this.path + 'getfkdata', authMiddleware, this.getFKData);
        this.router.get(this.path + 'getaccountsummary', authMiddleware, this.getAccountSummary);
        this.router.get(this.path + 'writekontoauszug', authMiddleware, this.writeKontoauszug);
    }

  public getAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAccountsData: Account[] = await this.account.findAllAccount();

      res.status(200).json({ data: findAllAccountsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAccountById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.id;
      const findOneAccountData: Account = await this.account.findAccountById(accountId);

      res.status(200).json({ data: findOneAccountData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountData = req.body;
      const updateAccountData: Account = await this.account.createAccount(accountData);

      res.status(200).json({ data: updateAccountData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.id;
      const accountData = req.body;
      const updateAccountData: Account = await this.account.updateAccount(accountId, accountData);

      res.status(200).json({ data: updateAccountData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.id;
      const deleteAccountData: Account = await this.account.deleteAccount(accountId);

      res.status(200).json({ data: deleteAccountData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getAccountJahr = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const all = Number.parseInt(String(req.query.all));
      const getData: Account[] = await this.account.getAccountJahr(jahr, all);

      res.status(200).json({ data: getData, message: 'getAccountJahr' });
    } catch (error) {
      next(error);
    }
  };

  public getOneDataByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = String(req.query.order);
      const getData = await this.account.getOneDataByOrder(order);
      res.status(200).json({ data: getData, message: 'getOneDataByOrder'});
    } catch (error) {
      next(error);
    }
  };

  public getAmountOneAcc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = String(req.query.order);
      const date = new Date(req.query.datum as string)
      const getData = await this.account.getAmountOneAcc(order,date);
      res.status(200).json({ data: getData, message: 'getOneDataByOrder'});
    } catch (error) {
      next(error);
    }
  };

  public getFKData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = String(req.query.filter);
      const getData = await this.account.getFKData(filter);
      res.status(200).json({ data: getData, message: 'getFKData'});
    } catch (error) {
      next(error);
    }
  };

  public getAccountSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jahr = String(req.query.jahr);
      const getData = await this.account.getAccountSummary(jahr);
      res.status(200).json({ data: getData, message: 'getAccountSummary'});
    } catch (error) {
      next(error);
    }
  };

  public writeKontoauszug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const year = String(req.query.year);
      const all = (req.query.jahr as string) == "true" || (req.query.jahr as string) == "1";
      const getData = await this.account.writeKontoauszug(year, all);
      res.status(200).json({ data: getData, message: 'writeKontoauszug'});
    } catch (error) {
      next(error);
    }
  };


}

export default AccountController;