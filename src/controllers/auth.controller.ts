import { NextFunction, Request, Response, Router } from 'express';
import { AuthenticateUserDto, CreateUserDto } from '@dtos/authentication.dto';
import { User } from '@models/user';
import { AuthService } from '@services/auth.service';
import { ValidationMiddleware } from '@/interfaces/validation.middleware';
import Controller from '@/interfaces/controller.interface';
import authMiddleware from '@/interfaces/auth.middleware';

class AuthController implements Controller {
  public path = '/auth/';
  public router:Router = Router();
  public auth = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(this.path + 'logout', authMiddleware, this.logOut);
    this.router.post(this.path + 'register', ValidationMiddleware(CreateUserDto), authMiddleware, this.signUp);
    this.router.post(this.path + 'login', ValidationMiddleware(AuthenticateUserDto), this.logIn);
    this.router.post(this.path + 'refreshToken', this.refreshToken);
  }

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.auth.signup(userData);

      req.query.id = signUpUserData.id as unknown as string;
      res.redirect('/user/newPass/' + req.query.id);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: AuthenticateUserDto = req.body;
      const { cookie, findUser } = await this.auth.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, cookie: cookie,  message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const { cookie, findUser } = await this.auth.refreshToken(userData);
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, cookie: cookie,  message: 'refresh' });
    } catch (error) {
      next(error);
    }
  }

  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.body;
      await this.auth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: undefined, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;