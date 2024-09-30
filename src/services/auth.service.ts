import { compareSync, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { AuthenticateUserDto, CreateUserDto } from '@dtos/authentication.dto';
import { GlobalHttpException } from '@exceptions/globalHttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@models/user';
import { v4 as uuid } from 'uuid';

import { systemVal } from '@/utils/system';

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const expiresIn: number = 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, systemVal.gConfig.secret, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};
@Service()
export class AuthService {
  public async signup(userData: CreateUserDto): Promise<User> {
    const findUser: User|null = await User.findOne({ where: { email: userData.email } });
    if (findUser) throw new GlobalHttpException(409, `This login ${userData.email} already exists`);

    const hashedPassword = await hash("DasIstEinDefaultPassword", 10);
    
    const createUserData: User = await User.create({ ...userData, password: hashedPassword, userid: uuid() });

    return createUserData;
  }

  public async login(userData: AuthenticateUserDto): Promise<{ cookie: string; findUser: User }> {
    const findUser: User|null = await User.findOne({ where: { email: userData.email } });
    if (!findUser) throw new GlobalHttpException(409, `This login ${userData.email} was not found`);

    const isPasswordMatching: boolean = compareSync(userData.password, findUser.password);
    if (!isPasswordMatching) throw new GlobalHttpException(409, 'Password not matching');
    await findUser.update('last_login', new Date());
    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return { cookie, findUser };
  }

  public async refreshToken(findUser: User) : Promise<{ cookie: string; findUser: User }> {

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return { cookie, findUser };

  }

  public async logout(userData: User): Promise<User> {
    const findUser: User|null = await User.findOne({ where: { email: userData.email, password: userData.password } });
    if (!findUser) throw new GlobalHttpException(409, "User doesn't exist");

    return findUser;
  }
}
