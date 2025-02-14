import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from 'src/config/config.module';
import { AdressenModule } from '../adressen/adressen.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule, ConfigModule, AdressenModule],
  exports: [UserService],
})
export class UserModule {}
