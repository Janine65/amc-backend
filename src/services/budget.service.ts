import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Budget } from '@/models/budget';
import { Account } from '@/models/account';
import { QueryTypes } from 'sequelize';
import { db } from '@/database/database';

@Service()
export class BudgetService {
    public async findAllBudget(jahr: string): Promise<Budget[]> {
        const allBudget: Budget[] = await Budget.findAll({
          where: { 'year': jahr },
          include: [
            { model: Account, as: 'accountAccount', required: true, attributes: ["id", "level", "order", "name", "status"] }
          ],
          order: [["accountAccount","order","asc"]]
            });
        return allBudget;
      }
    
      public async findBudgetById(budgetId: string): Promise<Budget> {
        const findBudget: Budget|null = await Budget.findByPk(budgetId);
        if (!findBudget) throw new GlobalHttpException(409, "Budget doesn't exist");
    
        return findBudget;
      }
    
      public async createBudget(budgetData: Budget): Promise<Budget> {
        const findBudget: Budget|null = await Budget.findOne({ where: { id: budgetData.id } });
        if (findBudget) throw new GlobalHttpException(409, `This key ${budgetData.id} already exists`);
    
        const createBudgetData: Budget = await Budget.create(budgetData);
        return createBudgetData;
      }
    
      public async updateBudget(budgetId: string, budgetData:Budget): Promise<Budget> {
        const findBudget: Budget|null = await Budget.findByPk(budgetId);
        if (!findBudget) throw new GlobalHttpException(409, "Budget doesn't exist");
    
        await Budget.update(budgetData, { where: { id: budgetId } });
    
        const updateBudget: Budget|null = await Budget.findByPk(budgetId);
        return updateBudget!;
      }
    
      public async deleteBudget(budgetId: string): Promise<Budget> {
        const findBudget: Budget|null = await Budget.findByPk(budgetId);
        if (!findBudget) throw new GlobalHttpException(409, "Budget doesn't exist");
    
        await Budget.destroy({ where: { id: budgetId } });
    
        return findBudget;
      }
    

      public async copyYear(from: string, to: string): Promise<unknown> {
        await Budget.destroy({where: {year: to}});

        const sqlquery = 'INSERT INTO "budget" ("year", "account", "amount", "memo") SELECT ?, account, amount, memo from "budget" where "year" = ?'
        const result = await db.sequelize.query(sqlquery,
          {
            replacements: [to,from],
            type: QueryTypes.INSERT,
            plain: false,
            
            raw: false
          }
        )
    
        return result;
      }
}
