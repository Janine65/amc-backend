import { Component } from '@angular/core';
import { AccountAuswertung, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { isArray } from 'chart.js/dist/helpers/helpers.core';
import { MessageService, TreeNode } from 'primeng/api';

@Component({
  selector: 'app-kto-auswertung',
  templateUrl: './kto-auswertung.component.html',
  styleUrls: ['./kto-auswertung.component.scss']
})
export class KtoAuswertungComponent {

  selJahre = [{}]
  selJahr = 0;
  jahr = 0;
  lstAccountData: AccountAuswertung[] = [];
  lstAktivNodes: AccountAuswertung[] = [];
  lstPassivNodes: AccountAuswertung[] = [];
  lstAufwandNodes: AccountAuswertung[] = [];
  lstErfolgNodes: AccountAuswertung[] = [];

  constructor(
    private backendService: BackendService,
    private messageService: MessageService) {
    const str = localStorage.getItem('parameter');
    const parameter: ParamData[] = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)
    this.selJahr = this.jahr;
    this.selJahre.pop();
    this.selJahre.push({ label: (this.jahr - 4).toString(), value: this.jahr - 4 });
    this.selJahre.push({ label: (this.jahr - 3).toString(), value: this.jahr - 3 });
    this.selJahre.push({ label: (this.jahr - 2).toString(), value: this.jahr - 2 });
    this.selJahre.push({ label: (this.jahr - 1).toString(), value: this.jahr - 1 });
    this.selJahre.push({ label: this.jahr.toString(), value: this.jahr });
    this.selJahre.push({ label: (this.jahr + 1).toString(), value: this.jahr + 1 });
    this.readBericht();
  }

  chgJahr() {
    this.readBericht();
  }

  readBericht() {
    // Read Data
    this.backendService.showAccData(this.selJahr).subscribe({
      next: (result) => {
        if (result.length > 0) {
          this.lstAccountData = result;
          this.lstAktivNodes = [];
          this.lstPassivNodes = [];
          this.lstAufwandNodes = [];
          this.lstErfolgNodes = [];

          let iTotalAktiv = 0, iTotalPassiv = 0, iTotalAufwand = 0, iTotalErfolg = 0
          let iBudgetAufwand = 0, iBudgetErfolg = 0;

          this.lstAccountData.forEach(rec => {
            switch (rec.level) {
              case 1:
                this.lstAktivNodes.push(rec);
                iTotalAktiv += rec.amount;
                break;

              case 2:-
                this.lstPassivNodes.push(rec);
                iTotalPassiv += rec.amount;
                break;

              case 4:
                this.lstAufwandNodes.push(rec);
                iTotalAufwand += rec.amount;
                iBudgetAufwand += rec.budget;
                break;

              case 6:
                this.lstErfolgNodes.push(rec);
                iTotalErfolg += rec.amount;
                iBudgetErfolg += rec.budget;
                break;

              default:
                break;
            }
          })

          let iDiffTotal = iTotalAktiv - iTotalPassiv;
          let TotalRec = new AccountAuswertung();
          TotalRec.amount = iDiffTotal;
          TotalRec.name = iDiffTotal < 0 ? 'Verlust' : 'Gewinn';
          TotalRec.$css = iDiffTotal < 0 ? 'alert-minus' : 'alert-plus';
          if (iDiffTotal < 0) {
            this.lstAktivNodes.push(TotalRec);
          } else {
            this.lstPassivNodes.push(TotalRec);
          }
          TotalRec = new AccountAuswertung();
          TotalRec.amount = Math.max(iTotalAktiv, iTotalPassiv);
          TotalRec.name = 'Aktiv'
          TotalRec.$css = 'alert-total';
          this.lstAktivNodes.push(TotalRec)
          TotalRec = new AccountAuswertung();
          TotalRec.amount = Math.max(iTotalAktiv, iTotalPassiv);
          TotalRec.name = 'Passiv'
          TotalRec.$css = 'alert-total';
          this.lstPassivNodes.push(TotalRec)

          iDiffTotal = iTotalErfolg - iTotalAufwand;
          TotalRec = new AccountAuswertung();
          TotalRec.amount = iDiffTotal;
          TotalRec.budget = iBudgetErfolg - iBudgetAufwand;
          TotalRec.diff = TotalRec.budget - TotalRec.amount;
          TotalRec.name = iDiffTotal < 0 ? 'Verlust' : 'Gewinn';
          TotalRec.$css = iDiffTotal < 0 ? 'alert-minus' : 'alert-plus';
          if (iDiffTotal < 0) {
            this.lstErfolgNodes.push(TotalRec);
          } else {
            this.lstAufwandNodes.push(TotalRec);
          }
          TotalRec = new AccountAuswertung();
          TotalRec.amount = Math.max(iTotalAufwand, iTotalErfolg);
          TotalRec.budget = Math.max(iBudgetAufwand, iBudgetErfolg);
          TotalRec.diff = TotalRec.amount - TotalRec.budget;
          TotalRec.name = 'Erfolg';
          TotalRec.$css = 'alert-total';
          this.lstErfolgNodes.push(TotalRec);
          TotalRec = new AccountAuswertung();
          TotalRec.amount = Math.max(iTotalAufwand, iTotalErfolg);
          TotalRec.budget = Math.max(iBudgetAufwand, iBudgetErfolg);
          TotalRec.diff = TotalRec.amount - TotalRec.budget;
          TotalRec.name = 'Aufwand';
          TotalRec.$css = 'alert-total';
          this.lstAufwandNodes.push(TotalRec);
        }
      }
    })
  }
  export() {
    this.backendService.exportAccData(this.selJahr).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          this.backendService.downloadFile(result.filename).subscribe(
            {
              next(data) {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = result.filename;
                  link.click();
                }
              },
            }
          )
        }
      }
    })
  }

}
