/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-this-alias */
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Journal, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { from } from 'rxjs';

@Component({
  selector: 'app-konto-bewegungen',
  templateUrl: './konto-bewegungen.component.html',
  styleUrls: ['./konto-bewegungen.component.scss']
})
export class KontoBewegungenComponent implements OnInit {
  accountId: number;
  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  selJahre = [{}]
  selJahr = 0;

  lstJournal: Journal[] = []

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService) {
    this.accountId = config.data.accountid;

    const str = localStorage.getItem('parameter');
    const parameter: ParamData[] = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');
    this.selJahr = Number(paramJahr?.value)
    this.selJahre.pop();
    this.selJahre.push({ label: (this.selJahr - 2).toString(), value: this.selJahr - 2 });
    this.selJahre.push({ label: (this.selJahr - 1).toString(), value: this.selJahr - 1 });
    this.selJahre.push({ label: this.selJahr.toString(), value: this.selJahr });
    this.selJahre.push({ label: (this.selJahr + 1).toString(), value: this.selJahr + 1 });


  }

  ngOnInit(): void {
    this.cols = [
      { field: 'journalno', header: 'No.', format: false, sortable: true, filtering: true, filter: 'numeric', pipe: DecimalPipe, args: '1.0-0' },
      { field: 'date_date', header: 'Datum', format: false, sortable: true, filtering: true, filter: 'date', pipe: DatePipe, args: 'dd.MM.yyyy' },
      { field: 'fromAcc', header: 'Konto Soll', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'toAcc', header: 'Konto Haben', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'memo', header: 'Text', format: false, sortable: false, filtering: false, filter: 'text' },
      { field: 'soll', header: 'Soll', format: false, sortable: true, filtering: false, filter: 'numeric', pipe: DecimalPipe, args: '1.2-2' },
      { field: 'haben', header: 'Haben', format: false, sortable: true, filtering: false, filter: 'numeric', pipe: DecimalPipe, args: '1.2-2' },
    ];

    this.toolbar = [
      { label: 'Schliessen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: false, roleNeeded: '' , isEditFunc: false},
    ];

    this.readJournal();
  
  }

  private readJournal() {
    from(this.backendService.getOneAccount(this.selJahr, this.accountId))
      .subscribe(list => {
        this.lstJournal = list;
        console.log(list);
        this.lstJournal.forEach(x => {
          x.date_date = new Date(x.date!);
        })
        this.loading = false;
      });
  }

  chgJahr() {
    this.readJournal();
  }

  back = () => {
    this.ref.close()
  }
}
