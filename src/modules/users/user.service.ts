import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ConfigService } from 'src/config/config.service';
import { AdressenService } from '../adressen/adressen.service';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private adressenService: AdressenService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.password) {
        createUserDto.password = await hash(
          createUserDto.password,
          roundsOfHashing,
        );
      }
    } catch (error) {
      throw new Error('Error hashing password - ' + error);
    }
    const userData = {
      ...createUserDto,
      userid: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.prisma.user.create({ data: userData });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  async updateLastLogin(id: number) {
    return this.prisma.user.update({
      data: { last_login: new Date() },
      where: { id: id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.user.update({ data: updateUserDto, where: { id: id } });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id: id } });
  }

  async newPassword(email: string) {
    const array = randomUUID()['split']('-');
    const newPassword: string = array.join('').substring(0, 10);
    console.log('newPassword', newPassword);
    const hashedPassword = await hash(newPassword, roundsOfHashing);
    const user = await this.prisma.user.update({
      data: { password: hashedPassword },
      where: { email: email },
    });
    if (user == null) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // TODO: Mail senden mit neuem Passwort
    const emailBody = {
      email_signature: '',
      email_an: user.email,
      email_cc: '',
      email_bcc: '',
      email_subject: 'Neues Passwort',
      email_body: 'Dein neues Passwort lautet: ' + newPassword,
      email_uploadfiles: '',
    };
    await this.adressenService.sendEmail(emailBody);

    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }
}
