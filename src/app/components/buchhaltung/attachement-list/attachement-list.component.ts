import { Component } from '@angular/core';
import { Receipt } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-attachement-list',
  templateUrl: './attachement-list.component.html',
  styleUrls: ['./attachement-list.component.scss'],
  providers: [DialogService]
})
export class AttachementListComponent {
  journalid: number;
  jahr: number;
  lstReceipts: Receipt[];

  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService) {
    this.journalid = config.data.journalid;
    this.jahr = config.data.jahr;
    this.lstReceipts = [];
    this.cols = [
      { field: 'receipt', header: 'Attachement', format: false, sortable: false, filtering: false, filter: undefined },
      { field: 'bezeichnung', header: 'Beschreibung', format: false, sortable: false, filtering: false, filter: undefined },
    ];

    this.toolbar = [
      {label: 'Schliessen', btnClass: 'p-button-primary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: true, roleNeeded: ''}
    ];

    if (config.data.type == 'one' && this.journalid) {
      this.backendService.getAttachment(this.journalid, this.jahr)
        .subscribe(list => {
          this.lstReceipts = list;
        });
    } else {
      this.backendService.getAllAttachment(this.jahr)
        .subscribe(list => {
          this.lstReceipts = list;
          this.cols.push({field: 'cntjournal', header: 'Anzahl Journaleinträge', format: false, sortable: false, filtering: false, filter: undefined })
        });
    }
  }

  back = () => {
    this.ref.close();
  }

}
