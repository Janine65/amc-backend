/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { Account, Journal, JournalReceipt, ParamData, Receipt } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { Observable, from } from 'rxjs';


@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {


  lstJournal : Journal[] = []
  selJournal: Journal = {};
  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  editMode = false;
  addMode = false;

  lstStates = [
    {label: 'Aktiv', value: 1},
    {label: 'Inaktiv', value: 0},
  ]
  selState = 1
  parameter: ParamData[];
  jahr: number;
  lstAccounts: Account[] = [];
  selFromAccount: Account = {};
  selToAccount: Account = {};

  constructor(private backendService: BackendService, private messageService: MessageService) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)

  }

  ngOnInit(): void {
    this.cols = [
      { field: 'journalno', header: 'No.', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'date', header: 'Datum', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'fromAcc', header: 'Konto Soll', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'toAcc', header: 'Konto Haben', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'amount', header: 'Betrag', format: false, sortable: false, filtering: false, filter: undefined },
    ];

    this.toolbar = [
      {
        label: "Edit", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-edit",
        isDefault: true, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.editJournal, roleNeeded: 'admin'
      },
      {
        label: "Delete", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-minus",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delJournal, roleNeeded: 'admin'
      },
      {
        label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus",
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addJournal, roleNeeded: 'admin'
      },
    ];

    from(this.backendService.getJournal(this.jahr))
    .subscribe(list => {
      this.lstJournal = list;
      this.lstJournal.forEach(x => {
        x.date_date = new Date(x.date!);
        x.fromAcc = x.fromAccount?.name;
        x.from_account = x.fromAccount?.id;
        x.toAcc = x.toAccount?.name;
        x.to_account = x.toAccount?.id;
      })
      from(this.backendService.getAccount())
      .subscribe(list2 => {
        this.lstAccounts = list2;
      })
      this.loading = false;
    });
  }

  formatField(field: string, value: string | number | boolean | null): string | number | boolean | null {

    return value;
  }

  editJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log("Edit Journal");
    thisRef.messageService.clear();
    this.clearFields();
    this.editMode = true;
    if (selRec) {
      Object.assign(this.selJournal, selRec);
      Object.assign(this.selFromAccount, selRec.fromAccount);
      Object.assign(this.selToAccount, selRec.toAccount);
    }
  }

  delJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log("Del Journal");
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delJournal(selRec).subscribe(
        {complete: () => {
          thisRef.lstJournal.splice(thisRef.lstJournal.indexOf((selRec as Journal)),1)

          // thisRef.messageService.add({ detail: 'Das Geschäftsjahr', closable: true, severity: 'info', sticky: false, summary: 'Anlass beenden' });

        }}
      )
  }

  addJournal = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log("New Journal");
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode = true;
  }

  private clearFields() {
    this.addMode = false;
    this.editMode = false;
    this.selJournal = {}

  }
  save() {
    let sub : Observable<any>;

    if (this.addMode) {
      sub = this.backendService.addJournal(this.selJournal)
    } else {
      sub = this.backendService.updJournal(this.selJournal)
    }
    sub.subscribe(
      {complete: () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.backendService.getOneJournal(this.selJournal.id!).subscribe(
          { next: (entry) => {
            if (this.addMode) {
              this.lstJournal.push(this.selJournal);
              this.lstJournal.sort((a : Journal, b : Journal) => (a.journalno ? a.journalno : 0) - (b.journalno ? b.journalno : 0))
            }
            else
              this.lstJournal = this.lstJournal.map(obj => [entry].find(o => o.id === obj.id) || obj);

            this.clearFields();
          }}
        )
      }}
    )
  }
}
