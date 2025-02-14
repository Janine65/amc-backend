import { Module } from '@nestjs/common';
import { ClubmeisterService } from './clubmeister.service';
import { ClubmeisterController } from './clubmeister.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ClubmeisterController],
  providers: [ClubmeisterService],
  imports: [PrismaModule],
})
export class ClubmeisterModule {}
