import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@/models/user';

import { systemVal } from '@/utils/system';
import WrongAuthenticationTokenException from '@/exceptions/wrongAuthenticationTokenException';
import AuthenticationTokenMissingException from '@/exceptions/authenticationTokenMissingException';


async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  let authorization = undefined;
  const cookies = req.cookies;
  if (cookies?.Authoriation)
    authorization = cookies.Authoriation
  else {
      authorization = req.header('Authorization');
    if (authorization)
      authorization = authorization.split('Bearer ')[1];
    }

    if (authorization) {
    const secret = systemVal.gConfig.secret || '';
    try {
      const verificationResponse = verify(authorization, secret) as DataStoredInToken;
      const id = verificationResponse.id;
      const user = await User.findByPk(id);
      if (user) {
        req.user = user;
        console.log('User ' + user.name + ' is logged in')
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      console.log(error);
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }

}

export default authMiddleware;