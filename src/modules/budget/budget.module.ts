import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
  imports: [PrismaModule],
})
export class BudgetModule {}
