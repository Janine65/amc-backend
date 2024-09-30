import { NextFunction, Request, Response, Router } from 'express';
import { UpdateUserDto } from '@dtos/authentication.dto';
import { User } from '@models/user';
import { UserService } from '@services/users.service';
import authMiddleware from '@/interfaces/auth.middleware';
import Controller from '@/interfaces/controller.interface';
import { AdresseService, EmailBody } from '@/services/adresse.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class UserController implements Controller{
    public path = '/user/';
    public router:Router = Router();
    public user!:UserService;
    public adresse:AdresseService;

    constructor() {
        this.initializeRoutes();
        this.user = new UserService();
        this.adresse = new AdresseService();
    }

    public initializeRoutes() {
        this.router.get(this.path + 'list', authMiddleware, this.getUsers);
        this.router.get(this.path + 'user/:id', authMiddleware, this.getUserById);
        this.router.put(this.path + 'user/:id', authMiddleware, this.updateUser);
        this.router.delete(this.path + 'user/:id', authMiddleware, this.deleteUser);
        this.router.get(this.path + 'newpass', this.setNewPass)
        this.router.get(this.path + 'current', authMiddleware, this.getCurrent)
    }

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.user.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const findOneUserData: User = await this.user.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData: UpdateUserDto = req.body;
      const updateUserData: User = await this.user.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const deleteUserData: User = await this.user.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getCurrent = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ data: req.user, message: 'getCurrent' });
    } catch (error) {
      next(error);
    }
  };

  public setNewPass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.query.email as string;
        
        this.user.setNewPass(email)
        .then(async (retVal: {newPass: string, findUser: User}) => {
            const newPass = retVal.newPass;
            const user = retVal.findUser;
            const emailBody:EmailBody = {
              email_signature: 'JanineFranken',
              email_an: user.email,
              email_cc: '',
              email_bcc: '',
              email_subject: 'AMC Interna - Neues Passwort gesetzt',
              email_body: 'Hallo ' + user.name + '<br/>Dein Passwort wurde ersetzt mit ' + newPass + '<br/>Bitte setze nach dem Login ein neues Passwort!',
              email_uploadfiles: undefined
            }
            console.log(emailBody);
            const retData = await this.adresse.sendEmail(emailBody);
            res.json(retData);
        })
        .catch((error) => {
            next(error);
        });
    } catch (err) {
        next(err);
    }
  };
}

export default UserController;