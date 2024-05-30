/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Fiscalyear } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, from, timer } from 'rxjs';


type Severity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

@Component({
  selector: 'app-geschaeftsjahr',
  templateUrl: './geschaeftsjahr.component.html',
  styleUrls: ['./geschaeftsjahr.component.scss'],
  providers: [DialogService]
})
export class GeschaeftsjahrComponent implements OnInit {

  lstFiscalyear: Fiscalyear[] = []
  selFiscalyear: Fiscalyear = {};
  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  editMode = false;
  addMode = false;
  progressVisible = false;
  fTag: {value: string, severity: string} = {value : 'gestartet', severity: 'info'}
  kTag: {value: string, severity: string} = {value : 'gestartet', severity: 'info'}
  jTag: {value: string, severity: string} = {value : 'gestartet', severity: 'info'}
  fSev: Severity = 'info'
  fValue = 'gestartet'
  kSev: Severity = 'info'
  kValue = 'gestartet'
  jSev: Severity = 'info'
  jValue = 'gestartet'

  lstStates = [
    { label: 'Offen', value: 1 },
    { label: 'provisorisch Abgeschlossen', value: 2 },
    { label: 'Abgeschlossen', value: 3 },
  ]
  selState = 1

  constructor(private backendService: BackendService,
    private dialogService: DialogService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'year', header: 'Jahr', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'name', header: 'Bezeichnung', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'state', header: 'Status', format: true, sortable: false, filtering: false, filter: undefined },
    ];

    this.toolbar = [
      {
        label: "Edit", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-edit",
        isDefault: true, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.editFiscalyear, roleNeeded: '', isEditFunc: true
      },
      {
        label: "Delete", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-minus",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delFiscalyear, roleNeeded: '', isEditFunc: false
      },
      {
        label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus",
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addFiscalyear, roleNeeded: '', isEditFunc: false
      },
      {
        label: "Export", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.exportFiscalyear, roleNeeded: '', isEditFunc: false
      },
      {
        label: "prov. Abschliessen", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.closeTempFiscalyear, roleNeeded: '', isEditFunc: false
      },
      {
        label: "Abschliessen", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.closeFiscalyear, roleNeeded: '', isEditFunc: false
      },
    ];

    from(this.backendService.getFiscalyear())
      .subscribe(list => {
        this.lstFiscalyear = list;
        this.lstFiscalyear.forEach(rec => {
          switch(rec.state) {
            case 1:
              rec.classRow = 'offen';
              break;
            case 2:
              rec.classRow = 'provisorisch';
              break;
            case 3:
              rec.classRow = 'abgeschlossen';
              break;
            }
        })
        this.loading = false;
      });
  }

  formatField(field: string, value: string | number | boolean | null): string | number | boolean | null {
    if (field == 'state') {
      switch (value as number) {
        case 1:
          return 'Offen'

        case 2:
          return 'Provisorisch abgeschlossen'

        case 3:
          return 'Abgeschlossen'
      }
    }
    return value;
  }

  closeTempFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Close temporary Fiscalyear");
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.closeFiscalyear(selRec.year, 2).subscribe(
        {
          complete: () => {
            const ind = this.lstFiscalyear.findIndex(rec => rec.id == selRec.id)
            this.lstFiscalyear[ind].state = 2;
            thisRef.messageService.add({ detail: 'Das Geschäftsjahr wurde provisorisch abgeschlossen', closable: true, severity: 'info', sticky: false, summary: 'Geschäftsjahr abschliessen' });

          }
        }
      )

  }

  closeFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Close temporary Fiscalyear");
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.closeFiscalyear(selRec.year, 3).subscribe(
        {
          complete: () => {
            const ind = this.lstFiscalyear.findIndex(rec => rec.id == selRec.id)
            this.lstFiscalyear[ind].state = 3;
            thisRef.messageService.add({ detail: 'Das Geschäftsjahr wurde abgeschlossen', closable: true, severity: 'info', sticky: false, summary: 'Geschäftsjahr abschliessen' });

          }
        }
      )

  }

  editFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Edit Fiscalyear");
    thisRef.messageService.clear();
    this.clearFields();
    this.editMode = true;
    if (selRec)
      Object.assign(this.selFiscalyear, selRec)
  }

  delFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Del Fiscalyear");
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delFiscalyear(selRec).subscribe(
        {
          complete: () => {
            thisRef.lstFiscalyear.splice(thisRef.lstFiscalyear.indexOf((selRec)), 1)

            thisRef.messageService.add({ detail: 'Das Geschäftsjahr', closable: true, severity: 'info', sticky: false, summary: 'Anlass beenden' });

          }
        }
      )
  }

  addFiscalyear = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("New Fiscalyear");
    this.clearFields();
    this.selFiscalyear.state = 1;
    thisRef.messageService.clear();
    this.addMode = true;
  }

  exportFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Export Fiscalyear");
    thisRef.messageService.clear();
    this.fSev = 'info'
    this.fValue = 'gestartet'
    this.kSev = 'info'
    this.kValue = 'gestartet'
    this.jSev = 'info'
    this.jValue = 'gestartet'
    thisRef.progressVisible = true

    thisRef.fSev = 'warning'
    thisRef.fValue = 'gestartet'
    thisRef.backendService.exportAccData(Number(selRec.year))
      .subscribe({
        next: (result) => {
          thisRef.backendService.downloadFile(result.filename)
            .subscribe({
              next: (data) => {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = result.filename;
                  link.click(); 
                }
              },
              complete: () => {
                thisRef.fSev = 'success'
                thisRef.fValue = 'geladen'
              }
            })
        },
        complete: () => {
          thisRef.kSev = 'warning'
          thisRef.kValue = 'gestartet'
          thisRef.backendService.exportAccountData(Number(selRec.year))
            .subscribe({
              next: (result) => {
                thisRef.backendService.downloadFile(result.filename)
                  .subscribe({
                    next: (data) => {
                      if (data.body) {
                        const blob = new Blob([data.body]);
                        const downloadURL = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadURL;
                        link.download = result.filename;
                        link.click();
                      }
                    },
                    complete: () => {
                      thisRef.kSev = 'success'
                      thisRef.kValue = 'geladen'
                    }
                  })
              },
              complete: () => {
                thisRef.jSev = 'warning'
                thisRef.jValue = 'gestartet'
                thisRef.backendService.exportJournal(Number(selRec.year), 1)
                  .subscribe({
                    next: (result) => {
                      thisRef.backendService.downloadFile(result.filename)
                        .subscribe({
                          next: (data) => {
                            if (data.body) {
                              const blob = new Blob([data.body]);
                              const downloadURL = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = downloadURL;
                              link.download = result.filename;
                              link.click();
                            }
                          },
                          complete: () => {
                            thisRef.jSev = 'success'
                            thisRef.jValue = 'geladen'
                            timer(2000).subscribe(() => {
                              thisRef.progressVisible = false
                            })
                          }
                        })
                    }
                  })
              }
            })
        }
      })
  }

  private clearFields() {
    this.addMode = false;
    this.editMode = false;
    this.selFiscalyear = {}

  }
  save() {
    let sub: Observable<any>;

    if (this.addMode) {
      sub = this.backendService.addFiscalyear(this.selFiscalyear)
    } else {
      sub = this.backendService.updFiscalyear(this.selFiscalyear)
    }
    sub.subscribe(
      {
        complete: () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.backendService.getOneFiscalyear(this.selFiscalyear.year).subscribe(
            {
              next: (entry) => {
                if (this.addMode) {
                  this.lstFiscalyear.push(this.selFiscalyear);
                  this.lstFiscalyear.sort((a: Fiscalyear, b: Fiscalyear) => (b.year ? parseInt(b.year) : 0) - (a.year ? parseInt(a.year) : 0))
                }
                else
                  this.lstFiscalyear = this.lstFiscalyear.map(obj => [entry].find(o => o.id === obj.id) || obj);

                this.clearFields();
              }
            }
          )
        }
      }
    )
  }
}
