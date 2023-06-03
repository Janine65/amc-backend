/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { Account, Budget, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  providers: [ConfirmationService]
})
export class BudgetComponent {
  selJahre = [{}]
  selJahr = 0;
  parameter: ParamData[];
  jahr: number;
  lstBudget: Budget[] = [];
  clonedlstBudget: Budget[] = [];
  selBudget: Budget = {};
  lstAccounts: Account[] = []
  loading = true;
  addRow = false;

  constructor(
    private backendService: BackendService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)
    this.selJahr = this.jahr;
    this.selJahre.pop();
    this.selJahre.push({label: (this.jahr - 1).toString(), value: this.jahr - 1});
    this.selJahre.push({label: this.jahr.toString(), value: this.jahr});
    this.selJahre.push({label: (this.jahr + 1).toString(), value: this.jahr + 1});

    this.backendService.getAccount().subscribe({
      next: (list) => {
        list.forEach(rec => {
          if (rec.level && rec.level >= 4)
            this.lstAccounts.push(rec)
        })
    }})

    this.readBudget()
  }

  readBudget() {
    this.loading = true;
    this.backendService.getBudget(this.selJahr).subscribe({
      next: (list) => {
        this.lstBudget = list;
        this.lstBudget.forEach( rec => {
          rec.acc_id = rec.acc?.id
          rec.acc_name = rec.acc?.name
          rec.acc_order = rec.acc?.order
        })
        this.loading = false;
      }
    })
  }

  chgJahr() {
    this.readBudget()
  }

  copyYear() {
    const nextYear = this.selJahr + 1
    this.confirmationService.confirm({
      message: 'Die Daten werden vom Jahr ' + this.selJahr + ' zum Jahr ' + nextYear + ' kopiert. Alle vorhandenen Einträge werden vorgängig gelöscht. Bitte bestätige diesen Vorgang',
      accept: () => {
        this.backendService.copyBudget(this.selJahr, nextYear).subscribe(
          { complete: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Kopiervorgang abgeschlossen' })
          }}
        )
        }
    });      

  }

  chgAcc(budget: Budget) {
    const acc = this.lstAccounts.find(rec => rec.id == budget.acc_id)
    if (acc) {
      budget.acc_name = acc.name
      budget.acc_order = acc.order
    }
  }

  onRowEditInit(budget: Budget) {
    this.clonedlstBudget[budget.id!] = { ...budget };
    this.addRow = false
  }

  onRowEditSave(budget: Budget) {
    this.addRow = false
    budget.account = budget.acc_id
    let sub
    if (budget.id === 0)
      sub = this.backendService.addBudget(budget)
    else 
      sub = this.backendService.updBudget(budget)

    sub.subscribe({
        next: (rec) => {
          delete this.clonedlstBudget[budget.id!];
          const ind: Budget | undefined = this.lstBudget.find(rec => rec.id == budget.id)
          if (ind) {
            Object.assign(ind, rec)
            ind.acc_id = ind.account
            const acc = this.lstAccounts.find(rec => rec.id == ind.acc_id)
            if (acc) {
              ind.acc_name = acc.name
              ind.acc_order = acc.order
            }
          }
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'budget is updated' });
        }
      })
  }

  onRowEditDelete(budget: Budget) {
    this.backendService.delBudget(budget).subscribe({
      next: () => {
        delete this.clonedlstBudget[budget.id!];
        const ind = this.lstBudget.findIndex(rec => rec.id == budget.id)
        delete this.lstBudget[ind]
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'budget is updated' });
      }
    })
  }

  onRowEditCancel(budget: Budget, index: number) {
    this.lstBudget[index] = this.clonedlstBudget[budget.id!];
    delete this.clonedlstBudget[budget.id!];
    this.addRow = false
  }

  onAddNewRow(){
    this.lstBudget.unshift({id: 0, acc_id: null, acc_name: null, acc_order: null, amount: 0, memo: '', year: this.selJahr});
    this.onRowEditInit(this.lstBudget[this.lstBudget.length-1]);
    this.addRow = true
  }
}
