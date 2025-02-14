import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { ParameterController } from './parameter.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ParameterController],
  providers: [ParameterService],
  imports: [PrismaModule],
  exports: [ParameterService],
})
export class ParameterModule {}
