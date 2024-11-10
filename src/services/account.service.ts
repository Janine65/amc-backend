import { Service } from 'typedi';
import { GlobalHttpException } from '@/exceptions/globalHttpException';
import { Account } from '@/models/account';
import { QueryTypes, Op, Sequelize } from 'sequelize';
import { db } from '@/database/database';
import { Journal } from '@/models/journal';
import { Budget } from '@/models/budget';
import { Workbook } from 'exceljs';
import { iFontSizeHeader, iFontSizeRow, iFontSizeTitel, setCellValueFormat } from './general.service';
import { systemVal } from '@/utils/system';
import { RetDataFile } from '@/models/generel';

@Service()
export class AccountService {
  public async findAllAccount(): Promise<Account[]> {
    const allAccount: Account[] = await Account.findAll(
      {
        order: [["level", "ASC"], ["order", "ASC"]]
      }
    );
    return allAccount;
  }

  public async findAccountById(accountId: string): Promise<Account> {
    const findAccount: Account | null = await Account.findByPk(accountId);
    if (!findAccount) throw new GlobalHttpException(409, "Account doesn't exist");

    return findAccount;
  }

  public async createAccount(accountData: Account): Promise<Account> {
    const findAccount: Account | null = await Account.findOne({ where: { longname: accountData.longname } });
    if (findAccount) throw new GlobalHttpException(409, `This key ${accountData.longname} already exists`);

    const createAccountData: Account = await Account.create(accountData);
    return createAccountData;
  }

  public async updateAccount(accountId: string, accountData: Account): Promise<Account> {
    const findAccount: Account | null = await Account.findByPk(accountId);
    if (!findAccount) throw new GlobalHttpException(409, "Account doesn't exist");

    await Account.update(accountData, { where: { id: accountId } });

    const updateAccount: Account | null = await Account.findByPk(accountId);
    return updateAccount!;
  }

  public async deleteAccount(accountId: string): Promise<Account> {
    const findAccount: Account | null = await Account.findByPk(accountId);
    if (!findAccount) throw new GlobalHttpException(409, "Account doesn't exist");

    await Account.destroy({ where: { id: accountId } });

    return findAccount;
  }

  public async getAccountJahr(jahr: string, all: number): Promise<Account[]> {
    let findAccounts: Account[] = [];
    let arJournalIds = [];

    let arfromAcc: { id: string }[] = await db.sequelize.query("SELECT DISTINCT from_account as id FROM journal WHERE year(date) = ?",
      {
        replacements: [jahr],
        type: QueryTypes.SELECT,
        plain: false,

        raw: false
      }
    );

    for (let element of arfromAcc) {
      arJournalIds.push(element.id);
    }

    arfromAcc = await db.sequelize.query("SELECT DISTINCT to_account as id FROM journal WHERE year(date) = ?",
      {
        replacements: [jahr],
        type: QueryTypes.SELECT,
        plain: false,

        raw: false
      }
    );

    for (let element of arfromAcc) {
      arJournalIds.push(element.id);
    }

    if (all == 0) {
      findAccounts = await Account.findAll(
        {
          where: {
            [Op.and]: [
              { "order": { [Op.gt]: 10 } },
              { "status": 1 },
              { "id": { [Op.in]: arJournalIds } }
            ]
          },
          order: [["level", "ASC"], ["order", "ASC"]]
        })
    } else {
      findAccounts = await Account.findAll(
        {
          where:
          {
            "order": { [Op.gt]: 10 }
          },
          order: [["level", "ASC"], ["order", "ASC"]]
        })
    }

    return findAccounts;
  }

  public async getOneDataByOrder(order: string): Promise<Account | null> {
    const findAccount = await Account.findOne({ where: { "order": order } });
    return findAccount;
  }

  public async getAmountOneAcc(order: string, date: Date): Promise<unknown> {
		let amount = 0
		const account = await Account.findOne({ where: { "order": order } });
    if (account) {
      let toJournals = await Journal.findAll({
        attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],					
        where: [{ "date": { [Op.lt]: date } },
            Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), date.getFullYear()),
          {"to_account": account.id}]      
      });
      if (toJournals.length == 1)
        amount -= toJournals[0].amount ?? 0;

      let fromJournals = await Journal.findAll({
        attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],					
        where: [{ "date": { [Op.lt]: date } },
            Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), date.getFullYear()),
            {"from_account": account.id}]}        
      );
      if (fromJournals.length == 1)
        amount += fromJournals[0].amount ?? 0;
    }
    return {amount: amount, id: account?.id}

  }


  public async getFKData(filter: string | null): Promise<unknown[]> {
    const arReturn: unknown[] | PromiseLike<unknown[]> = []
		const findAccounts = await Account.findAll({
			attributes: ["id", [Sequelize.fn('CONCAT', Sequelize.col("name"), ' ', Sequelize.col("order")), "name"]],
			where: [
				Sequelize.where(Sequelize.fn('LOWER', Sequelize.col("name")), { [Op.substring]: (filter ?? '') }),
				{ "order": { [Op.ne]: Sequelize.col("level") } },
				{ "status": 1 }
			],
			order: [["level", "ASC"], ["order", "ASC"]]
		});
    findAccounts.forEach((acc) => {
      arReturn.push({id: acc.id, value: '<span class="small">' + acc.name + '</span>'})
    })

    return arReturn;
  }

  public async getAccountSummary(jahr: string): Promise<unknown[]> {
    let arData:{id?: number | undefined, name?: string, level?: number, order?: number, status?: number, amount?: number, budget?: number, diff?: number, $css?: string}[] = [];
		const arBudget = await Budget.findAll({
			attributes: ["amount"],
			where: { 'year': jahr },
			include: [
				{ model: Account, as: 'accountAccount', required: true, attributes: ["id", "level", "order", "name", "status"] }
			]
		});

    const arJournalF = await Journal.findAll({
			attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],
			where: Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), jahr),
			include: [
				{
					model: Account, as: 'fromAccountAccount', required: true,
					attributes: ["id", "level", "order", "name", "status"]
				}],
			group: ["fromAccountAccount.id", "fromAccountAccount.level", "fromAccountAccount.order", "fromAccountAccount.name", "fromAccountAccount.status"],
			order: [["fromAccountAccount", "level", "ASC"], ["fromAccountAccount", "order", "ASC"]]
		});

    const arJournalT = await Journal.findAll({
					attributes: [[Sequelize.fn('sum', Sequelize.col("amount")), "amount"]],
					where: Sequelize.where(Sequelize.fn('year', Sequelize.col("date")), jahr),
					include: [
						{ model: Account, as: 'toAccountAccount', required: true, attributes: ["id", "level", "order", "name", "status"] }],
					group: ["toAccountAccount.id", "toAccountAccount.level", "toAccountAccount.order", "toAccountAccount.name", "toAccountAccount.status"],
					order: [["toAccountAccount", "level", "ASC"], ["toAccountAccount", "order", "ASC"]]
				});

    arJournalF.forEach((jour) => {
      let record :{id?: number | undefined, name?: string, level?: number, order?: number, status?: number, amount?: number, budget?: number, diff?: number, $css?: string} = {}
      record.id = jour.fromAccountAccount.id;
      record.name = jour.fromAccountAccount.name;
      record.order = jour.fromAccountAccount.order;
      record.level = jour.fromAccountAccount.level;
      record.status = jour.fromAccountAccount.status;
      record.budget = 0;
      record.diff = 0;
      record.$css = jour.fromAccountAccount.status ? 'active' : 'inactive';

      const findBudget = arBudget.findIndex(bud => bud.accountAccount.id == record.id!)

      switch (record.level) {
        case 1:
        case 4:
          record.amount = +Number(jour.amount ?? 0).toFixed(2);
          if (findBudget >= 0) {
            record.budget = +Number(arBudget[findBudget].amount ?? 0).toFixed(2)!;
            record.diff = +(record.budget - record.amount).toFixed(2);
            arBudget.splice(findBudget, 1);
          }
          break;
      
        case 2:
        case 6:
          record.amount = -Number(jour.amount ?? 0).toFixed(2);
          if (findBudget >= 0) {
            record.budget = +Number(arBudget[findBudget].amount ?? 0).toFixed(2)!;
            record.diff = +(record.amount - record.budget!).toFixed(2);
            arBudget.splice(findBudget, 1);
          }
          break;

        default:
          record.amount = jour.amount ?? 0;
          break;
      }      
      const findToAcc = arJournalT.findIndex(acc => acc.toAccountAccount.id == record.id);
      if (findToAcc >= 0) {
        switch (record.level) {
          case 1:
          case 4:
            record.amount -= +Number(arJournalT[findToAcc].amount ?? 0).toFixed(2);
            record.amount = +Number(record.amount).toFixed(2);
            record.diff = +(record.budget! - record.amount).toFixed(2);
            break;
        
          case 2:
          case 6:
            record.amount += +Number(arJournalT[findToAcc].amount ?? 0).toFixed(2)
            record.amount = +Number(record.amount).toFixed(2);
            record.diff = +(record.amount - record.budget!).toFixed(2);
            break;

          default:
            break;
        }
        arJournalT.splice(findToAcc, 1);
      }
      arData.push(record);
    })

    arJournalT.forEach(jour => {
      let record :{id?: number | undefined, name?: string, level?: number, order?: number, status?: number, amount?: number, budget?: number, diff?: number, $css?: string} = {}
      record.id = jour.toAccountAccount.id;
      record.name = jour.toAccountAccount.name;
      record.order = jour.toAccountAccount.order;
      record.level = jour.toAccountAccount.level;
      record.status = jour.toAccountAccount.status;
      record.budget = 0;
      record.diff = 0;
      record.$css = jour.toAccountAccount.status ? 'active' : 'inactive';

      const findBudget = arBudget.findIndex(bud => bud.accountAccount.id == record.id!)
      switch (record.level) {
        case 1:
        case 4:
          record.amount = -Number(jour.amount ?? 0).toFixed(2);
          if (findBudget >= 0) {
            record.budget = +Number(arBudget[findBudget].amount ?? 0).toFixed(2)!;
            record.diff = +(record.budget! - record.amount).toFixed(2);
            arBudget.splice(findBudget, 1);
          }
          break;
      
        case 2:
        case 6:
          record.amount = +Number(jour.amount ?? 0).toFixed(2);
          if (findBudget >= 0) {
            record.budget = +Number(arBudget[findBudget].amount ?? 0).toFixed(2)!;
            record.diff = +(record.amount - record.budget!).toFixed(2);
            arBudget.splice(findBudget, 1);
          }
          break;

        default:
          record.amount = jour.amount ?? 0;
          break;
      }      
      arData.push(record);
    })

    arBudget.forEach(budg => {
      let record :{id?: number | undefined, name?: string, level?: number, order?: number, status?: number, amount?: number, budget?: number, diff?: number, $css?: string} = {}
      record.id = budg.accountAccount.id;
      record.name = budg.accountAccount.name;
      record.order = budg.accountAccount.order;
      record.level = budg.accountAccount.level;
      record.status = budg.accountAccount.status;
      record.budget = +Number(budg.amount).toFixed(2);
      record.amount = 0;
      record.diff = 0;
      record.$css = budg.accountAccount.status ? 'active' : 'inactive';

      switch (record.level) {
        case 1:
        case 4:
            record.diff = +(record.budget! - record.amount).toFixed(2);
          break;
      
        case 2:
        case 6:
            record.diff = +(record.amount - record.budget!).toFixed(2);
            break;
        default:
          break;
      }      
      arData.push(record);
    })
    // Jetzt alle Datanesätze von inaktiven Konton ohne Betrag entfernen
    const arFiltered = arData.filter(rec => rec.status === 1 || rec.amount !== 0 || rec.budget !== 0)

    arFiltered.sort((a, b) => {
      if (a.level! < b.level!)
        return -1
      if (a.level == b.level && a.order! <= b.order!)
        return -1
      return 1
    });

    return arFiltered;
  }

  public async writeKontoauszug (year: string, all: boolean = false): Promise<RetDataFile> {
    const payload: RetDataFile = {type: 'info', message: '', data: {filename: ''}};

    let arAccount: Account[];
    if (all == true) {
      arAccount = await Account.findAll({
        where: [{ "order": { [Op.gt]: 9 } },
        { "status": 1 }],
        order: ["order"]        
      });
    } else {
      const arJournal = await Journal.findAll({
        attributes: ["from_account", "to_account"],
        where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), year)
      });
     
      let alAccounts: number[] = arJournal.map(rec => rec.from_account!);
      alAccounts = alAccounts.concat(...(arJournal.map(rec => rec.to_account!))).sort();
      for (let i=0; i<alAccounts.length; ++i) {
        for (let j=i+1; j<alAccounts.length; ++j) 
          if (alAccounts[i] == alAccounts[j])
            alAccounts.splice(j--, 1);
      }

      arAccount = await Account.findAll({
        where: [{ "order": { [Op.gt]: 9 } },
        { "id": { [Op.in]: alAccounts } }],
        order: ["order"]  
      });
    }

    const workbok = new Workbook();
    workbok.creator = "Janine Franken";
    workbok.calcProperties.fullCalcOnLoad = true;

    for(const element of arAccount) {

      const sSheetName = element.order + " " + element.name!.replace("/", "");
      const sheet = workbok.addWorksheet(sSheetName.substring(0, 31), {
        pageSetup: {
            fitToPage: true,
            fitToHeight: 1,
            fitToWidth: 1,
        },
        properties: {
            defaultRowHeight: 18
        },
        headerFooter: {
            oddHeader: "&18Auto-Moto-Club Swissair",
            oddFooter: "&14" + element.name + " " + element.name + " " + year
        }
      });

      setCellValueFormat(sheet, 'B1', element.order + " " + element.name, false, undefined, { bold: true, size: iFontSizeHeader, name: 'Tahoma' });
      setCellValueFormat(sheet, 'B3', "No.", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'C3', "Datum", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'D3', "Gegenkonto", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'E3', "Text ", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      setCellValueFormat(sheet, 'F3', "Soll ", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      sheet.getCell('F3').alignment = { horizontal: "right" };
      setCellValueFormat(sheet, 'G3', "Haben", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      sheet.getCell('G3').alignment = { horizontal: "right" };
      setCellValueFormat(sheet, 'H3', "Saldo", true, undefined, { bold: true, size: iFontSizeTitel, name: 'Tahoma' });
      sheet.getCell('H3').alignment = { horizontal: "right" };
      sheet.getColumn('B').width = 12;
      sheet.getColumn('C').width = 12;
      sheet.getColumn('D').width = 35;
      sheet.getColumn('E').width = 55;
      sheet.getColumn('F').width = 12;
      sheet.getColumn('G').width = 12;
      sheet.getColumn('H').width = 12;

      let iSaldo = 0.0;
      let iRow = 4;

      let arJournal = await Journal.findAll({
          where: [Sequelize.where(Sequelize.fn('YEAR', Sequelize.col("date")), year),
          {
              [Op.or]: [
                  { "from_account": element.id },
                  { "to_account": element.id }
              ]
          }],
          order: ["journalno", "date"]
      });

      for (let ind2 = 0; ind2 < arJournal.length; ind2++) {
          const entry = arJournal[ind2];
          const iAmount = Number(entry.amount ?? 0);

          setCellValueFormat(sheet, 'B' + iRow, entry.journalno, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
          setCellValueFormat(sheet, 'C' + iRow, entry.date, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
          setCellValueFormat(sheet, 'E' + iRow, entry.memo, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
          sheet.getCell('F' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
          sheet.getCell('G' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';
          sheet.getCell('H' + iRow).numFmt = '#,##0.00;[Red]\-#,##0.00';

          if (entry.from_account == element.id) {
              const toAcc = arAccount.find(rec => rec.id == entry.to_account);
              if (toAcc)
                  setCellValueFormat(sheet, 'D' + iRow, toAcc.order + " " + toAcc.name, true, undefined, { size: iFontSizeTitel, name: 'Tahoma' });

              else
                  setCellValueFormat(sheet, 'D' + iRow, entry.to_account, true, undefined, { size: iFontSizeTitel, name: 'Tahoma' });

              setCellValueFormat(sheet, 'F' + iRow, iAmount, true, undefined, { size: iFontSizeTitel, name: 'Tahoma' });
              setCellValueFormat(sheet, 'G' + iRow, "", true, undefined, { size: iFontSizeTitel, name: 'Tahoma' });
              if (element.level == 2 || element.level == 6)
                  iSaldo -= iAmount;

              else
                  iSaldo += iAmount;
              setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, undefined, { size: iFontSizeTitel, name: 'Tahoma' });
          } else {
              const fromAcc = arAccount.find(rec => rec.id == entry.from_account);
              if (fromAcc)
                  setCellValueFormat(sheet, 'D' + iRow, fromAcc.order + " " + fromAcc.name, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });

              else
                  setCellValueFormat(sheet, 'D' + iRow, entry.from_account, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
              setCellValueFormat(sheet, 'F' + iRow, "", true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
              setCellValueFormat(sheet, 'G' + iRow, iAmount, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
              if (element.level == 2 || element.level == 6)
                  iSaldo += iAmount;

              else
                  iSaldo -= iAmount;
              setCellValueFormat(sheet, 'H' + iRow, iSaldo, true, undefined, { size: iFontSizeRow, name: 'Tahoma' });
          }
          iRow++;
      }

    }

    const filename = "Kontoauszug-" + year + ".xlsx";
    await workbok.xlsx.writeFile(systemVal.exports + filename)
        .catch((e) => {
            console.error(e);
            payload.type = 'error';
            payload.message = e;
            return e;
        });

    payload.data!.filename = filename;
    return payload;
  }
}
