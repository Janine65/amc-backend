/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Fiscalyear } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-geschaeftsjahr',
  templateUrl: './geschaeftsjahr.component.html',
  styleUrls: ['./geschaeftsjahr.component.scss']
})
export class GeschaeftsjahrComponent implements OnInit {

  lstFiscalyear : Fiscalyear[] = []
  selFiscalyear: Fiscalyear = {};
  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  editMode = false;
  addMode = false;

  lstStates = [
    {label: 'Offen', value: 1},
    {label: 'provisorisch Abgeschlossen', value: 2},
    {label: 'Abgeschlossen', value: 3},
  ]
  selState = 1

  constructor(private backendService: BackendService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.cols = [
      { field: 'year', header: 'Jahr', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'name', header: 'Bezeichnung', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'state', header: 'Status', format: true, sortable: false, filtering: false, filter: undefined },
    ];

    this.toolbar = [
      {
        label: "Edit", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-edit",
        isDefault: true, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.editFiscalyear, roleNeeded: ''
      },
      {
        label: "Delete", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-minus",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delFiscalyear, roleNeeded: ''
      },
      {
        label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus",
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addFiscalyear, roleNeeded: ''
      },
      {
        label: "Export", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.exportFiscalyear, roleNeeded: ''
      },
    ];

    from(this.backendService.getFiscalyear())
    .subscribe(list => {
      this.lstFiscalyear = list;
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
        {complete: () => {
          thisRef.lstFiscalyear.splice(thisRef.lstFiscalyear.indexOf((selRec as Fiscalyear)),1)

          thisRef.messageService.add({ detail: 'Das Geschäftsjahr', closable: true, severity: 'info', sticky: false, summary: 'Anlass beenden' });

        }}
      )
  }

  addFiscalyear = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("New Fiscalyear");
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode = true;
  }

  exportFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    console.log("Export Fiscalyear");
    thisRef.messageService.clear();
  }

  private clearFields() {
    this.addMode = false;
    this.editMode = false;
    this.selFiscalyear = {}

  }
  save() {
    let sub : Observable<any>;

    if (this.addMode) {
      sub = this.backendService.addFiscalyear(this.selFiscalyear)
    } else {
      sub = this.backendService.updFiscalyear(this.selFiscalyear)
    }
    sub.subscribe(
      {complete: () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.backendService.getOneFiscalyear(this.selFiscalyear.year!).subscribe(
          { next: (entry) => {
            if (this.addMode) {
              this.lstFiscalyear.push(this.selFiscalyear);
              this.lstFiscalyear.sort((a : Fiscalyear, b : Fiscalyear) => (b.year ? parseInt(b.year) : 0)  - (a.year ? parseInt(a.year) : 0))
            }
            else
              this.lstFiscalyear = this.lstFiscalyear.map(obj => [entry].find(o => o.id === obj.id) || obj);

            this.clearFields();
          }}
        )
      }}
    )
  }
}
