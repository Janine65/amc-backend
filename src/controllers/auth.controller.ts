import { NextFunction, Request, Response, Router } from 'express';
import { AuthenticateUserDto, CreateUserDto } from '@dtos/authentication.dto';
import { User } from '@models/user';
import { AuthService } from '@services/auth.service';
import { ValidationMiddleware } from '@/interfaces/validation.middleware';
import Controller from '@/interfaces/controller.interface';
import authMiddleware from '@/interfaces/auth.middleware';
import { RetDataUser } from '@/models/generel';
import { UserService } from '@/services/users.service';
import { AdresseService, EmailBody } from '@/services/adresse.service';


class AuthController implements Controller {
  public path = '/auth/';
  public router:Router = Router();
  public auth = new AuthService();
  public userSrv = new UserService();
  public adresseSrv = new AdresseService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(this.path + 'logout', authMiddleware, this.logOut);
    this.router.post(this.path + 'register', authMiddleware, this.signUp);
    this.router.post(this.path + 'login', ValidationMiddleware(AuthenticateUserDto), this.logIn);
    this.router.post(this.path + 'refreshToken', this.refreshToken);
  }

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const newUser: User = await this.auth.signup(userData);

      this.userSrv.setNewPass(newUser.email)
      .then(async (retVal: {newPass: string, findUser: User}) => {
        const newPass = retVal.newPass;
        const user = retVal.findUser;
        const emailBody:EmailBody = {
          email_signature: 'JanineFranken',
          email_an: user.email,
          email_cc: '',
          email_bcc: '',
          email_subject: 'AMC Interna - Willkommen beim Auto-Moto-Club Swissair',
          email_body: `Hallo ${user.name}<br/>` +
          `Dir wurde ein Zugriff auf die interne Applikation eingerichtet. Deine Logindaten sind:<br/>` +
          `Email: ${user.email}<br/>` +
          `Passwort: ${newPass} - bitte ändere dieses gleich nach dem ersten Login<br/>` +
          'Die Applikation ist zu finden unter: http://interna.automoto-sr.info',
          email_uploadfiles: undefined
        }
        console.log(emailBody);
        await this.adresseSrv.sendEmail(emailBody);
        res.status(201).json({ data: newUser, message: 'signup' });
      })
    .catch((error) => {
        next(error);
    });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: AuthenticateUserDto = req.body;
      const { cookie, findUser } = await this.auth.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      const retData: RetDataUser = { type: 'info', data: findUser, cookie: cookie,  message: 'login' };
      res.status(200).json(retData);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const { cookie, findUser } = await this.auth.refreshToken(userData);
      res.setHeader('Set-Cookie', [cookie]);
      const retData: RetDataUser = { type: 'info', data: findUser, cookie: cookie,  message: 'login' };
      console.log(`User ${findUser.email} as refreshed the token`)
      res.status(200).json(retData);
    } catch (error) {
      next(error);
    }
  }

  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.body;
      await this.auth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      const retData: RetDataUser = { type: 'info', data: undefined, cookie: undefined,  message: 'logout' };
      res.status(200).json(retData);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;