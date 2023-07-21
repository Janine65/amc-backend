/* eslint-disable @typescript-eslint/no-this-alias */
import { Component } from '@angular/core';
import { Receipt } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AttachementShowComponent } from '../attachement-show/attachement-show.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-attachement-list',
  templateUrl: './attachement-list.component.html',
  styleUrls: ['./attachement-list.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class AttachementListComponent {
  journalid: number;
  jahr: number;
  lstReceipts: Receipt[];
  configType = '';

  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  visible = false;
  selAtt: Receipt = {};

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) {
    this.journalid = config.data.journalid;
    this.jahr = config.data.jahr;
    this.configType = config.data.type;

    this.lstReceipts = [];
    this.cols = [
      { field: 'receipt', header: 'Attachement', format: false, sortable: true, filtering: false, filter: undefined },
      { field: 'bezeichnung', header: 'Beschreibung', format: false, sortable: true, filtering: false, filter: undefined },
    ];

    this.toolbar = [
      { label: 'Schliessen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: false, roleNeeded: '' , isEditFunc: false},
      { label: 'Anzeigen', btnClass: 'p-button-primary p-button-outlined', clickfnc: this.show, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: true, roleNeeded: '' , isEditFunc: false },
    ];

    if (config.data.editable) {
      this.toolbar.push(
        { label: 'Ändern', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.edit, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: false, roleNeeded: 'admin' , isEditFunc: true },
        { label: 'Löschen', btnClass: 'p-button-secondary p-button-outlined p-button-danger', clickfnc: this.del, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: false, roleNeeded: 'admin' , isEditFunc: false }  
       )
    }
    if (this.configType == 'one' && this.journalid) {
      this.backendService.getAttachment(this.journalid, this.jahr)
        .subscribe(list => {
          this.lstReceipts = list;
        });
    } else {
      this.backendService.getAllAttachment(this.jahr, this.journalid)
        .subscribe(list => {
          this.lstReceipts = list;
          this.cols.push({ field: 'cntjournal', header: 'Anzahl Journaleinträge', format: false, sortable: true, filtering: false, filter: undefined, pipe: DecimalPipe, args: '1.0-0' })
        });
      if (this.configType == 'add' && this.journalid) {
        if (config.data.editable) {
          this.toolbar.splice(3, 1);
          this.toolbar.push({ label: 'Hinzufügen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.addAtt, disabledNoSelection: true, disabledWhenEmpty: true, icon: '', isDefault: false, roleNeeded: 'admin' , isEditFunc: false })
        }
      }
    }
  }

  show = (selRec?: Receipt) => {
    const thisRef = this;

    if (selRec)
      thisRef.dialogService.open(AttachementShowComponent, {
        data: {
          receipt: selRec.receipt
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

  edit = (selRec?: Receipt) => {
    //TODO
    const thisRef = this;
    if (selRec) {
      //TODO
      thisRef.selAtt = selRec;
      thisRef.visible = true;
    }
  }

  editAttBez() {
    //TODO
    this.visible = false;
    this.backendService.updReceipt(this.selAtt).subscribe({
      next: () => {
        const ind = this.lstReceipts.findIndex(rec => rec.id === this.selAtt.id);
        this.lstReceipts[ind].bezeichnung = this.selAtt.bezeichnung;
        this.selAtt = {};
      }
    })
  }

  del = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      if (this.configType == 'one') {
        thisRef.backendService.delAtt(this.journalid, selRec).subscribe({
          next: () => {
            const ind = thisRef.lstReceipts.findIndex(rec => rec.id === selRec.id);
            thisRef.lstReceipts.splice(ind, 1);
          }
        })
      } else {
        if (selRec.cntjournal && selRec.cntjournal > 0) {
          thisRef.confirmationService.confirm({
            message: 'Es gibt Journaleinträge, die dieses Attachment verwenden. Bist du sicher, dass du dieses endgültig löschen willst?',
            accept: () => {
              thisRef.backendService.delReceipt(selRec).subscribe(
                {
                  next: () => {
                    thisRef.lstReceipts.splice(thisRef.lstReceipts.indexOf(selRec), 1)
                    thisRef.messageService.add({ summary: "Attachment löschen", detail: "Das Attachment wurde gelöscht", severity: "info", sticky: false })
                  }
                }
              )
            }
          });
        }
      }
    }
  }
  back = () => {
    this.ref.close();
  }

}
