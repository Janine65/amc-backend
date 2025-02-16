import { Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  create(createBudgetDto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: { account_budget_accountToaccount: true },
    });
  }

  findAll(year: number) {
    return this.prisma.budget.findMany({
      where: { year: year },
      orderBy: { account_budget_accountToaccount: { order: 'asc' } },
      include: { account_budget_accountToaccount: true },
    });
  }

  findOne(id: number) {
    return this.prisma.budget.findUnique({
      where: { id: id },
      include: { account_budget_accountToaccount: true },
    });
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return this.prisma.budget.update({
      where: { id: id },
      data: {
        ...updateBudgetDto,
        updatedAt: new Date(),
      },
      include: { account_budget_accountToaccount: true },
    });
  }

  remove(id: number) {
    return this.prisma.budget.delete({ where: { id: id } });
  }

  async copyYear(from: number, to: number) {
    const budgets = await this.prisma.budget.findMany({
      where: { year: from },
    });
    await this.prisma.budget.createMany({
      data: budgets.map((budget) => ({
        ...budget,
        id: undefined,
        year: to,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });
    return this.findAll(to);
  }
}
