/* eslint-disable @typescript-eslint/no-this-alias */
import { Component } from '@angular/core';
import { Receipt } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AttachementShowComponent } from '../attachement-show/attachement-show.component';

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
      {label: 'Schliessen', btnClass: 'p-button-primary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: false, roleNeeded: ''},
      {label: 'Anzeigen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.show, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: true, roleNeeded: ''},
    ];

    if (config.data.type == 'one' && this.journalid) {
      this.backendService.getAttachment(this.journalid, this.jahr)
        .subscribe(list => {
          this.lstReceipts = list;
        });
        this.toolbar.push({label: 'Löschen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.del, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: false, roleNeeded: ''})
    } else {
      this.backendService.getAllAttachment(this.jahr, this.journalid)
        .subscribe(list => {
          this.lstReceipts = list;
          this.cols.push({field: 'cntjournal', header: 'Anzahl Journaleinträge', format: false, sortable: false, filtering: false, filter: undefined })
        });
        if (config.data.type == 'add' && this.journalid) {
          this.toolbar.push({label: 'Hinzufügen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.addAtt, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: false, roleNeeded: ''})
        }
    }
  }

  show = (selRec?: Receipt) => {
    const thisRef = this;
    
    if (selRec)
      thisRef.dialogService.open(AttachementShowComponent, {
        data: {
          receipt:selRec.receipt
        },
        header: 'Attachment anzeigen ' + selRec.receipt,
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true
      });
  }
  
  addAtt = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      thisRef.backendService.addAtt(this.journalid, [selRec,]).subscribe({
        next: () => {
          const ind = thisRef.lstReceipts.findIndex(rec => rec.id === selRec.id);
          thisRef.lstReceipts.splice(ind, 1);
        }
      })
    }

  }

  del = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      thisRef.backendService.delAtt(this.journalid, selRec).subscribe({
        next: () => {
          const ind = thisRef.lstReceipts.findIndex(rec => rec.id === selRec.id);
          thisRef.lstReceipts.splice(ind, 1);
        }
      })
    }
  }

  back = () => {
    this.ref.close();
  }

}
