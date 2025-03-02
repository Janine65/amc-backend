//src/auth/auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import { UserService } from '../modules/users/user.service';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    // Step 1: Fetch a user with the given email
    let user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Step 2: Check if the password is correct
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Step 3: Update the user's last login date
    user = await this.userService.updateLastLogin(user.id);
    // Step 4: Generate a JWT containing the user's ID and return it
    const authEntity = new AuthEntity(user);
    authEntity.accessToken = this.jwtService.sign({ userId: user.id });
    return authEntity;
  }

  async refresh(id: number): Promise<AuthEntity> {
    // Step 1: Fetch the user with the given ID
    const userOut = await this.userService.findOne(id);
    if (!userOut) {
      throw new NotFoundException('User not found');
    }
    const authEntity = new AuthEntity(userOut);
    // Step 2: Generate a new JWT containing the user's ID and return it
    authEntity.accessToken = this.jwtService.sign({ userId: id });
    return authEntity;
  }
}
