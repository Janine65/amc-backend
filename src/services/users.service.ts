import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateUserDto, UpdateUserDto } from '@dtos/authentication.dto';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { User } from '@models/init-models';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await User.findAll();
    return allUser;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User|null = await User.findByPk(userId);
    if (!findUser) throw new GlobalHttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser: User|null = await User.findOne({ where: { email: userData.email } });
    if (findUser) throw new GlobalHttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash("$$Initial$$", 10);
    const createUserData: User = await User.create({ ...userData, password: hashedPassword });
    return createUserData;
  }

  public async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    const findUser: User|null = await User.findByPk(userId);
    if (!findUser) throw new GlobalHttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await User.update({ ...userData, password: hashedPassword }, { where: { id: userId } });

    const updateUser: User|null = await User.findByPk(userId);
    return updateUser!;
  }

  public async deleteUser(userId: string): Promise<User> {
    const findUser: User|null = await User.findByPk(userId);
    if (!findUser) throw new GlobalHttpException(409, "User doesn't exist");

    await User.destroy({ where: { id: userId } });

    return findUser;
  }

  public async setNewPass(userid: string): Promise<{newPass: string, findUser: User}> {
    const findUser: User|null = await User.findByPk(userid);
    if (!findUser) throw new GlobalHttpException(409, "User doesn't exists");
    
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newPass = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        newPass += charset.charAt(Math.floor(Math.random() * n));
    }

    const hashedPassword = await hash(newPass, 10);
    await User.update({ ...findUser, password: hashedPassword }, { where: { id: findUser.id } });
    
    return {newPass, findUser};
  }
}
