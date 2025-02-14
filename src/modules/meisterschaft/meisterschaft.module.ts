import { Module } from '@nestjs/common';
import { MeisterschaftService } from './meisterschaft.service';
import { MeisterschaftController } from './meisterschaft.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MeisterschaftController],
  providers: [MeisterschaftService],
  imports: [PrismaModule],
})
export class MeisterschaftModule {}
